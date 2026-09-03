import {
  ACCESS_JTI,
  ACCESS_TOKEN,
  AUTH_ACCOUNT,
  ALL_MENU,
  LOGIN_INFO,
  LOGIN_MENUS,
  LOGIN_USERINFO,
  MENU_DICT,
  SYSTEM_NAME,
} from '@/store/mutation-types'

type StorageArea = 'local' | 'session'

function getArea(area: StorageArea): Storage {
  return area === 'session' ? window.sessionStorage : window.localStorage
}

export function readStorage<T>(key: string, fallback: T, area: StorageArea = 'local'): T {
  try {
    const value = getArea(area).getItem(key)
    if (value == null) return fallback
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

export function readRawStorage(key: string, fallback = '', area: StorageArea = 'local'): string {
  try {
    return getArea(area).getItem(key) ?? fallback
  } catch {
    return fallback
  }
}

export function writeStorage<T>(key: string, value: T, area: StorageArea = 'local') {
  getArea(area).setItem(key, JSON.stringify(value))
}

export function writeRawStorage(key: string, value: string, area: StorageArea = 'local') {
  getArea(area).setItem(key, value)
}

export function removeStorage(key: string, area: StorageArea = 'local') {
  getArea(area).removeItem(key)
}

export function readSystemName() {
  const cached = readStorage<unknown>(SYSTEM_NAME, '')
  return typeof cached === 'string' ? cached : String((cached as { title?: unknown })?.title ?? '')
}

export function writeAuthCache(input: {
  token: string
  jti?: string
}) {
  writeRawStorage(ACCESS_TOKEN, input.token)
  writeRawStorage(ACCESS_JTI, input.jti ?? '')
}

/** 将旧版本长期保存的身份上下文迁移为当前会话缓存。 */
export function migrateLegacyAuthCache() {
  try {
    const loginInfo = window.localStorage.getItem(LOGIN_INFO)
    if (loginInfo != null && window.sessionStorage.getItem(LOGIN_INFO) == null) {
      window.sessionStorage.setItem(LOGIN_INFO, loginInfo)
    }
    let parsedInfo: any = readStorage(LOGIN_INFO, {}, 'session')
    if (typeof parsedInfo === 'string') {
      try { parsedInfo = JSON.parse(parsedInfo) } catch { parsedInfo = {} }
    }
    const account = parsedInfo?.GH ?? parsedInfo?.gh
    if (account && !readRawStorage(AUTH_ACCOUNT)) writeRawStorage(AUTH_ACCOUNT, String(account))
    ;[LOGIN_INFO, LOGIN_MENUS, LOGIN_USERINFO, ALL_MENU, MENU_DICT].forEach((key) => {
      window.localStorage.removeItem(key)
      if (key !== LOGIN_INFO) window.sessionStorage.removeItem(key)
    })
  } catch {
    // Storage can be unavailable in restricted browser contexts.
  }
}

export function clearAuthCache() {
  ;[ACCESS_TOKEN, ACCESS_JTI, AUTH_ACCOUNT].forEach((key) => removeStorage(key))
  ;[LOGIN_INFO, LOGIN_MENUS, LOGIN_USERINFO, ALL_MENU, MENU_DICT, 'pmui:userInfo', 'pmui:user', 'pmui:menuList', 'pmui:login'].forEach((key) => {
    try { window.sessionStorage.removeItem(key) } catch { /* storage may be unavailable */ }
  })
}
