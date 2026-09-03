import router from './router'
import NProgress from 'nprogress'
import { toast } from 'vue-sonner'
import { ACCESS_TOKEN, DEFAULT_HOME_PAGE } from '@/store/mutation-types'
import { useAuthStore } from '@/store/authStore'
import { useUserInfoStore } from '@/store/global'
import { readRawStorage, writeStorage } from '@/utils/storage'

const loginPath = '/login'
const whiteList = new Set(['/login', '/404'])

function requestedPath(value: unknown) {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) return ''
  return value
}

function defaultPath() {
  const apps = useUserInfoStore().apps
  const activeApp = apps.find((app) => app.active === true || app.active === 'Y')
  return requestedPath(activeApp?.router) || '/home'
}

router.beforeEach(async (to) => {
  NProgress.start()
  const authStore = useAuthStore()
  const hasToken = Boolean(readRawStorage(ACCESS_TOKEN))

  document.title = (to.meta.title as string) || '默认标题'

  if (to.path === loginPath) {
    if (!hasToken) {
      authStore.clearSession()
      return true
    }
    try {
      const recovered = await authStore.recoverSession()
      if (!recovered) {
        authStore.clearSession()
        return true
      }
      await authStore.ensureRoutes()
      return { path: defaultPath(), replace: true }
    } catch {
      authStore.clearSession()
      return true
    }
  }

  if (whiteList.has(to.path)) return true

  if (!hasToken) {
    authStore.clearSession()
    return { path: loginPath, query: { redirect: to.fullPath } }
  }

  try {
    const recovered = await authStore.recoverSession()
    if (!recovered) throw new Error('登录信息已失效')

    const routesWereReady = authStore.routesReady
    await authStore.ensureRoutes()

    if (to.path === '/') return { path: defaultPath(), replace: true }

    if (!routesWereReady && to.name === 'NotFound') {
      const resolved = router.resolve(to.fullPath)
      if (resolved.name && resolved.name !== 'NotFound') {
        return { path: to.fullPath, replace: true }
      }
    }

    if (router.resolve(to.fullPath).name === 'NotFound') return { path: '/404', replace: true }
    return true
  } catch (error) {
    authStore.clearSession()
    toast.error(error instanceof Error ? error.message : '登录状态恢复失败，请重新登录')
    return { path: loginPath, query: { redirect: to.fullPath } }
  }
})

router.afterEach((to) => {
  NProgress.done()
  if (to.path === '/home') {
    writeStorage(DEFAULT_HOME_PAGE, {
      path: to.path,
      name: to.name,
      params: to.params,
      query: to.query,
      meta: to.meta,
      fullPath: to.fullPath,
    })
  }
  window._axiosPromiseArr = []
})

router.onError(() => NProgress.done())

export default router
