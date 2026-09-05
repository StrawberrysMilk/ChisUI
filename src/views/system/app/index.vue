<script setup lang="ts">
import { onMounted, ref, shallowRef } from 'vue'
import { Icon } from '@iconify/vue'
import { TablePro } from '@/components'
import { Button } from '@/components/ui/button'
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { toast } from 'vue-sonner'
import { cancelableRequest } from '@/utils/cancelTask'
import { hasPerm } from '@/utils/CommonMethod'
import { sysDictTypeDropDown } from '@/api/modular/system/dictManage'
import {
  getAppPage,
  sysAppChangeStatus,
  sysAppDelete,
  sysAppSetAsDefault,
  sysAppAdd,
  sysAppEdit,
} from '@/api/modular/system/appManage'
import type { DataItem } from './type'
import AppFormDialog from './components/AppFormDialog.vue'
import './index.scss'

defineOptions({ name: 'SystemApplicationManagement' })
const queryParams = ref({ name: '', code: '' })
const activeDict = shallowRef<any[]>([])
const statusDict = shallowRef<any[]>([])
const editorMode = ref<'add' | 'edit'>('add')
const appFormDialog = ref<InstanceType<typeof AppFormDialog> | null>(null)
const tablePro = ref<InstanceType<typeof TablePro> | null>(null)

const columns = [
  { field: 'key', title: '序号', width: 72, align: 'center' },
  { field: 'name', title: '应用名称', minWidth: 140 },
  { field: 'code', title: '唯一编码', minWidth: 140 },
  { field: 'active', title: '是否默认', width: 100, align: 'center' },
  { field: 'router', title: '首页路由', minWidth: 160 },
  { field: 'iconBase', title: '显示类图标', width: 120, align: 'center' },
  { field: 'status', title: '状态', width: 100, align: 'center' },
  { field: 'sort', title: '排序', width: 80, align: 'center' },
  { field: 'actions', title: '操作', width: 180, fixed: 'right', align: 'center' },
] as any[]
const formItems = [
  { field: 'name', label: '应用名称', type: 'input', placeholder: '请输入应用名称' },
  { field: 'code', label: '唯一编码', type: 'input', placeholder: '请输入唯一编码' },
]
const apis = { get: getAppPage }
function payload(response: unknown): any {
  const value = response as any
  return value?.success !== undefined
    ? value
    : value?.data?.success !== undefined
      ? value.data
      : (value?.data ?? value)
}
function succeeded(response: unknown) {
  const value = payload(response)?.success
  return (
    value === true ||
    value === 1 ||
    value === '1' ||
    value === 'true' ||
    value === 'Y' ||
    (value !== false && value !== 0 && value !== '0' && value != null)
  )
}
function activeFilter(value: unknown) {
  return activeDict.value.find((item) => String(item.code) === String(value))?.value ?? value ?? '-'
}
function statusFilter(value: unknown) {
  return statusDict.value.find((item) => String(item.code) === String(value))?.value ?? value ?? '-'
}
function openAdd() {
  editorMode.value = 'add'
  appFormDialog.value?.add()
}
function openEdit(row: DataItem) {
  editorMode.value = 'edit'
  appFormDialog.value?.edit(
    {
      id: String(row.id ?? ''),
      name: String(row.name ?? ''),
      code: String(row.code ?? ''),
      router: String(row.router ?? ''),
      sort: Number(row.sort ?? 100),
      active: String(row.active ?? 'N'),
      iconBase: String(row.iconBase ?? ''),
    },
    0,
  )
}
async function saveEditor(values: Record<string, any>, mode: 'add' | 'edit' = editorMode.value) {
  try {
    const response = mode === 'add' ? await sysAppAdd(values) : await sysAppEdit(values)
    if (!succeeded(response)) throw new Error(payload(response)?.message || '保存失败')
    toast.success(mode === 'add' ? '新增成功' : '编辑成功')
    await appFormDialog.value?.close()
    void tablePro.value?.loadData()
    return true
  } catch (error: any) {
    toast.error(error?.message || '保存失败')
    return false
  }
}
async function toggleStatus(row: DataItem) {
  try {
    const response = await cancelableRequest(sysAppChangeStatus, {
      id: row.id,
      status: Number(row.status) === 1 ? 0 : 1,
    })
    if (!succeeded(response)) throw new Error(payload(response)?.message || '状态更新失败')
    toast.success('操作成功')
    await tablePro.value?.loadData()
  } catch (error: any) {
    toast.error(error?.message || '状态更新失败')
  }
}
async function remove(row: DataItem) {
  try {
    const response = await cancelableRequest(sysAppDelete, row)
    if (!succeeded(response)) throw new Error(payload(response)?.message || '删除失败')
    toast.success('操作成功')
    await tablePro.value?.loadData()
  } catch (error: any) {
    toast.error(error?.message || '删除失败')
  }
}
async function setDefault(row: DataItem) {
  try {
    const response = await cancelableRequest(sysAppSetAsDefault, { id: row.id })
    if (!succeeded(response)) throw new Error(payload(response)?.message || '设置失败')
    toast.success('操作成功')
    await tablePro.value?.loadData()
  } catch (error: any) {
    toast.error(error?.message || '设置失败')
  }
}
onMounted(async () => {
  try {
    const [a, s] = await Promise.all([
      sysDictTypeDropDown({ code: 'yes_or_no' }),
      sysDictTypeDropDown({ code: 'common_status' }),
    ])
    activeDict.value = (a as any)?.data ?? []
    statusDict.value = (s as any)?.data ?? []
  } catch {
    activeDict.value = []
    statusDict.value = []
  }
})
</script>

<template>
  <div class="system-page h-full min-h-0 overflow-hidden">
    <TablePro
      ref="tablePro"
      v-model:query-params="queryParams"
      :columns="columns"
      :form-items="formItems"
      :apis="apis"
    >
      <template #actions
        ><Button
          v-if="hasPerm('sysApp:add')"
          type="button"
          variant="outline"
          class="add-app-action"
          @click="openAdd"
          ><Icon icon="lucide:plus" class="size-4" /> 新增应用</Button
        ></template
      >
      <template #bodyCell="{ row, column, value }">
        <template v-if="column === 'iconBase'"
          ><img
            v-if="row.iconBase"
            :src="String(row.iconBase)"
            alt="应用图标"
            class="app-icon"
          /><span v-else class="text-muted-foreground">-</span></template
        >
        <template v-else-if="column === 'active'">{{ activeFilter(row.active) }}</template>
        <Popover v-else-if="column === 'status'"
          ><PopoverTrigger as-child
            ><button class="link-button" @click.stop>
              {{ statusFilter(row.status) }}
            </button></PopoverTrigger
          ><PopoverContent class="confirm-popover" align="center"
            ><p>
              <Icon icon="lucide:circle-alert" class="confirm-popover__icon" />确定{{
                Number(row.status) === 1 ? '停用' : '启用'
              }}该应用？
            </p>
            <div class="confirm-popover__actions">
              <PopoverClose as-child><Button variant="outline" size="sm">取消</Button></PopoverClose
              ><PopoverClose as-child
                ><Button
                  size="sm"
                  class="confirm-popover__confirm text-white"
                  @click.stop="toggleStatus(row as unknown as DataItem)"
                  >确定</Button
                ></PopoverClose
              >
            </div></PopoverContent
          ></Popover
        >
        <div v-else-if="column === 'actions'" class="action-buttons">
          <Button
            v-if="hasPerm('sysApp:edit')"
            variant="link"
            size="sm"
            @click.stop="openEdit(row as unknown as DataItem)"
            >编辑</Button
          ><Popover v-if="hasPerm('sysApp:delete')"
            ><PopoverTrigger as-child
              ><Button variant="link" size="sm" class="text-destructive" @click.stop
                >删除</Button
              ></PopoverTrigger
            ><PopoverContent class="confirm-popover" align="end"
              ><p><Icon icon="lucide:circle-alert" class="confirm-popover__icon" />确认删除？</p>
              <div class="confirm-popover__actions">
                <PopoverClose as-child
                  ><Button variant="outline" size="sm">取消</Button></PopoverClose
                ><PopoverClose as-child
                  ><Button
                    size="sm"
                    class="confirm-popover__confirm text-white"
                    @click.stop="remove(row as unknown as DataItem)"
                    >确定</Button
                  ></PopoverClose
                >
              </div></PopoverContent
            ></Popover
          ><Popover v-if="hasPerm('sysApp:setAsDefault') && String(row.active) !== 'Y'"
            ><PopoverTrigger as-child
              ><Button variant="link" size="sm" @click.stop>设为默认</Button></PopoverTrigger
            ><PopoverContent class="confirm-popover" align="end"
              ><p>
                <Icon icon="lucide:circle-alert" class="confirm-popover__icon" />设置为默认应用？
              </p>
              <div class="confirm-popover__actions">
                <PopoverClose as-child
                  ><Button variant="outline" size="sm">取消</Button></PopoverClose
                ><PopoverClose as-child
                  ><Button
                    size="sm"
                    class="confirm-popover__confirm text-white"
                    @click.stop="setDefault(row as unknown as DataItem)"
                    >确定</Button
                  ></PopoverClose
                >
              </div></PopoverContent
            ></Popover
          >
        </div>
        <span v-else>{{ value ?? '-' }}</span>
      </template>
    </TablePro>
    <AppFormDialog ref="appFormDialog" :on-submit="saveEditor" />
  </div>
</template>
