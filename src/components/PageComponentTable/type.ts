import type { PageTableColumn } from '../PageComponent/type'

export type PageComponentTableProps<TData extends Record<string, unknown>> = {
  columns: PageTableColumn<TData>[]
  data: TData[]
  loading?: boolean
  rowKey?: string | ((row: TData, index: number) => string | number)
  emptyText?: string
}

export type PageComponentTableEmits<TData extends Record<string, unknown>> = {
  rowClick: [row: TData, event: MouseEvent]
}

export type PageComponentTableResolvedProps<TData extends Record<string, unknown>> = Readonly<
  PageComponentTableProps<TData>
> &
  Required<Pick<PageComponentTableProps<TData>, 'loading' | 'rowKey' | 'emptyText'>>
