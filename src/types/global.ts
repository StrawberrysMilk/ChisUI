// 用户数据 接口
export interface UserInfo {
  id?: number   // id
  username: string  // 用户名
  avatar?: string   // 头像
}
export type UserInfoType = UserInfo

// 菜单信息 接口
export interface MenuListInfo {
  id: number
  name: string,
  icon?: string,
  children: Array<MenuListInfo>
}
export type MenuListInfoType = MenuListInfo
