<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { Button } from '@/components/ui/button'
import SidebarMenuItem from './SidebarMenuItem.vue'
import type { AppMenuNode, AppShellApplication } from './types'

const props = defineProps<{
  menus: AppMenuNode[]
  activePath: string
  collapsed: boolean
  mobileOpen: boolean
  activeApplication?: AppShellApplication
}>()

const emit = defineEmits<{
  navigate: [node: AppMenuNode]
  toggleCollapsed: []
  closeMobile: []
  requestExpand: []
}>()
</script>

<template>
  <button
    v-if="mobileOpen"
    type="button"
    class="app-sidebar__backdrop"
    aria-label="关闭菜单"
    @click="emit('closeMobile')"
  />
  <aside
    :class="[
      'app-sidebar layout_side',
      { 'app-sidebar--collapsed': collapsed, 'app-sidebar--mobile-open': mobileOpen },
    ]"
  >
    <div class="app-sidebar__mobile-close">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        class="app-sidebar__close"
        aria-label="关闭菜单"
        title="关闭菜单"
        @click="emit('closeMobile')"
      >
        <Icon icon="solar:close-circle-linear" />
      </Button>
    </div>

    <nav class="app-sidebar__navigation" aria-label="功能菜单">
      <ul v-if="menus.length" class="app-sidebar__list">
        <SidebarMenuItem
          v-for="menu in menus"
          :key="menu.id"
          :node="menu"
          :active-path="activePath"
          :collapsed="collapsed"
          @navigate="emit('navigate', $event)"
          @request-expand="emit('requestExpand')"
        />
      </ul>
      <div v-else class="app-sidebar__empty">
        <Icon icon="solar:folder-open-linear" />
        <span v-if="!collapsed">当前业务暂无可用菜单</span>
      </div>
    </nav>

    <div class="app-sidebar__footer">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        class="app-sidebar__collapse"
        :aria-label="collapsed ? '展开侧边栏' : '收起侧边栏'"
        :title="collapsed ? '展开侧边栏' : '收起侧边栏'"
        @click="emit('toggleCollapsed')"
      >
        <Icon
          :icon="
            collapsed ? 'solar:double-alt-arrow-right-linear' : 'solar:double-alt-arrow-left-linear'
          "
        />
      </Button>
    </div>
  </aside>
</template>

<style scoped>
.app-sidebar {
  position: fixed;
  top: 52px;
  bottom: 0;
  left: 0;
  display: flex;
  width: var(--sidebar-width);
  flex-direction: column;
  color: var(--foreground);
  background: var(--background);
  border-right: 1px solid var(--border);
  transition:
    width 180ms ease,
    transform 180ms ease;
}
.app-sidebar__mobile-close {
  display: none;
}
.app-sidebar__close {
  display: none;
}
.app-sidebar__navigation {
  min-height: 0;
  flex: 1;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 10px;
  scrollbar-color: transparent transparent;
  scrollbar-width: thin;
}
.app-sidebar__navigation:hover {
  scrollbar-color: #9ca3af transparent;
}
.app-sidebar__navigation::-webkit-scrollbar {
  width: 8px;
}
.app-sidebar__navigation::-webkit-scrollbar-track {
  background: transparent;
}
.app-sidebar__navigation::-webkit-scrollbar-thumb {
  background: transparent;
  border-radius: 999px;
}
.app-sidebar__navigation:hover::-webkit-scrollbar-thumb {
  background: #9ca3af;
}
.app-sidebar__navigation::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}
.app-sidebar__list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin: 0;
  padding: 0;
}
.app-sidebar__empty {
  display: flex;
  min-height: 160px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--muted-foreground);
  font-size: 13px;
  text-align: center;
}
.app-sidebar__empty svg {
  width: 22px;
  height: 22px;
}
.app-sidebar__footer {
  display: flex;
  min-height: 48px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 12px;
  border-top: 1px solid var(--border);
}
.app-sidebar--collapsed .app-sidebar__navigation {
  padding-inline: 8px;
}
.app-sidebar--collapsed .app-sidebar__footer {
  justify-content: center;
}
.app-sidebar__backdrop {
  display: none;
}

@media (max-width: 900px) {
  .app-sidebar {
    top: 0;
    z-index: 40;
    width: min(82vw, 288px);
    transform: translateX(-100%);
    box-shadow: 12px 0 32px rgb(0 0 0 / 14%);
  }
  .app-sidebar--mobile-open {
    transform: translateX(0);
  }
  .app-sidebar__mobile-close {
    display: flex;
    min-height: 44px;
    align-items: center;
    justify-content: flex-end;
    padding: 0 10px;
    border-bottom: 1px solid var(--border);
  }
  .app-sidebar__close {
    display: inline-flex;
  }
  .app-sidebar__collapse {
    display: none;
  }
  .app-sidebar__backdrop {
    position: fixed;
    inset: 0;
    z-index: 30;
    display: block;
    width: 100%;
    height: 100%;
    padding: 0;
    background: rgb(0 0 0 / 36%);
    border: 0;
  }
}
</style>
