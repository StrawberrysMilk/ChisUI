<script setup lang="ts">
import { computed } from 'vue'
import PageComponentTable from './PageComponentTable.vue'
import PageComponentPagination from './PageComponentPagination.vue'
import { usePageLayout } from './usePageLayout'
import FlexOperationBar from '@/components/FlexOperationBar'
import type { PagePagination, PageTableColumn } from './types'

const props = withDefaults(
  defineProps<{
    columns?: PageTableColumn<Record<string, unknown>>[]
    tableData?: Record<string, unknown>[]
    pagination?: PagePagination
    loading?: boolean
    showAdvanced?: boolean
    emptyText?: string
    rowKey?: string | ((row: Record<string, unknown>, index: number) => string | number)
    numtj?: number
    leftBt?: number
    windoWidth?: number
    rigbtnWidth?: number
    leftbutWidth?: number
    classTagWidth?: number
  }>(),
  {
    columns: () => [],
    tableData: () => [],
    loading: false,
    showAdvanced: false,
    emptyText: '暂无数据',
    rowKey: 'id',
    numtj: 0,
    leftBt: 1,
    windoWidth: 1920,
    rigbtnWidth: 0,
    leftbutWidth: 0,
    classTagWidth: 0,
  },
)

const emit = defineEmits<{
  StartQuery: []
  bindPage: [pagination: PagePagination]
  RowClick: [row: Record<string, unknown>, event: MouseEvent]
  ymqxgjcx: []
}>()

const hasTable = computed(() => props.columns.length > 0)
usePageLayout()
</script>

<template>
  <section class="page-component">
    <div class="page-component__fixed">
      <div v-if="$slots.top" class="page-component__top"><slot name="top" /></div>
      <FlexOperationBar
        v-if="$slots.condition || $slots.actions"
        :show-button="Boolean($slots.actions)"
        :numtj="props.numtj"
        :left-bt="props.leftBt"
        :windo-width="props.windoWidth"
        :rigbtn-width="props.rigbtnWidth"
        :leftbut-width="props.leftbutWidth"
        :class-tag-width="props.classTagWidth"
      >
        <template #cxtj><slot name="condition" /></template>
        <template #otherButton><slot name="actions" /></template>
      </FlexOperationBar>
      <div v-if="showAdvanced && $slots.advanced" class="page-component__advanced">
        <slot name="advanced" />
      </div>
    </div>

    <div class="page-component__content">
      <slot name="left" />
      <div class="page-component__table-wrap">
        <slot name="table" :has-table="hasTable">
          <PageComponentTable
            v-if="hasTable"
            :columns="columns"
            :data="tableData"
            :loading="loading"
            :row-key="rowKey"
            :empty-text="emptyText"
            @row-click="(row, event) => emit('RowClick', row, event)"
          >
            <template #cell="cellProps">
              <slot name="cell" v-bind="cellProps" />
            </template>
          </PageComponentTable>
        </slot>
      </div>
    </div>

    <PageComponentPagination
      v-if="pagination"
      :pagination="pagination"
      @change="(value) => emit('bindPage', value)"
    />
  </section>
</template>

<style scoped>
.page-component {
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;
  overflow: hidden;
  /* Keep the complete page surface white, including the flexible area below the table. */
  background: var(--background);
}

.page-component__fixed {
  flex: 0 0 auto;
}

.page-component__top,
.page-component__query,
.page-component__advanced {
  border-bottom: 1px solid hsl(var(--border));
  background: var(--background);
}

.page-component__query {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 64px;
  padding: 12px 16px;
}

.page-component__condition {
  min-width: 0;
  flex: 1;
}

.page-component__actions {
  flex: 0 0 auto;
}

.page-component__content {
  display: flex;
  min-height: 0;
  flex: 1;
}

.page-component__table-wrap {
  min-width: 0;
  min-height: 0;
  flex: 1;
}
</style>
