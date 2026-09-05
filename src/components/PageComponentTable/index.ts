import type { PageComponentTableResolvedProps } from './type'
import { computed, shallowRef, watch } from 'vue'
import type { PageTableColumn } from '../PageComponent/type'

import type { SetupContext } from 'vue'

import type { PageComponentTableEmits } from './type'

export function usePageComponentTable<TData extends Record<string, unknown>>(
  props: PageComponentTableResolvedProps<TData>,
  emit: SetupContext<PageComponentTableEmits<TData>>['emit'],
) {
  const rowConfig = computed(() => ({
    height: 38,
    ...(typeof props.rowKey === 'string' ? { keyField: props.rowKey } : {}),
  }))

  const currentRowKey = shallowRef<string | number | undefined>(undefined)

  function getRowKey(row: TData, index: number) {
    if (typeof props.rowKey === 'function') return props.rowKey(row, index)
    return (row[props.rowKey] as string | number | undefined) ?? index
  }

  watch(
    () => props.data,
    (data) => {
      if (!data.length) {
        currentRowKey.value = undefined
        return
      }
      const hasCurrentRow = data.some((row, index) => getRowKey(row, index) === currentRowKey.value)
      if (!hasCurrentRow) currentRowKey.value = getRowKey(data[0], 0)
    },
    { immediate: true },
  )

  function getColumnKey(column: PageTableColumn<TData>, index: number) {
    return String(column.key ?? column.field ?? index)
  }

  function getCellValue(row: TData, column: PageTableColumn<TData>) {
    return column.field ? row[column.field] : undefined
  }

  function handleCellClick(params: { row: TData; $event: Event }) {
    const rowIndex = props.data.indexOf(params.row)
    currentRowKey.value = getRowKey(params.row, rowIndex)
    emit('rowClick', params.row, params.$event as MouseEvent)
  }

  function getRowClassName({ row, rowIndex }: { row: TData; rowIndex: number }) {
    return getRowKey(row, rowIndex) === currentRowKey.value ? 'page-table__row--current' : ''
  }

  return { rowConfig, getColumnKey, getCellValue, handleCellClick, getRowClassName }
}
