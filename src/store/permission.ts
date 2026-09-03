import { shallowRef } from 'vue'
import { defineStore } from 'pinia'
import type { RouteRecordRaw, Router } from 'vue-router'
import { generatorDynamicRouter } from '@/router/generator-routers'

export const usePermissionStore = defineStore('permission', () => {
  const routers = shallowRef<RouteRecordRaw[]>([])
  const isRoutesGenerated = shallowRef(false)
  let removeRouteCallbacks: Array<() => void> = []

  async function generateRoutes(data: unknown[], router: Router) {
    if (isRoutesGenerated.value) return routers.value
    const generated = await generatorDynamicRouter(data)
    const root = generated.find((route) => route.path === '/')
    const children = Array.isArray(root?.children) ? root.children : []

    for (const child of children) {
      if (child.name && router.hasRoute(child.name)) continue
      removeRouteCallbacks.push(router.addRoute('index', child))
    }

    routers.value = children
    isRoutesGenerated.value = true
    return routers.value
  }

  function clearRoutes() {
    removeRouteCallbacks.reverse().forEach((removeRoute) => removeRoute())
    removeRouteCallbacks = []
    routers.value = []
    isRoutesGenerated.value = false
  }

  return { routers, addRouters: routers, isRoutesGenerated, generateRoutes, clearRoutes }
}, { persist: false })
