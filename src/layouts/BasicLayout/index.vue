<script setup lang="ts">
import { computed, onMounted, shallowRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import AppHeader from '@/components/app-shell/AppHeader.vue'
import AppSidebar from '@/components/app-shell/AppSidebar.vue'
import WorkspaceTabs from '@/components/app-shell/WorkspaceTabs.vue'
import { buildAppMenuTree, flattenMenu } from '@/components/app-shell/menu'
import type { AppMenuNode, RawMenuItem } from '@/components/app-shell/types'
import { useWorkspaceTabs } from '@/composables/useWorkspaceTabs'
import { useDocumentTitleStore, useMenuListStore, useUserInfoStore } from '@/store/global'
import { ACTIVE_APPLICATION, SIDEBAR_COLLAPSED } from '@/store/mutation-types'
import { readStorage, writeStorage } from '@/utils/storage'

const router = useRouter()
const route = useRoute()
const userInfoStore = useUserInfoStore()
const menuStore = useMenuListStore()
const documentTitleStore = useDocumentTitleStore()

const collapsed = shallowRef(readStorage(SIDEBAR_COLLAPSED, false))
const mobileMenuOpen = shallowRef(false)
const applications = computed(() => userInfoStore.apps)

function getInitialApplication() {
  const cached = readStorage(ACTIVE_APPLICATION, '')
  if (applications.value.some((app) => String(app.code) === cached)) return cached
  const active = applications.value.find((app) => app.active === true || app.active === 'Y')
  return String(active?.code ?? applications.value[0]?.code ?? '')
}

const activeApplicationCode = shallowRef(getInitialApplication())
const activeApplication = computed(() =>
  applications.value.find(
    (application) => String(application.code) === activeApplicationCode.value,
  ),
)
const rawApplicationMenus = computed<RawMenuItem[]>(() => {
  const group = (menuStore.all_menu as Array<{ app?: unknown; menus?: RawMenuItem[] }>).find(
    (item) => String(item.app) === activeApplicationCode.value,
  )
  return Array.isArray(group?.menus) ? group.menus : []
})
const applicationMenus = computed(() => buildAppMenuTree(rawApplicationMenus.value))
const flatApplicationMenus = computed(() => flattenMenu(applicationMenus.value))

function resolveTabTitle(path: string) {
  const applicationMenu = flatApplicationMenus.value.find((item) => item.path === path)
  const rawMenu = (menuStore.menu_list as RawMenuItem[]).find((item) => item.path === path)
  const resolved = router.resolve(path)
  return String(
    applicationMenu?.title ?? rawMenu?.meta?.title ?? rawMenu?.name ?? resolved.meta.title ?? path,
  )
}

function findApplicationCodeByPath(path: string) {
  const groups = menuStore.all_menu as Array<{ app?: unknown; menus?: RawMenuItem[] }>
  const containsPath = (items: RawMenuItem[]): boolean =>
    items.some(
      (item) =>
        String(item.path ?? '') === path ||
        (Array.isArray(item.children) && containsPath(item.children)),
    )
  return groups.find((group) => Array.isArray(group.menus) && containsPath(group.menus))?.app
}

const {
  tabs,
  activePath,
  cachedRouteNames,
  refreshKey,
  select: selectTab,
  close: closeTab,
  closeLeft,
  closeRight,
  closeAll,
} = useWorkspaceTabs({ router, resolveTitle: resolveTabTitle })

function toggleSidebar() {
  collapsed.value = !collapsed.value
  writeStorage(SIDEBAR_COLLAPSED, collapsed.value)
}

function expandSidebar() {
  if (!collapsed.value) return
  collapsed.value = false
  writeStorage(SIDEBAR_COLLAPSED, false)
}

async function selectApplication(code: string) {
  if (!applications.value.some((application) => String(application.code) === code)) return
  activeApplicationCode.value = code
  writeStorage(ACTIVE_APPLICATION, code)
  mobileMenuOpen.value = false

  const application = applications.value.find((item) => String(item.code) === code)
  const group = (menuStore.all_menu as Array<{ app?: unknown; menus?: RawMenuItem[] }>).find(
    (item) => String(item.app) === code,
  )
  if ((!group?.menus || group.menus.length === 0) && application?.router) {
    await router.push(String(application.router))
  }
}

const externalRouteNames = new Set(['zkzxdp', 'ldjsc', 'wsydp'])

async function navigateMenu(node: AppMenuNode) {
  mobileMenuOpen.value = false
  if (node.path.startsWith('http')) {
    window.open(node.path, '_blank', 'noopener,noreferrer')
    return
  }

  if (
    node.target === '_blank' ||
    externalRouteNames.has(node.routeName) ||
    externalRouteNames.has(node.path)
  ) {
    const target =
      node.routeName && router.hasRoute(node.routeName)
        ? router.resolve({ name: node.routeName })
        : router.resolve(node.path)
    window.open(target.href, '_blank', 'noopener,noreferrer')
    return
  }

  try {
    const ownerCode = findApplicationCodeByPath(node.path)
    if (ownerCode != null && String(ownerCode) !== activeApplicationCode.value) {
      activeApplicationCode.value = String(ownerCode)
      writeStorage(ACTIVE_APPLICATION, String(ownerCode))
    }
    if (node.path) await router.push(node.path)
    else if (node.routeName && router.hasRoute(node.routeName))
      await router.push({ name: node.routeName })
    else toast.error('该菜单暂未配置可访问页面')
  } catch {
    toast.error('页面导航失败')
  }
}

watch(
  applications,
  () => {
    if (!applications.value.some((app) => String(app.code) === activeApplicationCode.value)) {
      activeApplicationCode.value = getInitialApplication()
    }
  },
  { immediate: true },
)

watch(
  () => route.path,
  () => {
    mobileMenuOpen.value = false
    const ownerCode = findApplicationCodeByPath(route.path)
    if (ownerCode != null && String(ownerCode) !== activeApplicationCode.value) {
      activeApplicationCode.value = String(ownerCode)
      writeStorage(ACTIVE_APPLICATION, String(ownerCode))
    }
  },
)

onMounted(async () => {
  if (!documentTitleStore.title) {
    try {
      await documentTitleStore.fetchTitle()
    } catch {
      /* the cached fallback remains visible */
    }
  }
})
</script>

<template>
  <div class="app-shell" :style="{ '--sidebar-width': collapsed ? '64px' : '200px' }">
    <AppHeader
      :system-name="documentTitleStore.title"
      :applications="applications"
      :active-code="activeApplicationCode"
      :collapsed="collapsed"
      @select-application="selectApplication"
      @toggle-sidebar="toggleSidebar"
      @open-mobile-menu="mobileMenuOpen = true"
    />

    <AppSidebar
      :menus="applicationMenus"
      :active-path="route.path"
      :collapsed="collapsed"
      :mobile-open="mobileMenuOpen"
      :active-application="activeApplication"
      @navigate="navigateMenu"
      @toggle-collapsed="toggleSidebar"
      @request-expand="expandSidebar"
      @close-mobile="mobileMenuOpen = false"
    />

    <main class="app-workspace">
      <WorkspaceTabs
        :tabs="tabs"
        :active-path="activePath"
        @select="selectTab"
        @close="closeTab"
        @close-left="closeLeft"
        @close-right="closeRight"
        @close-all="closeAll"
      />
      <section class="app-workspace__content">
        <RouterView v-slot="{ Component }">
          <KeepAlive :include="cachedRouteNames">
            <component :is="Component" :key="`${route.fullPath}:${refreshKey}`" />
          </KeepAlive>
        </RouterView>
      </section>
    </main>
  </div>
</template>

<style scoped>
.app-shell {
  height: 100vh;
  min-height: 0;
  overflow: hidden;
  color: var(--foreground);
  background: var(--muted);
}
.app-workspace {
  display: flex;
  flex-direction: column;
  min-width: 0;
  height: calc(100vh - 52px);
  min-height: 0;
  margin-left: var(--sidebar-width);
  transition: margin-left 180ms ease;
}
.app-workspace__content {
  flex: 1;
  height: auto;
  min-height: 0;
  overflow: hidden;
  padding: 16px;
  background: color-mix(in oklab, var(--muted) 72%, var(--background));
}
.app-workspace__content > :deep(*) {
  min-width: 0;
}

@media (max-width: 900px) {
  .app-workspace {
    margin-left: 0;
  }
  .app-workspace__content {
    padding: 10px;
  }
}
</style>
