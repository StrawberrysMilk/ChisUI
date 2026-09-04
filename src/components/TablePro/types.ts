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
