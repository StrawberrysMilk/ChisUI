/**
 * 系统应用
 *
 * @author zx
 * @date 2025-07-30
 */
import { axiosInstance as axios } from '@/utils/request'

/**
 * 系统应用列表
 *
 * @author zx
 * @date 2025-07-30
 */
export function getAppPage(parameter: any) {
  return axios({
    url: '/BSApp/GetList',
    method: 'post',
    data: parameter,
  })
}

/**
 * 系统应用列表
 *
 * @author zx
 * @date 2025-07-30
 */
export function getAppList(parameter: any) {
  return axios({
    url: '/BSApp/GetAppList',
    method: 'post',
    data: parameter,
  })
}

/**
 * 新增系统应用
 *
 * @author zx
 * @date 2025-07-30
 */
export function sysAppAdd(parameter: any) {
  return axios({
    url: '/BSApp/AddApp',
    method: 'post',
    data: parameter,
  })
}

/**
 * 编辑系统应用
 *
 * @author zx
 * @param parameter
 * @returns {*}
 */
export function sysAppEdit(parameter: any) {
  return axios({
    url: '/BsApp/UpdateApp',
    method: 'post',
    data: parameter,
  })
}

/**
 * 删除系统应用
 *
 * @author zx
 * @date 2025-07-30
 */
export function sysAppDelete(parameter: any) {
  return axios({
    url: '/BSApp/DeleteApp',
    method: 'post',
    data: parameter,
  })
}

/**
 * 设为默认应用
 *
 * @author zx
 * @date 2025-07-30
 */
export function sysAppSetAsDefault(parameter: any) {
  return axios({
    url: '/BSApp/SetAsDefault',
    method: 'post',
    data: parameter,
  })
}

/**
 * 修改应用状态
 *
 * @author zuohuaijun
 * @date 2021年1月1日
 */
export function sysAppChangeStatus(parameter: any) {
  return axios({
    url: '/BSApp/ChangeUserAppStatus',
    method: 'post',
    data: parameter,
  })
}
