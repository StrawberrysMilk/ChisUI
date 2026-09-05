import { computed } from 'vue'

import type { SetupContext } from 'vue'

import type { PageComponentPaginationProps, PageComponentPaginationEmits } from './type'

export function usePageComponentPagination(
  props: Readonly<PageComponentPaginationProps>,
  emit: SetupContext<PageComponentPaginationEmits>['emit'],
) {
  const pageCount = computed(() =>
    Math.max(1, Math.ceil(props.pagination.total / props.pagination.pageSize)),
  )

  function changePage(page: number) {
    if (page < 1 || page > pageCount.value || page === props.pagination.current) return
    emit('change', { ...props.pagination, current: page })
  }

  return { pageCount, changePage }
}
