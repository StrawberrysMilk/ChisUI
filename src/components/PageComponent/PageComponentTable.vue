<script setup lang="ts" generic="TData extends Record<string, unknown>">
import { computed, shallowRef, watch } from 'vue'
import { Icon } from '@iconify/vue'
import type { PageTableColumn } from './types'

const props = withDefaults(
  defineProps<{
    columns: PageTableColumn<TData>[]
    data: TData[]
    loading?: boolean
    rowKey?: string | ((row: TData, index: number) => string | number)
    emptyText?: string
  }>(),
  {
    loading: false,
    rowKey: 'id',
    emptyText: '暂无数据',
  },
)

const emit = defineEmits<{
  rowClick: [row: TData, event: MouseEvent]
}>()

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
</script>

<template>
  <div class="page-table">
    <vxe-table
      class="page-table__table"
      :data="data"
      :row-config="rowConfig"
      :row-class-name="getRowClassName"
      border="none"
      show-overflow
      :empty-text="emptyText"
      @cell-click="handleCellClick"
    >
      <vxe-column
        v-for="(column, index) in columns"
        :key="getColumnKey(column, index)"
        :field="column.field as string"
        :title="column.title"
        :width="column.width"
        :min-width="column.minWidth"
        :fixed="column.fixed"
        :align="column.align"
        :header-align="column.headerAlign"
        :sortable="column.sortable"
        :show-overflow="column.showOverflow ?? true"
      >
        <template #default="{ row }">
          <slot
            name="cell"
            :row="row as TData"
            :column="String(column.key ?? column.field ?? '')"
            :value="getCellValue(row as TData, column)"
          >
            {{ getCellValue(row as TData, column) ?? '-' }}
          </slot>
        </template>
      </vxe-column>
    </vxe-table>
    <div v-if="loading" class="page-table__loading" role="status" aria-live="polite">
      <Icon icon="svg-spinners:180-ring-with-bg" class="page-table__spinner" />
      <span>加载中...</span>
    </div>
  </div>
</template>

<style scoped>
.page-table {
  position: relative;
  min-height: 0;
  height: 100%;
  overflow: auto;
  background: var(--background);
}

.page-table__table {
  min-width: 100%;
  height: 100%;
}

.page-table__loading {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: var(--muted-foreground);
  background: rgb(255 255 255 / 72%);
}
.page-table__spinner {
  width: 28px;
  height: 28px;
  color: var(--primary);
}

.page-table :deep(.vxe-body--row) {
  cursor: pointer;
}

.page-table :deep(.vxe-body--row .vxe-body--column) {
  height: 38px;
  border-bottom: 1px solid var(--border) !important;
}

.page-table :deep(.vxe-body--row.page-table__row--current .vxe-body--column) {
  background-color: #d9f99d !important;
}
</style>
