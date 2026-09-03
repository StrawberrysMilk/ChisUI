// API 响应类型定义
export interface ApiResponse<T = any> {
  success: boolean;
  code: number;
  message: string;
  data: T;
  extras: any;
  timestamp: number;
}

// 分页数据响应类型 - 直接包含在 data 中
export interface PageData<T = any> {
  pageNo: number;
  pageSize: number;
  rows: T[];
  totalPage: number;
  totalRows: number;
}

// 应用数据项类型
export interface DataItem {
  key?: number;
  id: number;
  name: string;
  code: string;
  active: string;
  router: string;
  icon: string;
  iconBase: string;
  sort: number;
  status: number;
  type: number;
  createdTime: string;
  createdUserId: string | null;
  createdUserName: string | null;
  updatedTime: string;
  updatedUserId: string | null;
  updatedUserName: string | null;
}

// 完整的 API 响应类型
export type AppPageResponse = ApiResponse<PageData<DataItem>>;

// 直接的分页数据类型（用于 responseData）
export type ResponseData = PageData<DataItem>;
