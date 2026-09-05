<script setup lang="ts">
import { Button } from '@/components/ui/button'

import type { PageComponentPaginationProps, PageComponentPaginationEmits } from './type'

import { usePageComponentPagination } from './index'

defineOptions({ name: 'PageComponentPagination' })

const props = defineProps<PageComponentPaginationProps>()

const emit = defineEmits<PageComponentPaginationEmits>()

const { pageCount, changePage } = usePageComponentPagination(props, emit)
</script>

<template>
  <div v-if="pagination.total > 0" class="page-pagination">
    <span class="page-pagination__total">共 {{ pagination.total }} 条</span>
    <Button
      variant="outline"
      size="sm"
      :disabled="pagination.current <= 1"
      @click="changePage(pagination.current - 1)"
    >
      上一页
    </Button>
    <span class="page-pagination__current">{{ pagination.current }} / {{ pageCount }}</span>
    <Button
      variant="outline"
      size="sm"
      :disabled="pagination.current >= pageCount"
      @click="changePage(pagination.current + 1)"
    >
      下一页
    </Button>
  </div>
</template>

<style scoped lang="scss" src="./index.scss"></style>
