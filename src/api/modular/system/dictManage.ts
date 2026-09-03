import { axiosInstance as axios } from '@/utils/request'

/**
 * 分页查询系统字典类型
 *
 * @author yubaoshan
 * @date 2020/5/17 01:46
 */
export function sysDictTypePage(parameter: any): Promise<any> {
  return axios({
    url: '/sysDictType/page',
    method: 'post',
    data: parameter,
  })
}

/**
 * 添加系统字典类型
 *
 * @author yubaoshan
 * @date 2020/5/17 01:46
 */
export function sysDictTypeAdd(parameter: any): Promise<any> {
  return axios({
    url: '/sysDictType/add',
    method: 'post',
    data: parameter,
  })
}

/**
 * 编辑系统字典类型
 *
 * @author yubaoshan
 * @date 2020/5/17 01:50
 */
export function sysDictTypeEdit(parameter: any): Promise<any> {
  return axios({
    url: '/sysDictType/edit',
    method: 'post',
    data: parameter,
  })
}

/**
 * 删除系统字典类型
 *
 * @author yubaoshan
 * @date 2020/5/17 01:50
 */
export function sysDictTypeDelete(parameter: any): Promise<any> {
  return axios({
    url: '/sysDictType/delete',
    method: 'post',
    data: parameter,
  })
}

/**
 * 获取字典类型下所有字典，举例，返回格式为：[{code:"M",value:"男"},{code:"F",value:"女"}]
 *
 * @author yubaoshan
 * @date 2020/6/10 00:10
 */
export function sysDictTypeDropDown(parameter: any): Promise<any> {
  return axios({
    url: '/BSDict/GetDictTypeDropDown',
    method: 'post',
    data: parameter,
  })
}

/** 兼容原 UICommon.GetDictInfo 使用的系统字典接口。 */
export function GetDictInfo(parameter: any): Promise<any> {
  return axios({ url: '/ZDGL/GetDictInfo', method: 'post', data: parameter })
}

/** 兼容原 UICommon.GetDictInfo 使用的通用字典接口。 */
export function GetDictTYInfo(parameter: any): Promise<any> {
  return axios({ url: '/ZDGL/GetDictTYInfo', method: 'post', data: parameter })
}

/** 获取字典类型元信息。 */
export function GetDicttTypeInfo(parameter: any): Promise<any> {
  return axios({ url: '/ZDGL/GetDicttTypeInfo', method: 'post', data: parameter })
}

/**
 * 获取所有字典，启动时加入缓存使用
 *
 * @author yubaoshan
 * @date 2020/6/10 00:10
 */
export function sysDictTypeTree(parameter: any): Promise<any> {
  return axios({
    url: '/sysDictType/tree',
    method: 'post',
    data: parameter,
  })
}

/**
 * 获取字典列表
 *
 * @author luohao
 * @date 2021年9月16日19:06:20
 */
export function sysDictTypeList(parameter: any): Promise<any> {
  return axios({
    url: '/sysDictType/list',
    method: 'post',
    data: parameter,
  })
}

/**
 * 获取机构列表
 *
 * @author luohao
 * @date 2021年9月16日19:06:20
 */
export function GetOrgList(parameter: any): Promise<any> {
  return axios({
    url: '/sysDictType/GetOrgList',
    method: 'post',
    data: parameter,
  })
}
