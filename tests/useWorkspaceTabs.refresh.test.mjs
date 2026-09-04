import assert from 'node:assert/strict'
import test from 'node:test'
import { shallowRef } from 'vue'
import { createServer } from 'vite'

class MemoryStorage {
  #values = new Map()

  getItem(key) {
    return this.#values.get(key) ?? null
  }

  setItem(key, value) {
    this.#values.set(key, String(value))
  }

  removeItem(key) {
    this.#values.delete(key)
  }
}

test('a refresh keeps only home and the current route tab', async (context) => {
  const sessionStorage = new MemoryStorage()
  sessionStorage.setItem(
    'PMUI_WORKSPACE_TABS',
    JSON.stringify([
      { path: '/home', title: '首页', routeName: 'home', closable: false },
      { path: '/system/menu', title: '菜单管理', routeName: 'system-menu', closable: true },
      { path: '/system/app', title: '应用管理', routeName: 'system-app', closable: true },
    ]),
  )
  globalThis.window = { localStorage: new MemoryStorage(), sessionStorage }

  const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' })
  context.after(async () => {
    await server.close()
    delete globalThis.window
  })

  const { useWorkspaceTabs } = await server.ssrLoadModule('/src/composables/useWorkspaceTabs.ts')
  const currentRoute = shallowRef({ path: '/system/app' })
  const router = {
    currentRoute,
    resolve: (path) => ({ name: path === '/system/app' ? 'system-app' : 'unknown' }),
    push: async (path) => {
      currentRoute.value = { path }
    },
  }

  const { tabs } = useWorkspaceTabs({ router, resolveTitle: () => '应用管理' })

  assert.deepEqual(
    tabs.value.map((tab) => tab.path),
    ['/home', '/system/app'],
  )
})
