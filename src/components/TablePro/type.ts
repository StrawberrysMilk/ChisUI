import type { PageTableColumn } from '@/components/PageComponent/type'

import type { Component } from 'vue'

export type TableProRequest = (params: any) => Promise<any>

export interface TableProApi {
  get: TableProRequest
  create?: TableProRequest
  update?: TableProRequest
  remove?: TableProRequest
}

export interface TableProFormItem {
  field: string
  label?: string
  type?: 'input' | 'select' | string | Component
  placeholder?: string
  options?: Array<{ label: string; value: string | number }>
  span?: number
  hidden?: boolean
  props?: Record<string, any>
  [key: string]: any
}

export type TableProProps = {
  apis: TableProApi
  columns: PageTableColumn[]
  formItems?: TableProFormItem[]
  rules?: Record<string, any>
  rowKey?: string | ((row: Record<string, unknown>, index: number) => string | number)
}

export type TableProEmits = {
  create: []
  update: [row: Record<string, unknown>]
  remove: [row: Record<string, unknown>]
}

export type TableProResolvedProps = Readonly<TableProProps> &
  Required<Pick<TableProProps, 'formItems' | 'rowKey'>>
