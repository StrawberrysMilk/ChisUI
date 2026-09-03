import { computed, reactive, shallowRef } from 'vue'
import { defineStore } from 'pinia'
import type { MenuListInfoType } from '@/types/global'
import { getConfigName } from '@/api/modular/system/loginManage'
import { setDocumentTitle } from '@/utils/domUtil'
import { SYSTEM_NAME } from '@/store/mutation-types'
import { readSystemName, writeStorage } from '@/utils/storage'
import type { PasswordRequirement } from '@/utils/authEvents'

export interface LoginInfo {
  GH?: string
  XM?: string
  JGBM?: string
  JGMC?: string
  LXDH?: string
  [key: string]: unknown
}

export interface SessionProfile {
  account: string
  name: string
  orgCode: string
  orgName: string
  phone: string
  orgLevel: number | null
  parentOrgCode: string
  departmentCode: string
  departmentName: string
  adminLevel: number | null
  provinceCode: string
  cityCode: string
  countyCode: string
  townCode: string
  villageCode: string
}

const emptyProfile = (): SessionProfile => ({
  account: '', name: '', orgCode: '', orgName: '', phone: '',
  orgLevel: null, parentOrgCode: '', departmentCode: '', departmentName: '',
  adminLevel: null, provinceCode: '', cityCode: '', countyCode: '', townCode: '', villageCode: '',
})

export interface UserApplication {
  id?: string | number
  code: string
  name: string
  active?: string | boolean
  router?: string
  [key: string]: unknown
}

/** 当前会话的结构化用户上下文，替代原项目的 PubUserInfo 原型对象。 */
export const useUserInfoStore = defineStore(
  'userInfo',
  () => {
    const loginInfo = reactive<LoginInfo>({})
    const permissions = shallowRef<string[]>([])
    const apps = shallowRef<UserApplication[]>([])
    const adminType = shallowRef<number | string | null>(null)
    const orgInfo = shallowRef<Record<string, unknown>>({})
    const profile = shallowRef<SessionProfile>(emptyProfile())
    const passwordRequirement = shallowRef<PasswordRequirement | null>(null)
    // 完整响应仅保存在内存中，避免将庞大的 loginData 持久化。
    const loginOutput = shallowRef<Record<string, any>>({})

    const user_info = computed(() => loginInfo)
    const isAuthenticated = computed(() => Boolean(loginInfo.GH))

    function setAuthContext(output: Record<string, any>, info: LoginInfo, nextProfile?: SessionProfile) {
      Object.keys(loginInfo).forEach((key) => delete loginInfo[key])
      Object.assign(loginInfo, info)
      loginOutput.value = output
      permissions.value = Array.isArray(output.permissions) ? output.permissions : []
      apps.value = Array.isArray(output.apps) ? output.apps : []
      adminType.value = output.adminType ?? output.AdminType ?? null
      const outputOrg = output.orgInfo ?? output.orginfo
      orgInfo.value = outputOrg ?? (nextProfile
        ? { orgId: nextProfile.orgCode, orgCode: nextProfile.orgCode, orgName: nextProfile.orgName }
        : {})
      if (nextProfile) profile.value = nextProfile
    }

    function requirePasswordChange(value: PasswordRequirement | null) {
      passwordRequirement.value = value
    }

    function clearAuthContext() {
      Object.keys(loginInfo).forEach((key) => delete loginInfo[key])
      loginOutput.value = {}
      permissions.value = []
      apps.value = []
      adminType.value = null
      orgInfo.value = {}
      profile.value = emptyProfile()
      passwordRequirement.value = null
    }

    return {
      loginInfo,
      user_info,
      loginOutput,
      permissions,
      apps,
      adminType,
      orgInfo,
      profile,
      passwordRequirement,
      isAuthenticated,
      setAuthContext,
      requirePasswordChange,
      clearAuthContext,
    }
  },
  // 身份、权限和应用列表只需要在当前浏览器会话中恢复，不长期留在 localStorage。
  {
    persist: {
      storage: sessionStorage,
      pick: ['loginInfo', 'permissions', 'apps', 'adminType', 'orgInfo', 'profile', 'passwordRequirement'],
    },
  },
)

export const useMenuListStore = defineStore(
  'menuList',
  () => {
    const menu_list = shallowRef<MenuListInfoType[]>([])
    const all_menu = shallowRef<any[]>([])

  function setMenus(allMenu: unknown[], menuDict: MenuListInfoType[]) {
    all_menu.value = allMenu
    menu_list.value = menuDict
  }

  function clearMenus() {
    all_menu.value = []
    menu_list.value = []
  }

    return { menu_list, all_menu, setMenus, clearMenus }
  },
  { persist: { storage: sessionStorage, pick: ['menu_list', 'all_menu'] } },
)

export const useDocumentTitleStore = defineStore('dtTitle', () => {
  const title = shallowRef(readSystemName())

  const fetchTitle = async () => {
    const res = await getConfigName()
    if (!res.success || !res.data) throw new Error(res.message || '未获取到系统名称')
    title.value = String(res.data)
    setDocumentTitle(title.value)
    writeStorage(SYSTEM_NAME, title.value)
  }

  return { title, fetchTitle }
})
