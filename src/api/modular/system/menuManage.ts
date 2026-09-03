import { axiosInstance as axios } from '@/utils/request'

/** 获取当前登录用户的全部应用菜单。 */
export function sysAllAppMenu(parameter: { requestData: { GH: string } }): Promise<any> {
  return axios({
    url: '/BSMenu/allAppMenu',
    method: 'post',
    data: parameter,
  })
}

/** 菜单管理分页列表。 */
export function getMenuPage(parameter: any) {
  return axios({ url: '/BSMenu/GetList', method: 'post', data: parameter })
}

/** 原项目菜单列表接口名称，保留兼容调用方。 */
export const getMenuList = getMenuPage

/** 新增菜单。 */
export function sysMenuAdd(parameter: any) {
  return axios({ url: '/BSMenu/AddMenu', method: 'post', data: parameter })
}

/** 编辑菜单。 */
export function sysMenuEdit(parameter: any) {
  return axios({ url: '/BSMenu/UpdateMenu', method: 'post', data: parameter })
}

/** 删除菜单。 */
export function sysMenuDelete(parameter: any) {
  return axios({ url: '/BSMenu/DeleteMenu', method: 'post', data: parameter })
}

/** 修改菜单状态。 */
export function sysMenuChangeStatus(parameter: any) {
  return axios({ url: '/BSMenu/ChangeStatus', method: 'post', data: parameter })
}
