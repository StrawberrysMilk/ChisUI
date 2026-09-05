import type { PageTableAlignment, PageTableFixed } from './enum'

export interface PageTableColumn<TData = Record<string, unknown>> {
  /** Data field read by vxe-table. Omit for an action or computed column. */
  field?: keyof TData | string
  /** Visible column label. */
  title: string
  /** Stable column identifier for columns without a data field. */
  key?: string
  width?: string | number
  minWidth?: string | number
  fixed?: PageTableFixed
  align?: PageTableAlignment
  headerAlign?: PageTableAlignment
  sortable?: boolean
  showOverflow?: boolean
}

export interface PagePagination {
  current: number
  pageSize: number
  total: number
  pageSizeOptions?: number[]
}

export interface PageTableRowEvent<TData = Record<string, unknown>> {
  row: TData
  event: MouseEvent
}

export type PageComponentProps = {
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
}

export type PageComponentEmits = {
  StartQuery: []
  bindPage: [pagination: PagePagination]
  RowClick: [row: Record<string, unknown>, event: MouseEvent]
  ymqxgjcx: []
}

export type PageComponentResolvedProps = Readonly<PageComponentProps> &
  Required<
    Pick<
      PageComponentProps,
      | 'columns'
      | 'tableData'
      | 'loading'
      | 'showAdvanced'
      | 'emptyText'
      | 'rowKey'
      | 'numtj'
      | 'leftBt'
      | 'windoWidth'
      | 'rigbtnWidth'
      | 'leftbutWidth'
      | 'classTagWidth'
    >
  >
