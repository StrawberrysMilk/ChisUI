import { axiosInstance as axios } from '@/utils/request'

export function getConfigName(parameter?: any): Promise<any> {
  return axios({
    url: '/Login/getConfigName',
    method: 'post',
    data: parameter
  })
}

export function getGHUserInfo(parameter: { GH: string }): Promise<any> {
  return axios({
    url: '/Login/GetGHUserInfo',
    method: 'post',
    data: parameter,
  })
}

export function logout(token: string): Promise<any> {
  return axios({
    url: '/Login/Logout',
    method: 'post',
    data: token,
  })
}
