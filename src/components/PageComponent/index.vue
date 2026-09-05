<script setup lang="ts">
import PageComponentTable from '../PageComponentTable/index.vue'
import PageComponentPagination from '../PageComponentPagination/index.vue'
import FlexOperationBar from '../FlexOperationBar/index.vue'

import type { PageComponentProps, PageComponentEmits } from './type'

import { usePageComponent } from './index'

defineOptions({ name: 'PageComponent' })

const props = withDefaults(defineProps<PageComponentProps>(), {
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
})

const emit = defineEmits<PageComponentEmits>()

const { hasTable } = usePageComponent(props)
</script>

<template>
  <section class="page-component">
    <div v-if="$slots.top" class="page-component__top"><slot name="top" /></div>
    <div class="page-component__body">
      <div v-if="$slots.left" class="page-component__sidebar"><slot name="left" /></div>
      <div class="page-component__main">
        <div class="page-component__fixed">
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
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss" src="./index.scss"></style>
