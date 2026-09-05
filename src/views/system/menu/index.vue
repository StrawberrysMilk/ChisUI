<script setup lang="ts">
import { computed, onMounted, reactive, ref, shallowRef } from 'vue'
import { Icon } from '@iconify/vue'
import { TablePro } from '@/components'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'vue-sonner'
import { cancelableRequest } from '@/utils/cancelTask'
import {
  getMenuList,
  sysMenuAdd,
  sysMenuDelete,
  sysMenuEdit,
} from '@/api/modular/system/menuManage'
import { getAppList } from '@/api/modular/system/appManage'
import { sysDictTypeDropDown } from '@/api/modular/system/dictManage'
import { hasPerm } from '@/utils/CommonMethod'
import MenuFormDialog from './components/MenuFormDialog/index.vue'
import type { MenuItem } from './type'

defineOptions({ name: 'SystemMenuManagement' })
const query = reactive({ searchType: '1', searchText: '', application: '' })
const rows = shallowRef<MenuItem[]>([])
const treeRows = shallowRef<MenuItem[]>([])
const expandedIds = shallowRef<Set<string | number>>(new Set())
const apps = shallowRef<any[]>([])
const typeDict = shallowRef<any[]>([])
const loading = shallowRef(false)
let menuRequestVersion = 0
const tablePro = ref<InstanceType<typeof TablePro> | null>(null)
const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0,
  pageSizeOptions: [20, 30, 50, 100],
})
const menuDialog = ref<InstanceType<typeof MenuFormDialog> | null>(null)
const columns = [
  { field: 'name', title: '菜单名称', minWidth: 200 },
  { field: 'type', title: '菜单类型', width: 100, align: 'center' },
  { field: 'iconBase', title: '图标', width: 80, align: 'center' },
  { field: 'component', title: '组件', minWidth: 160 },
  { field: 'router', title: '路由地址', minWidth: 160 },
  { field: 'sort', title: '排序', width: 80, align: 'center' },
  { field: 'status', title: '状态', width: 90, align: 'center' },
  { key: 'actions', title: '操作', width: 180, fixed: 'right', align: 'center' },
] as any[]
const tableRows = computed(() => rows.value as unknown as Record<string, unknown>[])
function payload(response: any) {
  return response?.data?.success !== undefined ? response.data : response
}
function succeeded(response: any) {
  const p = payload(response)
  return p?.success !== false && p?.success !== 0 && !p?.error
}
function normalizeTree(items: any[], level = 0): MenuItem[] {
  return items.map((item) => ({
    ...item,
    level,
    name: item.name ?? item.title ?? item.meta?.title,
    children: Array.isArray(item.children) ? normalizeTree(item.children, level + 1) : [],
  }))
}
function buildTree(items: any[]) {
  // Flat menu responses often include `children: []` on every row. Treat only
  // non-empty children arrays as an already nested response; otherwise build
  // the hierarchy from parent ids so expand controls remain available.
  if (items.some((item) => Array.isArray(item.children) && item.children.length > 0))
    return normalizeTree(items)
  const nodes = items.map((item) => ({ ...item, children: [] as MenuItem[] }))
  const map = new Map(nodes.map((item) => [String(item.id), item]))
  const roots: MenuItem[] = []
  nodes.forEach((item) => {
    const parentId = item.pid ?? item.parentId ?? item.parent_id ?? 0
    const parent = map.get(String(parentId))
    if (parent && parent !== item) parent.children!.push(item)
    else roots.push(item)
  })
  return normalizeTree(roots)
}
function flattenVisible(items: MenuItem[], output: MenuItem[] = []) {
  items.forEach((item) => {
    output.push(item)
    if (expandedIds.value.has(item.id) && item.children?.length)
      flattenVisible(item.children, output)
  })
  return output
}
function asMenuItem(row: MenuItem | Record<string, unknown>) {
  return row as MenuItem
}
function hasChildren(row: MenuItem | Record<string, unknown>) {
  return Boolean(asMenuItem(row).children?.length)
}
function isExpanded(row: MenuItem | Record<string, unknown>) {
  return expandedIds.value.has(asMenuItem(row).id)
}
function toggleExpanded(row: MenuItem | Record<string, unknown>) {
  const item = asMenuItem(row)
  const next = new Set(expandedIds.value)
  if (next.has(item.id)) next.delete(item.id)
  else next.add(item.id)
  expandedIds.value = next
  rows.value = flattenVisible(treeRows.value)
  tablePro.value?.setRows(tableRows.value)
}
async function loadData(params: Record<string, unknown> = {}) {
  const version = ++menuRequestVersion
  loading.value = true
  try {
    const response: any = await cancelableRequest(getMenuList, { ...params, ...query })
    if (version !== menuRequestVersion) return
    const p = payload(response)
    const page = p?.rows ? p : p?.data?.rows ? p.data : p?.data
    const sourceRows = Array.isArray(page)
      ? page
      : Array.isArray(page?.rows)
        ? page.rows
        : Array.isArray(page?.list)
          ? page.list
          : Array.isArray(page?.records)
            ? page.records
            : Array.isArray(page?.items)
              ? page.items
              : null
    if (!sourceRows) throw new Error(p?.message || '菜单列表加载失败')
    treeRows.value = buildTree(sourceRows)
    expandedIds.value = new Set()
    rows.value = flattenVisible(treeRows.value)
    pagination.total = Array.isArray(page)
      ? page.length
      : (page.totalRows ?? page.total ?? page.totalCount ?? sourceRows.length)
  } catch (error: any) {
    if (version !== menuRequestVersion || error?.name === 'AbortError') return
    treeRows.value = []
    expandedIds.value = new Set()
    rows.value = []
    pagination.total = 0
    toast.error(error?.message || '菜单列表加载失败')
  } finally {
    if (version === menuRequestVersion) loading.value = false
  }
}
async function getMenuTableData(params: Record<string, unknown>) {
  await loadData(params)
  return { rows: tableRows.value, totalRows: pagination.total }
}
function search() {
  pagination.current = 1
  void tablePro.value?.search()
}
function selectApplication(application: unknown) {
  query.application = application == null ? '' : String(application)
  search()
}
function typeName(value: unknown) {
  return typeDict.value.find((item) => String(item.code) === String(value))?.value ?? value ?? '-'
}
function openAdd(parent?: MenuItem | Record<string, unknown>) {
  menuDialog.value?.add(parent as Record<string, any>)
}
function openEdit(row: MenuItem | Record<string, unknown>) {
  menuDialog.value?.edit(row as Record<string, any>)
}
async function submit(values: Record<string, any>, mode: 'add' | 'edit') {
  if (!String(values.name).trim() || !String(values.application).trim())
    return toast.error('请填写菜单名称和所属应用')
  try {
    const response =
      mode === 'add' ? await sysMenuAdd({ ...values }) : await sysMenuEdit({ ...values })
    if (!succeeded(response)) throw new Error(payload(response)?.message || '保存失败')
    toast.success('保存成功')
    await tablePro.value?.loadData()
    return true
  } catch (e: any) {
    toast.error(e?.message || '保存失败')
    return false
  }
}
async function remove(row: MenuItem | Record<string, unknown>) {
  try {
    const response = await cancelableRequest(sysMenuDelete, { id: row.id })
    if (!succeeded(response)) throw new Error(payload(response)?.message || '删除失败')
    toast.success('删除成功')
    await tablePro.value?.loadData()
  } catch (e: any) {
    if (e?.name !== 'AbortError') toast.error(e?.message || '删除失败')
  }
}
onMounted(async () => {
  const [appResult, typeResult] = await Promise.allSettled([
    getAppList({}),
    sysDictTypeDropDown({ code: 'menu_type' }),
  ])
  if (appResult.status === 'fulfilled') {
    const response: any = appResult.value
    const data = response?.data?.rows ?? response?.data?.list ?? response?.data
    apps.value = Array.isArray(data) ? data : []
  } else {
    apps.value = []
  }
  if (typeResult.status === 'fulfilled') {
    typeDict.value = (typeResult.value as any)?.data ?? []
  } else {
    typeDict.value = []
  }
})
</script>

<template>
  <div class="system-page">
    <TablePro ref="tablePro" :columns="columns" :apis="{ get: getMenuTableData }">
      <template #condition
        ><div class="query-fields">
          <Select v-model="query.searchType">
            <SelectTrigger class="query-select" aria-label="查询字段">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="1">菜单名称</SelectItem>
                <SelectItem value="2">菜单编码</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Input
            class="query-input"
            v-model="query.searchText"
            placeholder="请输入查询内容"
            @keyup.enter="search"
          /><Button type="button" class="primary-action" :disabled="loading" @click="search"
            ><Icon
              :icon="loading ? 'svg-spinners:180-ring-with-bg' : 'lucide:search'"
            />查询</Button
          >
        </div></template
      >
      <template #actions
        ><Button
          v-if="hasPerm('sysMenu:add')"
          variant="outline"
          class="secondary-action"
          @click="openAdd()"
          ><Icon icon="lucide:plus" />新增菜单</Button
        ></template
      >
      <template #left
        ><aside class="application-tree">
          <button
            class="application-root"
            :class="{ active: !query.application }"
            @click="selectApplication('')"
          >
            <Icon icon="lucide:chevron-down" />应用列表</button
          ><button
            v-for="item in apps"
            :key="item.code ?? item.id"
            class="application-item"
            :class="{ active: String(query.application) === String(item.code ?? item.id) }"
            @click="selectApplication(item.code ?? item.id)"
          >
            {{ item.name }}
          </button>
        </aside></template
      >
      <template #cell="{ row, column, value }"
        ><template v-if="column === 'name'"
          ><span class="menu-name" :style="{ paddingLeft: `${Number(row.level ?? 0) * 22}px` }"
            ><button
              v-if="hasChildren(row)"
              type="button"
              class="expand-button"
              :aria-label="isExpanded(row) ? '折叠菜单' : '展开菜单'"
              @click.stop="toggleExpanded(row)"
            >
              <Icon
                :icon="isExpanded(row) ? 'lucide:chevron-down' : 'lucide:chevron-right'"
              /></button
            ><span v-else class="expand-placeholder" /><Icon
              :icon="row.level ? 'lucide:corner-down-right' : 'lucide:folder'"
            />{{ value ?? '-' }}</span
          ></template
        ><template v-else-if="column === 'type'">{{ typeName(value) }}</template
        ><template v-else-if="column === 'iconBase'"
          ><img v-if="value" :src="String(value)" alt="菜单图标" class="menu-icon" /><span v-else
            >-</span
          ></template
        ><template v-else-if="column === 'router'">{{ row.router ?? row.path ?? '-' }}</template>
        <div v-else-if="column === 'actions'" class="action-buttons">
          <Button v-if="hasPerm('sysMenu:edit')" variant="link" size="sm" @click="openEdit(row)"
            >编辑</Button
          ><Popover v-if="hasPerm('sysMenu:delete')"
            ><PopoverTrigger as-child
              ><Button variant="link" size="sm" class="text-destructive"
                >删除</Button
              ></PopoverTrigger
            ><PopoverContent class="confirm-popover"
              ><p>删除本菜单与下级？</p>
              <div class="confirm-actions">
                <PopoverClose as-child
                  ><Button variant="outline" size="sm">取消</Button></PopoverClose
                ><PopoverClose as-child
                  ><Button size="sm" @click="remove(row)">确定</Button></PopoverClose
                >
              </div></PopoverContent
            ></Popover
          >
        </div>
        <span v-else>{{ value ?? '-' }}</span>
      </template>
    </TablePro>
    <MenuFormDialog
      ref="menuDialog"
      :apps="apps"
      :tree-rows="treeRows"
      :type-dict="typeDict"
      :on-submit="submit"
    />
  </div>
</template>

<style scoped>
.system-page {
  height: 100%;
  min-height: 0;
  overflow: hidden;
}
.query-fields {
  display: flex;
  align-items: center;
  gap: 0;
  max-width: 760px;
}
.query-select {
  width: 170px;
  border-radius: 6px 0 0 6px;
  border: 1px solid #d9d9d9 !important;
  background: #fff !important;
  color: hsl(var(--foreground)) !important;
  box-shadow: none !important;
}
.query-select:hover,
.query-select[data-state='open'],
.query-select:focus,
.query-select:focus-visible {
  border-color: #4096ff !important;
  background: #fff !important;
  color: hsl(var(--foreground)) !important;
  box-shadow: 0 0 0 2px rgb(64 150 255 / 15%) !important;
}
.query-input {
  width: 240px;
  border-radius: 0;
}
.primary-action {
  margin-left: 10px;
  gap: 8px;
  color: #fff !important;
  background: #1890ff !important;
  border-color: #1890ff !important;
}
.primary-action:hover {
  color: #fff !important;
  background: #40a9ff !important;
  border-color: #40a9ff !important;
}
.secondary-action {
  gap: 8px;
  color: #1677ff !important;
  border-color: #1677ff !important;
  background: #fff !important;
}
.secondary-action:hover {
  color: #4096ff !important;
  border-color: #4096ff !important;
  background: #f5faff !important;
}
.application-tree {
  display: flex;
  flex: 0 0 220px;
  flex-direction: column;
  width: 220px;
  height: 100%;
  padding: 10px 8px;
  background: hsl(var(--background));
}
.application-root,
.application-item {
  display: flex;
  align-items: center;
  gap: 7px;
  min-height: 38px;
  padding: 0 12px;
  border: 0;
  background: transparent;
  color: hsl(var(--foreground));
  text-align: left;
  cursor: pointer;
}
.application-item {
  padding-left: 34px;
}
.application-root.active,
.application-item.active {
  background: #eaf4ff;
  color: #1677ff;
  font-weight: 600;
}
.menu-name {
  display: inline-flex;
  align-items: center;
  gap: 7px;
}
.menu-name :deep(svg) {
  width: 15px;
  height: 15px;
  color: hsl(var(--muted-foreground));
}
.expand-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  padding: 0;
  border: 1px solid hsl(var(--border));
  border-radius: 3px;
  background: hsl(var(--background));
  color: hsl(var(--muted-foreground));
  cursor: pointer;
}
.expand-button :deep(svg) {
  width: 12px;
  height: 12px;
}
.expand-placeholder {
  display: inline-block;
  width: 18px;
}
.menu-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
}
.action-buttons {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 2px;
}
.action-buttons :deep([data-variant='link']) {
  height: auto;
  padding: 0 4px;
  text-decoration: none;
}
.confirm-popover {
  width: 190px;
  padding: 12px;
}
.confirm-popover p {
  margin: 0 0 10px;
}
.confirm-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
.menu-editor-dialog {
  max-width: 520px;
}
.editor-form {
  display: grid;
  gap: 14px;
}
.editor-form label {
  display: grid;
  gap: 6px;
  font-size: 14px;
}
</style>
