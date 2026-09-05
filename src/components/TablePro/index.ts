import type { TableProResolvedProps } from './type'
import { computed, onMounted, reactive, shallowRef, useSlots } from 'vue'
import { useElementSize } from '@vueuse/core'
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
  const slots = useSlots()
  // Read on every render so conditionally supplied slots stay in sync.
  function forwardedSlotNames() {
    return Object.keys(slots).filter(
      (name) => !['condition', 'actions', 'cell', 'bodyCell'].includes(name),
    )
  }

  const fieldsRef = shallowRef<HTMLElement | null>(null)
  const { width: fieldsWidth } = useElementSize(fieldsRef)
  const defaultSpan = computed(() => {
    if (fieldsWidth.value >= 1200) return 6
    if (fieldsWidth.value >= 800) return 8
    if (fieldsWidth.value >= 520) return 12
    return 24
  })
  const rows = shallowRef<Record<string, unknown>[]>([])

  const loading = shallowRef(false)

  const queryLoading = computed(() => loading.value)
  let requestVersion = 0

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
    const version = ++requestVersion
    loading.value = true
    try {
      const response = await cancelableRequest(props.apis.get, {
        pageNo: pagination.current,
        pageSize: pagination.pageSize,
        PageNo: pagination.current,
        PageSize: pagination.pageSize,
        ...queryParams.value,
      })
      if (version !== requestVersion) return
      const payload = responsePayload(response)
      const pageData = payload?.rows ? payload : payload?.data?.rows ? payload.data : payload?.data
      if (!Array.isArray(pageData?.rows)) throw new Error(payload?.message || '列表加载失败')
      rows.value = pageData.rows.map((row: Record<string, unknown>, index: number) => ({
        ...row,
        key: (pagination.current - 1) * pagination.pageSize + index + 1,
      }))
      pagination.total = Number(pageData.totalRows ?? pageData.total ?? 0)
    } catch (error: any) {
      if (version !== requestVersion || error?.name === 'AbortError') return
      rows.value = []
      pagination.total = 0
      if (error?.name !== 'AbortError') toast.error(error?.message || '列表加载失败')
    } finally {
      if (version === requestVersion) loading.value = false
    }
  }

  /** Update rendered rows without issuing another request (for local table interactions). */
  function setRows(nextRows: Record<string, unknown>[]) {
    rows.value = nextRows.map((row, index) => ({
      ...row,
      key: (pagination.current - 1) * pagination.pageSize + index + 1,
    }))
  }

  async function search() {
    if (queryLoading.value) return
    pagination.current = 1
    await loadData()
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
    const span = Math.max(1, Math.min(24, Math.round(item.span ?? defaultSpan.value)))
    // Preserve explicit 24-column spans, expanding controls on narrow workspaces.
    return fieldsWidth.value < 800 ? Math.max(span, defaultSpan.value) : span
  }

  function handleCreate() {
    emit('create')
  }

  onMounted(() => void loadData())

  return {
    forwardedSlotNames,
    fieldsRef,
    defaultSpan,
    rows,
    setRows,
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
