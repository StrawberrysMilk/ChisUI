import type { TableProResolvedProps } from './type'
import { computed, onMounted, reactive, shallowRef } from 'vue'
import { cancelableRequest } from '@/utils/cancelTask'
import { toast } from 'vue-sonner'
import type { PagePagination } from '@/components/PageComponent/type'
import type { TableProFormItem } from './type'

import type { Ref, SetupContext } from 'vue'

import type { TableProEmits } from './type'

export function useTablePro(
  props: TableProResolvedProps,
  queryParams: Ref<Record<string, any>>,
  emit: SetupContext<TableProEmits>['emit'],
) {
  const rows = shallowRef<Record<string, unknown>[]>([])

  const loading = shallowRef(false)

  const queryLoading = shallowRef(false)

  const pagination = reactive<PagePagination>({
    current: 1,
    pageSize: 20,
    total: 0,
    pageSizeOptions: [20, 30, 50, 100],
  })

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

  onMounted(() => void loadData())

  return {
    rows,
    loading,
    queryLoading,
    pagination,
    visibleFormItems,
    loadData,
    search,
    changePage,
    updateField,
    formItemSpan,
    handleCreate,
  }
}
