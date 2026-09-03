import { axiosInstance as axios } from '@/utils/request'

export interface SsoApplication {
  guid?: string
  yymc?: string
  YYMC?: string
  YYDZ?: string
  yydz?: string
  YYTBFTP?: string
  icon?: string
  [key: string]: unknown
}

export interface ExpiryNotice {
  JGMC?: string
  JSRQ?: string
  SYTS?: number | string
  ZZMC?: string
  [key: string]: unknown
}

export interface SsoCredential {
  queryToken?: string
  gh?: string
  guid?: string
  [key: string]: unknown
}

export function getSsoApplications(): Promise<any> {
  return axios({
    url: '/DSFYYXT/list',
    method: 'post',
    data: { NoParm: true, requestData: { dataInput: {} } },
  })
}

export function getSsoCredential(): Promise<any> {
  return axios({
    url: '/DSFYYXT/clickLogin',
    method: 'post',
    data: { type: 2 },
  })
}

export function getExpiryNotices(orgCode: string): Promise<any> {
  return axios({
    url: '/DZZHGL/GetDQList',
    method: 'post',
    data: {
      NoParm: true,
      requestData: { dataInput: { JGBM: orgCode } },
    },
  })
}
