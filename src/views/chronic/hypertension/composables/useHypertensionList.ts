import { computed, reactive, shallowRef } from 'vue'
import { toast } from 'vue-sonner'
import {
  deleteGxy,
  getGxyList,
  postGxyManage,
  postGxyNoManage,
  type HypertensionListParams,
} from '@/api/modular/Business/mbgl/gxysfManage'
import type { HypertensionFilters, HypertensionRecord } from '../types'

export function useHypertensionList() {
  const rows = shallowRef<HypertensionRecord[]>([])
  const loading = shallowRef(false)
  const total = shallowRef(0)
  const filters = reactive<HypertensionFilters>({
    searchText: '', searchType: '1', zt: '', iState: '', sftygl: '',
  })
  const pagination = reactive({ pageIndex: 0, pageSize: 20 })
  const pageCount = computed(() => Math.max(1, Math.ceil(total.value / pagination.pageSize)))

  function buildParams(): HypertensionListParams {
    return {
      pageIndex: pagination.pageIndex + 1,
      pageSize: pagination.pageSize,
      searchText: filters.searchText || undefined,
      searchType: filters.searchType,
      zt: filters.zt || undefined,
      iState: filters.iState || undefined,
      sftygl: filters.sftygl || undefined,
    }
  }

  async function loadRows() {
    loading.value = true
    try {
      const response: any = await getGxyList(buildParams())
      rows.value = Array.isArray(response?.data) ? response.data : []
      total.value = Number(response?.pageinfo?.TotalCount ?? rows.value.length)
    } catch (error) {
      rows.value = []
      total.value = 0
      toast.error(error instanceof Error ? error.message : '高血压档案加载失败')
    } finally {
      loading.value = false
    }
  }

  function search() {
    pagination.pageIndex = 0
    return loadRows()
  }

  function resetFilters() {
    Object.assign(filters, { searchText: '', searchType: '1', zt: '', iState: '', sftygl: '' })
    return search()
  }

  async function updateManagement(record: HypertensionRecord, managed: boolean) {
    try {
      const action = managed ? postGxyManage : postGxyNoManage
      await action({ NoParm: true, DAH: record.DAH, XM: record.XM, GUID: record.Guid })
      toast.success(managed ? '已纳入高血压管理' : '已标记为暂不管理')
      await loadRows()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '操作失败')
    }
  }

  async function removeRecord(record: HypertensionRecord) {
    try {
      await deleteGxy({ NoParm: true, DAH: record.DAH, XM: record.XM, GUID: record.Guid })
      toast.success('删除成功')
      await loadRows()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '删除失败')
    }
  }

  function previousPage() {
    if (pagination.pageIndex === 0 || loading.value) return
    pagination.pageIndex -= 1
    void loadRows()
  }

  function nextPage() {
    if (pagination.pageIndex + 1 >= pageCount.value || loading.value) return
    pagination.pageIndex += 1
    void loadRows()
  }

  return {
    filters, loading, loadRows, nextPage, pageCount, pagination, previousPage,
    removeRecord, resetFilters, rows, search, total, updateManagement,
  }
}
