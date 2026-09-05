import type { PagePagination } from '../PageComponent/type'

export type PageComponentPaginationProps = { pagination: PagePagination }

export type PageComponentPaginationEmits = {
  change: [pagination: PagePagination]
}
