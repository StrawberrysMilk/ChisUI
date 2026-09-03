import { axiosInstance as axios } from '@/utils/request'

/**
 * 获取登录用户信息
 *
 * @author yubaoshan
 * @date 2020/5/26 19:08
 */
export function getLoginUser (parameter: any): Promise<any> {
  return axios({
    url: '/Login/GetLoginUserInfo',
    method: 'post',
    data: parameter
  })
}

