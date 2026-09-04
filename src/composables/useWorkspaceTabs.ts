import { computed, shallowRef, watch } from 'vue'
import type { Router } from 'vue-router'
import type { WorkspaceTab } from '@/components/app-shell/types'

interface UseWorkspaceTabsOptions {
  router: Router
  resolveTitle: (path: string) => string
}

const homeTab: WorkspaceTab = {
  path: '/home',
  title: '首页',
  routeName: 'home',
  closable: false,
}

export function useWorkspaceTabs(options: UseWorkspaceTabsOptions) {
  const tabs = shallowRef<WorkspaceTab[]>([homeTab])
  const refreshKey = shallowRef(0)
  const activePath = computed(() => options.router.currentRoute.value.path)
  const cachedRouteNames = computed(() =>
    tabs.value.map((tab) => tab.routeName).filter((name): name is string => Boolean(name)),
  )

  function addRoute(path: string) {
    if (!path || path === '/login' || tabs.value.some((tab) => tab.path === path)) return
    const resolved = options.router.resolve(path)
    tabs.value = [
      ...tabs.value,
      {
        path,
        title: options.resolveTitle(path),
        routeName: typeof resolved.name === 'string' ? resolved.name : undefined,
        closable: path !== '/home',
      },
    ]
  }

  async function select(path: string) {
    if (path !== activePath.value) await options.router.push(path)
  }

  async function close(path: string) {
    const index = tabs.value.findIndex((tab) => tab.path === path)
    if (index < 0 || !tabs.value[index]?.closable) return

    const nextTabs = tabs.value.filter((tab) => tab.path !== path)
    tabs.value = nextTabs
    if (path === activePath.value) {
      const fallback = nextTabs[Math.max(0, index - 1)] ?? homeTab
      await options.router.push(fallback.path)
    }
  }

  function closeOthers() {
    tabs.value = tabs.value.filter((tab) => tab.path === '/home' || tab.path === activePath.value)
  }

  function closeLeft(path: string) {
    const index = tabs.value.findIndex((tab) => tab.path === path)
    if (index <= 0) return
    tabs.value = tabs.value.filter((tab, tabIndex) => tabIndex === 0 || tabIndex >= index)
  }

  function closeRight(path: string) {
    const index = tabs.value.findIndex((tab) => tab.path === path)
    if (index < 0) return
    tabs.value = tabs.value.filter((tab, tabIndex) => tabIndex <= index)
  }

  async function closeAll() {
    tabs.value = [homeTab]
    if (activePath.value !== '/home') await options.router.push('/home')
  }

  function refresh() {
    refreshKey.value += 1
  }

  watch(() => options.router.currentRoute.value.path, addRoute, { immediate: true })

  return {
    tabs,
    activePath,
    cachedRouteNames,
    refreshKey,
    select,
    close,
    closeOthers,
    closeLeft,
    closeRight,
    closeAll,
    refresh,
  }
}
