import { computed, shallowRef } from 'vue'
import { defineStore } from 'pinia'
import { getLoginUser } from '@/api'
import { getGHUserInfo, logout as requestLogout } from '@/api/modular/system/loginManage'
import { changePassword as requestChangePassword } from '@/api/modular/system/systemManage'
import { sysAllAppMenu } from '@/api/modular/system/menuManage'
import {
  ACCESS_TOKEN,
  AUTH_ACCOUNT,
  COMPONENT_CACHE,
  CURRENT_TABS,
  DEFAULT_HOME_PAGE,
  LOGIN_INFO,
  TABS_KEYS,
  WORKSPACE_TABS,
} from '@/store/mutation-types'
import { useMenuListStore, useUserInfoStore } from '@/store/global'
import type { LoginInfo, SessionProfile } from '@/store/global'
import { usePermissionStore } from '@/store/permission'
import router from '@/router'
import {
  clearAuthCache,
  readRawStorage,
  readStorage,
  removeStorage,
  writeAuthCache,
  writeRawStorage,
  writeStorage,
} from '@/utils/storage'

interface LoginCredentials {
  gh: string
  mm: string
}

type LoginPayload = Record<string, any>

function valueOf(source: Record<string, any>, ...keys: string[]) {
  const actualKey = Object.keys(source).find((key) =>
    keys.some((candidate) => candidate.toLowerCase() === key.toLowerCase()),
  )
  return actualKey ? source[actualKey] : undefined
}

function toNumber(value: unknown): number | null {
  if (value === '' || value == null) return null
  const result = Number(value)
  return Number.isFinite(result) ? result : null
}

function normalizeLoginInfo(data: LoginPayload, output: LoginPayload): LoginInfo {
  const row = output.loginData?.tmp01?.[0] ?? {}
  let raw = data.loginInfo ?? {}
  if (typeof raw === 'string') {
    try { raw = JSON.parse(raw) } catch { raw = {} }
  }
  const safeRaw = Object.fromEntries(
    Object.entries(raw).filter(([key]) => !['mm', 'password', 'token', 'jti'].includes(key.toLowerCase())),
  )
  return {
    ...safeRaw,
    GH: String(raw.GH ?? raw.gh ?? valueOf(row, 'gh') ?? output.GH ?? output.gh ?? ''),
    XM: String(raw.XM ?? raw.xm ?? valueOf(row, 'xm') ?? output.XM ?? output.xm ?? ''),
    JGBM: String(raw.JGBM ?? raw.jgbm ?? valueOf(row, 'jgbm') ?? output.JGBM ?? output.jgbm ?? ''),
    JGMC: String(raw.JGMC ?? raw.jgmc ?? valueOf(row, 'jgmc') ?? output.JGMC ?? output.jgmc ?? ''),
    LXDH: String(raw.LXDH ?? raw.lxdh ?? valueOf(row, 'lxdh') ?? ''),
  }
}

function buildProfile(output: LoginPayload, info: LoginInfo): SessionProfile {
  const row = output.loginData?.tmp01?.[0] ?? {}
  return {
    account: String(info.GH ?? ''),
    name: String(info.XM ?? ''),
    orgCode: String(info.JGBM ?? ''),
    orgName: String(info.JGMC ?? ''),
    phone: String(info.LXDH ?? ''),
    orgLevel: toNumber(valueOf(row, 'lavel')),
    parentOrgCode: String(valueOf(row, 'pjgbm') ?? ''),
    departmentCode: String(valueOf(row, 'departmentCode') ?? ''),
    departmentName: String(valueOf(row, 'departmentName') ?? ''),
    adminLevel: toNumber(valueOf(row, 'adminLevel')),
    provinceCode: String(valueOf(row, 'dzshen') ?? ''),
    cityCode: String(valueOf(row, 'dzshi') ?? ''),
    countyCode: String(valueOf(row, 'dzxian') ?? ''),
    townCode: String(valueOf(row, 'dzzhen') ?? ''),
    villageCode: String(valueOf(row, 'dzjwh') ?? ''),
  }
}

export const useAuthStore = defineStore('auth', () => {
  const userInfoStore = useUserInfoStore()
  const menuStore = useMenuListStore()
  const permissionStore = usePermissionStore()
  const token = shallowRef(readRawStorage(ACCESS_TOKEN))
  const restoring = shallowRef(false)

  const isAuthenticated = computed(() => Boolean(token.value))
  const routesReady = computed(() => permissionStore.isRoutesGenerated)

  function applyLoginData(data: LoginPayload, options: { requireMenus?: boolean } = {}) {
    const output = data.loginOutput ?? {}
    if (options.requireMenus && (!Array.isArray(output.menus) || !output.menus.length)) {
      throw new Error('无菜单权限，请联系管理员')
    }
    const info = normalizeLoginInfo(data, output)
    const row = output.loginData?.tmp01?.[0] ?? {}
    const accountStatus = valueOf(row, 'sys_status', 'syS_STATUS')
    if (accountStatus != null && String(accountStatus) === '0') {
      throw new Error('该账号已经停用')
    }
    if (!info.GH) throw new Error('登录返回缺少用户工号')

    userInfoStore.setAuthContext(output, info, buildProfile(output, info))
    writeStorage(LOGIN_INFO, info, 'session')
    writeRawStorage(AUTH_ACCOUNT, String(info.GH))

    if (data.token) {
      token.value = String(data.token)
      writeAuthCache({
        token: token.value,
        jti: data.jti,
      })
    }

    if (output.isPwdExpired === true) userInfoStore.requirePasswordChange('expired')
    else if (output.isPwdStrengthValid === false) userInfoStore.requirePasswordChange('complexity')
    else userInfoStore.requirePasswordChange(null)

    return output
  }

  async function login(credentials: LoginCredentials) {
    const response = await getLoginUser(credentials)
    if (!response.success) throw new Error(response.message || '登录失败')
    if (!response.data?.token || !response.data?.loginOutput) throw new Error('登录返回数据不完整')
    return applyLoginData(response.data, { requireMenus: true })
  }

  async function recoverSession() {
    const cachedToken = readRawStorage(ACCESS_TOKEN)
    if (!cachedToken) return false

    token.value = cachedToken
    if (userInfoStore.isAuthenticated && userInfoStore.profile.account) return true
    if (restoring.value) return false

    const cachedInfo = readStorage<LoginInfo>(LOGIN_INFO, {}, 'session')
    const account = String(cachedInfo.GH ?? cachedInfo.gh ?? readRawStorage(AUTH_ACCOUNT))
    if (!account) return false

    restoring.value = true
    try {
      const response = await getGHUserInfo({ GH: account })
      if (!response.success || !response.data?.loginOutput) {
        throw new Error(response.message || '登录信息恢复失败')
      }
      applyLoginData(response.data)
      return true
    } finally {
      restoring.value = false
    }
  }

  async function loadMenuList(account?: string) {
    const resolvedAccount = account || userInfoStore.profile.account || readRawStorage(AUTH_ACCOUNT)
    if (!resolvedAccount) throw new Error('缺少登录工号，无法加载菜单')

    const response = await sysAllAppMenu({ requestData: { GH: resolvedAccount } })
    if (!response.success) throw new Error(response.message || '菜单加载失败')
    const allMenu = Array.isArray(response.data) ? response.data : []
    const menuDict = allMenu
      .flatMap((item: { menus?: unknown[] }) => (Array.isArray(item.menus) ? item.menus : []))
      .filter(Boolean)
    if (!menuDict.length) throw new Error('无菜单权限，请联系管理员')
    menuStore.setMenus(allMenu, menuDict as any[])
    await permissionStore.generateRoutes(menuDict, router)
  }

  async function ensureRoutes() {
    if (permissionStore.isRoutesGenerated) return
    if (menuStore.menu_list.length) {
      await permissionStore.generateRoutes(menuStore.menu_list, router)
      return
    }
    await loadMenuList()
  }

  function clearSession() {
    userInfoStore.clearAuthContext()
    menuStore.clearMenus()
    permissionStore.clearRoutes()
    clearAuthCache()
    ;[COMPONENT_CACHE, CURRENT_TABS, DEFAULT_HOME_PAGE, TABS_KEYS].forEach((key) => removeStorage(key))
    removeStorage(WORKSPACE_TABS, 'session')
    sessionStorage.removeItem('PWD_EXPIRED')
    sessionStorage.removeItem('PWD_COMPLEXITY')
    token.value = ''
  }

  async function logout(options: { notifyServer?: boolean; redirect?: boolean } = {}) {
    const { notifyServer = true, redirect = true } = options
    const currentToken = readRawStorage(ACCESS_TOKEN)
    if (notifyServer && currentToken) {
      try { await requestLogout(currentToken) } catch { /* local logout must still finish */ }
    }
    clearSession()
    if (redirect && router.currentRoute.value.path !== '/login') {
      await router.replace({ path: '/login' })
    }
  }

  async function reauthenticate(password: string) {
    const account = userInfoStore.profile.account || readRawStorage(AUTH_ACCOUNT)
    if (!account) throw new Error('无法获取当前登录账号')
    await login({ gh: account, mm: password })
  }

  async function changePassword(oldPassword: string, newPassword: string) {
    const account = userInfoStore.profile.account || readRawStorage(AUTH_ACCOUNT)
    if (!account) throw new Error('无法获取当前登录账号')
    const response = await requestChangePassword({
      NoParm: true,
      gh: account,
      oldpassword: oldPassword,
      newpassword: newPassword,
    })
    if (!response.success) throw new Error(response.message || '密码修改失败')
    userInfoStore.requirePasswordChange(null)
    await logout({ notifyServer: false })
  }

  return {
    token,
    restoring,
    isAuthenticated,
    routesReady,
    Login: login,
    login,
    restoreFromCache: recoverSession,
    recoverSession,
    LoadMenuList: loadMenuList,
    loadMenuList,
    ensureRoutes,
    clearSession,
    logout,
    reauthenticate,
    changePassword,
  }
})
