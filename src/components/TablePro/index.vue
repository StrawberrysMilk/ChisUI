<script setup lang="ts">
import { Icon } from '@iconify/vue'
import PageComponent from '@/components/PageComponent/index.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import type { TableProProps, TableProEmits } from './type'

import { useTablePro } from './index'

defineOptions({ name: 'TablePro' })

const props = withDefaults(defineProps<TableProProps>(), { formItems: () => [], rowKey: 'id' })

const queryParams = defineModel<Record<string, any>>('queryParams', { default: () => ({}) })

const emit = defineEmits<TableProEmits>()

const {
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
} = useTablePro(props, queryParams, emit)

defineExpose({ loadData, search, queryParams, pagination })
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
                <SelectTrigger class="table-pro__control"
                  ><SelectValue :placeholder="item.placeholder ?? `请选择${item.label ?? ''}`"
                /></SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="option in item.options ?? []"
                    :key="String(option.value)"
                    :value="String(option.value)"
                    >{{ option.label }}</SelectItem
                  >
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
            <Icon
              :icon="queryLoading ? 'svg-spinners:180-ring-with-bg' : 'lucide:search'"
              class="size-4"
            />
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

<style scoped lang="scss" src="./index.scss"></style>
