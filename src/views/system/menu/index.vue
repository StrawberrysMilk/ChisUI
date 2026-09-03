<script setup lang="ts">
import { computed, onMounted, reactive, shallowRef } from 'vue'
import { Icon } from '@iconify/vue'
import PageComponent from '@/components/PageComponent/PageComponent.vue'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { toast } from 'vue-sonner'
import { getMenuList, sysMenuAdd, sysMenuDelete, sysMenuEdit } from '@/api/modular/system/menuManage'
import { getAppList } from '@/api/modular/system/appManage'
import { sysDictTypeDropDown } from '@/api/modular/system/dictManage'
import { hasPerm } from '@/utils/CommonMethod'
import type { MenuItem } from './index'

defineOptions({ name: 'SystemMenuManagement' })
const query = reactive({ searchType: '1', searchText: '', application: '' })
const rows = shallowRef<MenuItem[]>([])
const apps = shallowRef<any[]>([])
const typeDict = shallowRef<any[]>([])
const loading = shallowRef(false)
const pagination = reactive({ current: 1, pageSize: 20, total: 0, pageSizeOptions: [20, 30, 50, 100] })
const editorOpen = shallowRef(false)
const editorMode = shallowRef<'add' | 'edit'>('add')
const editorLoading = shallowRef(false)
const form = reactive<any>({ id: '', pid: 0, application: '', name: '', title: '', router: '', component: '', iconBase: '', sort: 100, type: 1 })
const columns = [
  { field: 'name', title: '菜单名称', minWidth: 200 }, { field: 'type', title: '菜单类型', width: 100, align: 'center' },
  { field: 'iconBase', title: '图标', width: 80, align: 'center' }, { field: 'component', title: '组件', minWidth: 160 },
  { field: 'router', title: '路由地址', minWidth: 160 },
  { field: 'sort', title: '排序', width: 80, align: 'center' }, { field: 'status', title: '状态', width: 90, align: 'center' },
  { key: 'actions', title: '操作', width: 180, fixed: 'right', align: 'center' },
] as any[]
const tableRows = computed(() => rows.value as unknown as Record<string, unknown>[])
function payload(response: any) { return response?.data?.success !== undefined ? response.data : response }
function succeeded(response: any) { const p = payload(response); return p?.success !== false && p?.success !== 0 && !p?.error }
function flatten(items: any[], level = 0, output: MenuItem[] = []) { items.forEach((item) => { output.push({ ...item, level, name: item.name ?? item.title ?? item.meta?.title }); if (Array.isArray(item.children)) flatten(item.children, level + 1, output) }); return output }
async function loadData() {
  loading.value = true
  try {
    const response: any = await getMenuList({ ...query })
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
    rows.value = flatten(sourceRows)
    pagination.total = Array.isArray(page) ? page.length : page.totalRows ?? page.total ?? page.totalCount ?? sourceRows.length
  } catch (error: any) { rows.value = []; pagination.total = 0; toast.error(error?.message || '菜单列表加载失败') } finally { loading.value = false }
}
function changePage(next: any) { Object.assign(pagination, next); loadData() }
function search() { pagination.current = 1; loadData() }
function typeName(value: unknown) { return typeDict.value.find((item) => String(item.code) === String(value))?.value ?? value ?? '-' }
function openAdd(parent?: MenuItem | Record<string, unknown>) { editorMode.value = 'add'; Object.assign(form, { id: '', pid: parent?.id ?? 0, application: parent?.application ?? apps.value[0]?.code ?? '', name: '', title: '', router: '', component: '', iconBase: '', sort: 100, type: 1 }); editorOpen.value = true }
function openEdit(row: MenuItem | Record<string, unknown>) { editorMode.value = 'edit'; Object.assign(form, { ...row, title: row.title ?? row.name }); editorOpen.value = true }
async function submit() { if (!String(form.name).trim() || !String(form.application).trim()) return toast.error('请填写菜单名称和所属应用'); editorLoading.value = true; try { const response = editorMode.value === 'add' ? await sysMenuAdd({ ...form }) : await sysMenuEdit({ ...form }); if (!succeeded(response)) throw new Error(payload(response)?.message || '保存失败'); toast.success('保存成功'); editorOpen.value = false; await loadData() } catch (e: any) { toast.error(e?.message || '保存失败') } finally { editorLoading.value = false } }
async function remove(row: MenuItem | Record<string, unknown>) { try { const response = await sysMenuDelete({ id: row.id }); if (!succeeded(response)) throw new Error(payload(response)?.message || '删除失败'); toast.success('删除成功'); await loadData() } catch (e: any) { toast.error(e?.message || '删除失败') } }
onMounted(async () => {
  try {
    const response: any = await getAppList({})
    const data = response?.data?.rows ?? response?.data?.list ?? response?.data
    apps.value = Array.isArray(data) ? data : []
  } catch { apps.value = [] }
  try { const response: any = await sysDictTypeDropDown({ code: 'menu_type' }); typeDict.value = response?.data ?? [] } catch { typeDict.value = [] }
  loadData()
})
</script>

<template>
  <div class="system-page"><PageComponent :columns="columns" :table-data="tableRows" :pagination="pagination" :loading="loading" @bind-page="changePage">
    <template #condition><div class="query-fields"><select v-model="query.searchType" class="query-select"><option value="1">菜单名称</option><option value="2">菜单编码</option></select><Input class="query-input" v-model="query.searchText" placeholder="请输入查询内容" @keyup.enter="search" /><Button type="button" class="primary-action" @click="search"><Icon icon="lucide:search" />查询</Button></div></template>
    <template #actions><Button v-if="hasPerm('sysMenu:add')" class="primary-action" @click="openAdd()"><Icon icon="lucide:plus" />新增菜单</Button></template>
    <template #left><aside class="application-tree"><button class="application-root" :class="{ active: !query.application }" @click="query.application = ''; search()"><Icon icon="lucide:chevron-down" />应用列表</button><button v-for="item in apps" :key="item.code ?? item.id" class="application-item" :class="{ active: String(query.application) === String(item.code ?? item.id) }" @click="query.application = String(item.code ?? item.id); search()">{{ item.name }}</button></aside></template>
    <template #cell="{ row, column, value }"><template v-if="column === 'name'"><span class="menu-name" :style="{ paddingLeft: `${Number(row.level ?? 0) * 22}px` }"><Icon :icon="row.level ? 'lucide:corner-down-right' : 'lucide:folder'" />{{ value ?? '-' }}</span></template><template v-else-if="column === 'type'">{{ typeName(value) }}</template><template v-else-if="column === 'iconBase'"><img v-if="value" :src="String(value)" alt="菜单图标" class="menu-icon" /><span v-else>-</span></template><template v-else-if="column === 'router'">{{ row.router ?? row.path ?? '-' }}</template><div v-else-if="column === 'actions'" class="action-buttons"><Button v-if="hasPerm('sysMenu:edit')" variant="link" size="sm" @click="openEdit(row)">编辑</Button><Popover v-if="hasPerm('sysMenu:delete')"><PopoverTrigger as-child><Button variant="link" size="sm" class="text-destructive">删除</Button></PopoverTrigger><PopoverContent class="confirm-popover"><p>删除本菜单与下级？</p><div class="confirm-actions"><PopoverClose as-child><Button variant="outline" size="sm">取消</Button></PopoverClose><PopoverClose as-child><Button size="sm" @click="remove(row)">确定</Button></PopoverClose></div></PopoverContent></Popover></div><span v-else>{{ value ?? '-' }}</span></template>
  </PageComponent><Dialog v-model:open="editorOpen"><DialogContent class="menu-editor-dialog"><DialogHeader><DialogTitle>{{ editorMode === 'add' ? '新增菜单' : '编辑菜单' }}</DialogTitle></DialogHeader><div class="editor-form"><label>菜单名称<Input v-model="form.name" placeholder="请输入菜单名称" /></label><label>所属应用<Input v-model="form.application" placeholder="请输入应用编码" /></label><label>路由地址<Input v-model="form.router" placeholder="请输入路由地址" /></label><label>组件路径<Input v-model="form.component" placeholder="请输入组件路径" /></label><label>排序<Input v-model="form.sort" type="number" /></label></div><DialogFooter><Button variant="outline" @click="editorOpen = false">取消</Button><Button :disabled="editorLoading" @click="submit">保存</Button></DialogFooter></DialogContent></Dialog></div>
</template>

<style scoped>
.system-page{height:100%;min-height:0;overflow:hidden}.query-fields{display:flex;align-items:center;gap:0;max-width:760px}.query-select{height:36px;width:170px;padding:0 10px;border:1px solid hsl(var(--border));border-radius:6px 0 0 6px;background:hsl(var(--background));color:hsl(var(--foreground))}.query-input{width:240px;border-radius:0}.query-fields>:deep(button){margin-left:10px;gap:8px}.primary-action{gap:8px;color:#fff!important;background:#1890ff!important;border-color:#1890ff!important}.primary-action:hover{color:#fff!important;background:#40a9ff!important;border-color:#40a9ff!important}.application-tree{display:flex;flex:0 0 220px;flex-direction:column;width:220px;height:100%;padding:10px 8px;background:hsl(var(--background));border-right:1px solid hsl(var(--border))}.application-root,.application-item{display:flex;align-items:center;gap:7px;min-height:38px;padding:0 12px;border:0;background:transparent;color:hsl(var(--foreground));text-align:left;cursor:pointer}.application-item{padding-left:34px}.application-root.active,.application-item.active{background:#eaf4ff;color:#1677ff;font-weight:600}.menu-name{display:inline-flex;align-items:center;gap:7px}.menu-name :deep(svg){width:15px;height:15px;color:hsl(var(--muted-foreground))}.menu-icon{width:20px;height:20px;object-fit:contain}.action-buttons{display:flex;flex-wrap:wrap;gap:2px}.action-buttons :deep([data-variant=link]){height:auto;padding:0 4px;text-decoration:none}.confirm-popover{width:190px;padding:12px}.confirm-popover p{margin:0 0 10px}.confirm-actions{display:flex;justify-content:flex-end;gap:8px}.menu-editor-dialog{max-width:520px}.editor-form{display:grid;gap:14px}.editor-form label{display:grid;gap:6px;font-size:14px}
</style>
