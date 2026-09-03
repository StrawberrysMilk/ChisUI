import { axiosInstance as axios } from '@/utils/request'

export interface ChangePasswordInput {
  NoParm: true
  gh: string
  oldpassword: string
  newpassword: string
}

export function changePassword(parameter: ChangePasswordInput): Promise<any> {
  return axios({
    url: '/System/ChangePassWord',
    method: 'post',
    data: parameter,
  })
}
