// API 响应类型定义
export interface ApiResponse<T = any> {
  success: boolean
  code: number
  message: string
  data: T
  extras: any
  timestamp: number
}

export interface PageData<T = any> {
  pageNo: number
  pageSize: number
  rows: T[]
  totalPage: number
  totalRows: number
}

export interface DataItem {
  key?: number
  id: number
  name: string
  code: string
  active: string
  router: string
  icon: string
  iconBase: string
  sort: number
  status: number
  type: number
  createdTime: string
  createdUserId: string | null
  createdUserName: string | null
  updatedTime: string
  updatedUserId: string | null
  updatedUserName: string | null
}

export type AppPageResponse = ApiResponse<PageData<DataItem>>
export type ResponseData = PageData<DataItem>
