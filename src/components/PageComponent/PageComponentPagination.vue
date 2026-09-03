<script setup lang="ts">
import { computed } from 'vue'
import { Button } from '@/components/ui/button'
import type { PagePagination } from './types'

const props = defineProps<{ pagination: PagePagination }>()
const emit = defineEmits<{
  change: [pagination: PagePagination]
}>()

const pageCount = computed(() =>
  Math.max(1, Math.ceil(props.pagination.total / props.pagination.pageSize)),
)

function changePage(page: number) {
  if (page < 1 || page > pageCount.value || page === props.pagination.current) return
  emit('change', { ...props.pagination, current: page })
}
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

<style scoped>
.page-pagination {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  min-height: 56px;
  padding: 8px 12px;
  border-top: 8px solid var(--muted);
  background: var(--background);
}

.page-pagination__total,
.page-pagination__current {
  color: hsl(var(--muted-foreground));
  font-size: 13px;
}
</style>
