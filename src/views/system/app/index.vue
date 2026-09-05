<script setup lang="ts">
import {computed, onMounted, reactive, ref, shallowRef, watch} from 'vue'
import {Icon} from '@iconify/vue'
import PageComponent from '@/components/PageComponent/PageComponent.vue'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {Popover, PopoverClose, PopoverContent, PopoverTrigger} from '@/components/ui/popover'
import {toast} from 'vue-sonner'
import {cancelableRequest} from '@/utils/cancelTask'
import {hasPerm} from '@/utils/CommonMethod'
import {sysDictTypeDropDown} from '@/api/modular/system/dictManage'
import {
  getAppPage,
  sysAppChangeStatus,
  sysAppDelete,
  sysAppSetAsDefault,
  sysAppAdd,
  sysAppEdit,
} from '@/api/modular/system/appManage'
import type {DataItem, ResponseData} from './index'
import AppFormDialog from './components/AppFormDialog.vue'
import './index.scss'

defineOptions({name: 'SystemApplicationManagement'})

const queryParam = reactive({name: '', code: ''})
const rows = shallowRef<DataItem[]>([])
const loading = shallowRef(false)
const queryLoading = shallowRef(false)
const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0,
  pageSizeOptions: [20, 30, 50, 100],
})
const activeDict = shallowRef<any[]>([])
const statusDict = shallowRef<any[]>([])
const editorMode = shallowRef<'add' | 'edit'>('add')
const appFormDialog = ref<InstanceType<typeof AppFormDialog> | null>(null)

// 表格列定义
const columns = [
  {field: 'key', title: '序号', width: 72, align: 'center'},
  {field: 'name', title: '应用名称', minWidth: 140},
  {field: 'code', title: '唯一编码', minWidth: 140},
  {field: 'active', title: '是否默认', width: 100, align: 'center'},
  {field: 'router', title: '首页路由', minWidth: 160},
  {field: 'iconBase', title: '显示类图标', width: 120, align: 'center'},
  {field: 'status', title: '状态', width: 100, align: 'center'},
  {field: 'sort', title: '排序', width: 80, align: 'center'},
  {key: 'actions', title: '操作', width: 180, fixed: 'right', align: 'center'},
] as any[]

// 计算属性，确保表格数据类型为 Record<string, unknown>[]
const tableRows = computed(() => rows.value as unknown as Record<string, unknown>[])

/**
 * 获取响应的有效数据
 * @param response
 */
function responsePayload(response: unknown): any {
  const value = response as any
  if (value?.success !== undefined) return value
  if (value?.data?.success !== undefined) return value.data
  return value?.data ?? value
}

/**
 * 判断响应是否成功
 * @param response
 */
function responseSucceeded(response: unknown) {
  const payload = responsePayload(response)
  const success = payload?.success
  return (
      success === true ||
      success === 1 ||
      success === '1' ||
      success === 'true' ||
      success === 'Y' ||
      (success !== false && success !== 0 && success !== '0' && success != null && !payload?.error)
  )
}

/**
 * 状态过滤器
 * @param active
 */
function activeFilter(active: unknown) {
  const item = activeDict.value.find((entry) => String(entry.code) === String(active))
  return item?.value ?? active ?? '-'
}

/**
 * 状态过滤器
 * @param status
 */
function statusFilter(status: unknown) {
  const item = statusDict.value.find((entry) => String(entry.code) === String(status))
  return item?.value ?? status ?? '-'
}

/**
 * 加载应用列表数据
 */
async function loadData() {
  loading.value = true
  try {
    const response = await cancelableRequest(getAppPage, {
      PageNo: pagination.current,
      PageSize: pagination.pageSize,
      pageNo: pagination.current,
      pageSize: pagination.pageSize,
      ...queryParam,
    })
    const rawResponse = response as any
    const payload =
        rawResponse?.success !== undefined ? rawResponse : (rawResponse?.data ?? rawResponse)
    const pageData = Array.isArray(payload?.rows)
        ? payload
        : payload?.data?.rows
            ? payload.data
            : payload?.data
    if (rawResponse?.success === false || !pageData || !Array.isArray(pageData.rows)) {
      rows.value = []
      pagination.total = 0
      toast.error(payload?.message || '应用列表加载失败')
      return
    }
    const data = pageData as ResponseData
    rows.value = (data?.rows ?? []).map((item, index) => ({
      ...item,
      key: (pagination.current - 1) * pagination.pageSize + index + 1,
    }))
    pagination.total = data?.totalRows ?? 0
  } catch (error: any) {
    rows.value = []
    pagination.total = 0
    if (error?.name !== 'AbortError') toast.error(error?.message || '应用列表加载失败')
  } finally {
    loading.value = false
  }
}

/**
 * 加载字典数据
 */
async function loadDicts() {
  try {
    const [activeResponse, statusResponse] = await Promise.all([
      sysDictTypeDropDown({code: 'yes_or_no'}),
      sysDictTypeDropDown({code: 'common_status'}),
    ])
    activeDict.value = (activeResponse as any)?.data ?? []
    statusDict.value = (statusResponse as any)?.data ?? []
  } catch {
    activeDict.value = []
    statusDict.value = []
  }
}

/**
 * 查询应用列表
 */
async function search() {
  if (queryLoading.value) return
  queryLoading.value = true
  pagination.current = 1
  try {
    await loadData()
  } finally {
    queryLoading.value = false
  }
}

/**
 * 分页切换
 * @param next
 */
function changePage(next: { current: number; pageSize: number }) {
  pagination.current = next.current
  pagination.pageSize = next.pageSize
  loadData()
}

/**
 * 打开新增应用弹窗
 */
function openAdd() {
  editorMode.value = 'add'
  appFormDialog.value?.add()
}

/**
 * 打开编辑应用弹窗
 * @param record
 */
function openEdit(record: DataItem) {
  editorMode.value = 'edit'
  appFormDialog.value?.edit({
    id: String(record.id ?? ''),
    name: String(record.name ?? ''),
    code: String(record.code ?? ''),
    router: String(record.router ?? ''),
    sort: Number(record.sort ?? 100),
    active: String(record.active ?? 'N'),
    iconBase: String(record.iconBase ?? ''),
  }, 0)
}

/**
 * 保存应用编辑器数据
 * @param values
 * @param mode
 */
async function saveEditor(values: Record<string, any>, mode: 'add' | 'edit' = editorMode.value) {
  try {
    const response =
        mode === 'add'
            ? await sysAppAdd(values)
            : await sysAppEdit(values)
    const payload = responsePayload(response)
    if (!responseSucceeded(response)) throw new Error(payload?.message || '保存失败')
    toast.success(mode === 'add' ? '新增成功' : '编辑成功')
    await loadData()
    return true
  } catch (error: any) {
    toast.error(error?.message || '保存失败')
    return false
  }
}

/**
 * 切换应用状态
 * @param record
 */
async function toggleStatus(record: DataItem) {
  const status = Number(record.status) === 1 ? 0 : 1
  try {
    const response = await cancelableRequest(sysAppChangeStatus, {id: record.id, status})
    const payload = responsePayload(response)
    if (responseSucceeded(response)) {
      toast.success('操作成功')
      loadData()
    } else {
      toast.error(payload?.message || '状态更新失败')
    }
  } catch (error: any) {
    toast.error(error?.message || '状态更新失败')
  }
}

/**
 * 删除应用
 * @param record
 */
async function remove(record: DataItem) {
  try {
    const response = await cancelableRequest(sysAppDelete, record)
    const payload = responsePayload(response)
    if (responseSucceeded(response)) {
      toast.success('操作成功')
      loadData()
    } else toast.error(payload?.message || '删除失败')
  } catch (error: any) {
    toast.error(error?.message || '删除失败')
  }
}

/**
 * 设置默认应用
 * @param record
 */
async function setDefault(record: DataItem) {
  try {
    const response = await cancelableRequest(sysAppSetAsDefault, {id: record.id})
    const payload = responsePayload(response)
    if (responseSucceeded(response)) {
      toast.success('操作成功')
      loadData()
    } else toast.error(payload?.message || '设置失败')
  } catch (error: any) {
    toast.error(error?.message || '设置失败')
  }
}

/**
 * 监听查询参数变化，重置分页
 */
watch(
    () => [queryParam.name, queryParam.code],
    () => {
      pagination.current = 1
    },
)

onMounted(() => {
  loadDicts()
  loadData()
})
</script>

<template>
  <div class="system-page h-full min-h-0 overflow-hidden">
    <PageComponent
        :columns="columns"
        :table-data="tableRows"
        :pagination="pagination"
        :loading="loading"
        @bind-page="changePage"
    >
      <template #condition>
        <div class="query-fields">
          <span class="query-label">应用名称</span>
          <Input
              class="query-input"
              v-model="queryParam.name"
              placeholder="请输入应用名称"
              @keyup.enter="search"
          />
          <span class="query-label">唯一编码</span>
          <Input
              class="query-input"
              v-model="queryParam.code"
              placeholder="请输入唯一编码"
              @keyup.enter="search"
          />
          <Button
              type="button"
              variant="default"
              class="primary-action"
              :disabled="queryLoading"
              @click="search"
          >
            <Icon
                :icon="queryLoading ? 'svg-spinners:180-ring-with-bg' : 'lucide:search'"
                class="size-4"
            />
            查询
          </Button>
        </div>
      </template>
      <template #actions>
        <Button
            v-if="hasPerm('sysApp:add')"
            type="button"
            variant="outline"
            class="add-app-action"
            @click="openAdd"
        >
          <Icon icon="lucide:plus" class="size-4"/>
          新增应用
        </Button>
      </template>
      <template #cell="{ row, column, value }">
        <template v-if="column === 'iconBase'">
          <img v-if="row.iconBase" :src="String(row.iconBase)" alt="应用图标" class="app-icon"/>
          <span v-else class="text-muted-foreground">-</span>
        </template>
        <template v-else-if="column === 'active'">{{ activeFilter(row.active) }}</template>
        <Popover v-else-if="column === 'status'">
          <PopoverTrigger as-child>
            <button class="link-button" @click.stop>{{ statusFilter(row.status) }}</button>
          </PopoverTrigger>
          <PopoverContent class="confirm-popover" align="center">
            <p>
              <Icon icon="lucide:circle-alert" class="confirm-popover__icon"/>
              确定{{
                Number(row.status) === 1 ? '停用' : '启用'
              }}该应用？
            </p>
            <div class="confirm-popover__actions">
              <PopoverClose as-child
              >
                <Button variant="outline" size="sm" class="confirm-popover__cancel"
                >取消
                </Button
                >
              </PopoverClose
              >
              <PopoverClose as-child
              >
                <Button
                    size="sm"
                    class="confirm-popover__confirm text-white"
                    @click.stop="toggleStatus(row as unknown as DataItem)"
                >确定
                </Button
                >
              </PopoverClose
              >
            </div>
          </PopoverContent>
        </Popover>
        <div v-else-if="column === 'actions'" class="action-buttons">
          <Button
              v-if="hasPerm('sysApp:edit')"
              variant="link"
              size="sm"
              @click.stop="openEdit(row as unknown as DataItem)"
          >编辑
          </Button
          >
          <Popover v-if="hasPerm('sysApp:delete')">
            <PopoverTrigger as-child
            >
              <Button variant="link" size="sm" class="text-destructive" @click.stop
              >删除
              </Button
              >
            </PopoverTrigger
            >
            <PopoverContent class="confirm-popover" align="end">
              <p>
                <Icon icon="lucide:circle-alert" class="confirm-popover__icon"/>
                确认删除？
              </p>
              <div class="confirm-popover__actions">
                <PopoverClose as-child
                >
                  <Button variant="outline" size="sm" class="confirm-popover__cancel"
                  >取消
                  </Button
                  >
                </PopoverClose
                >
                <PopoverClose as-child
                >
                  <Button
                      size="sm"
                      class="confirm-popover__confirm text-white"
                      @click.stop="remove(row as unknown as DataItem)"
                  >确定
                  </Button
                  >
                </PopoverClose
                >
              </div>
            </PopoverContent>
          </Popover>
          <Popover v-if="hasPerm('sysApp:setAsDefault') && String(row.active) !== 'Y'">
            <PopoverTrigger as-child
            >
              <Button variant="link" size="sm" @click.stop>设为默认</Button>
            </PopoverTrigger
            >
            <PopoverContent class="confirm-popover" align="end">
              <p>
                <Icon icon="lucide:circle-alert" class="confirm-popover__icon"/>
                设置为默认应用？
              </p>
              <div class="confirm-popover__actions">
                <PopoverClose as-child
                >
                  <Button variant="outline" size="sm" class="confirm-popover__cancel"
                  >取消
                  </Button
                  >
                </PopoverClose
                >
                <PopoverClose as-child
                >
                  <Button
                      size="sm"
                      class="confirm-popover__confirm text-white"
                      @click.stop="setDefault(row as unknown as DataItem)"
                  >确定
                  </Button
                  >
                </PopoverClose
                >
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <span v-else>{{ value ?? '-' }}</span>
      </template>
    </PageComponent>
    <AppFormDialog ref="appFormDialog" :on-submit="saveEditor" />
  </div>
</template>
