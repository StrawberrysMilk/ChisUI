export interface PageTableColumn<TData = Record<string, unknown>> {
  /** Data field read by vxe-table. Omit for an action or computed column. */
  field?: keyof TData | string
  /** Visible column label. */
  title: string
  /** Stable column identifier for columns without a data field. */
  key?: string
  width?: string | number
  minWidth?: string | number
  fixed?: 'left' | 'right'
  align?: 'left' | 'center' | 'right'
  headerAlign?: 'left' | 'center' | 'right'
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
