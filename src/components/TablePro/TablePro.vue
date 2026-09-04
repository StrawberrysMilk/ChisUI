<script setup lang="ts">
import { computed, onMounted, reactive, shallowRef } from 'vue'
import { Icon } from '@iconify/vue'
import PageComponent from '@/components/PageComponent/PageComponent.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cancelableRequest } from '@/utils/cancelTask'
import { toast } from 'vue-sonner'
import type { PagePagination, PageTableColumn } from '@/components/PageComponent/types'
import type { TableProApi, TableProFormItem } from './types'

defineOptions({ name: 'TablePro' })

const props = withDefaults(
  defineProps<{
    apis: TableProApi
    columns: PageTableColumn[]
    formItems?: TableProFormItem[]
    rules?: Record<string, any>
    rowKey?: string | ((row: Record<string, unknown>, index: number) => string | number)
  }>(),
  { formItems: () => [], rowKey: 'id' },
)

const queryParams = defineModel<Record<string, any>>('queryParams', { default: () => ({}) })
const emit = defineEmits<{ create: []; update: [row: Record<string, unknown>]; remove: [row: Record<string, unknown>] }>()
const rows = shallowRef<Record<string, unknown>[]>([])
const loading = shallowRef(false)
const queryLoading = shallowRef(false)
const pagination = reactive<PagePagination>({ current: 1, pageSize: 20, total: 0, pageSizeOptions: [20, 30, 50, 100] })

const visibleFormItems = computed(() => props.formItems.filter((item) => !item.hidden))

function responsePayload(response: any) {
  if (response?.success !== undefined) return response
  if (response?.data?.success !== undefined) return response.data
  return response?.data ?? response
}

async function loadData() {
  loading.value = true
  try {
    const response = await cancelableRequest(props.apis.get, {
      pageNo: pagination.current,
      pageSize: pagination.pageSize,
      PageNo: pagination.current,
      PageSize: pagination.pageSize,
      ...queryParams.value,
    })
    const payload = responsePayload(response)
    const pageData = payload?.rows ? payload : payload?.data?.rows ? payload.data : payload?.data
    if (!Array.isArray(pageData?.rows)) throw new Error(payload?.message || '列表加载失败')
    rows.value = pageData.rows.map((row: Record<string, unknown>, index: number) => ({
      ...row,
      key: (pagination.current - 1) * pagination.pageSize + index + 1,
    }))
    pagination.total = Number(pageData.totalRows ?? pageData.total ?? 0)
  } catch (error: any) {
    rows.value = []
    pagination.total = 0
    if (error?.name !== 'AbortError') toast.error(error?.message || '列表加载失败')
  } finally {
    loading.value = false
  }
}

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

function changePage(value: PagePagination) {
  pagination.current = value.current
  pagination.pageSize = value.pageSize
  void loadData()
}

function updateField(field: string, value: any) {
  queryParams.value = { ...queryParams.value, [field]: value }
}

function formItemSpan(item: TableProFormItem) {
  // Keep the old Ant grid convention (24 columns) while using a four-column CSS grid.
  return Math.max(1, Math.min(4, Math.ceil((item.span ?? 6) / 6)))
}

function handleCreate() {
  emit('create')
}

defineExpose({ loadData, search, queryParams, pagination })

onMounted(() => void loadData())
</script>

<template>
  <PageComponent
    :columns="columns"
    :table-data="rows"
    :pagination="pagination"
    :loading="loading"
    :row-key="rowKey"
    @bind-page="changePage"
  >
    <template #condition>
      <slot name="condition">
        <div class="table-pro__fields">
          <template v-for="item in visibleFormItems" :key="item.field">
            <label class="table-pro__field" :style="{ gridColumn: `span ${formItemSpan(item)}` }">
              <span v-if="item.label" class="table-pro__label">{{ item.label }}</span>
              <Select
                v-if="item.type === 'select'"
                :model-value="queryParams[item.field]"
                @update:model-value="(value) => updateField(item.field, value)"
              >
                <SelectTrigger class="table-pro__control"><SelectValue :placeholder="item.placeholder ?? `请选择${item.label ?? ''}`" /></SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="option in item.options ?? []" :key="String(option.value)" :value="String(option.value)">{{ option.label }}</SelectItem>
                </SelectContent>
              </Select>
              <Input
                v-else
                v-bind="item.props"
                class="table-pro__control"
                :model-value="queryParams[item.field]"
                :placeholder="item.placeholder ?? `请输入${item.label ?? ''}`"
                @update:model-value="(value) => updateField(item.field, value)"
                @keyup.enter="search"
              />
            </label>
          </template>
          <Button type="button" :disabled="queryLoading" @click="search">
            <Icon :icon="queryLoading ? 'svg-spinners:180-ring-with-bg' : 'lucide:search'" class="size-4" />
            查询
          </Button>
        </div>
      </slot>
    </template>
    <template #actions>
      <slot name="actions">
        <Button type="button" variant="outline" @click="handleCreate">
          <Icon icon="lucide:plus" class="size-4" />
          新增
        </Button>
      </slot>
    </template>
    <template #cell="cellProps">
      <slot name="bodyCell" v-bind="cellProps">
        <slot name="cell" v-bind="cellProps" />
      </slot>
    </template>
  </PageComponent>
</template>

<style scoped>
.table-pro__fields {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  align-items: center;
  gap: 10px 12px;
}
.table-pro__field { display: flex; min-width: 0; align-items: center; gap: 8px; }
.table-pro__label { flex: 0 0 auto; color: hsl(var(--muted-foreground)); font-size: 13px; white-space: nowrap; }
.table-pro__control { min-width: 0; flex: 1; }
@media (max-width: 1100px) { .table-pro__fields { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 640px) { .table-pro__fields { grid-template-columns: 1fr; } }
</style>
