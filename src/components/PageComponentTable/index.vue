<script setup lang="ts" generic="TData extends Record<string, unknown>">
import { Icon } from '@iconify/vue'

import type { PageComponentTableProps, PageComponentTableEmits } from './type'

import { usePageComponentTable } from './index'

defineOptions({ name: 'PageComponentTable' })

const props = withDefaults(defineProps<PageComponentTableProps<TData>>(), {
  loading: false,
  rowKey: 'id',
  emptyText: '暂无数据',
})

const emit = defineEmits<PageComponentTableEmits<TData>>()

const { rowConfig, getColumnKey, getCellValue, handleCellClick, getRowClassName } =
  usePageComponentTable(props, emit)
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

<style scoped lang="scss" src="./index.scss"></style>
