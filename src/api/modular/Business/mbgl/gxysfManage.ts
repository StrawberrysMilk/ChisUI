import { axiosInstance as axios } from '@/utils/request'

export interface HypertensionListParams {
  pageIndex: number
  pageSize: number
  searchText?: string
  searchType?: string
  zt?: string | number
  iState?: string | number
  sftygl?: string | number
}

export function getGxyList(data: HypertensionListParams) {
  return axios({
    url: '/gxy/GetgxyList',
    method: 'post',
    data: {
      objName: 'ORDERBY',
      ORDERBY: 'A.DAH',
      requestData: data,
    },
  })
}

export function postGxyManage(data: Record<string, unknown>) {
  return axios({ url: '/gxy/PostNRGL', method: 'post', data })
}

export function postGxyNoManage(data: Record<string, unknown>) {
  return axios({ url: '/gxy/PostZBGL', method: 'post', data })
}

export function deleteGxy(data: Record<string, unknown>) {
  return axios({ url: '/gxy/DropGxy', method: 'post', data })
}
