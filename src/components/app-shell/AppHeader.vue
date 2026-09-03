<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { Button } from '@/components/ui/button'
import UserSessionMenu from '@/components/auth/UserSessionMenu.vue'
import BusinessSwitcher from './BusinessSwitcher.vue'
import HeaderNotificationCenter from './HeaderNotificationCenter.vue'
import HeaderSsoMenu from './HeaderSsoMenu.vue'
import type { AppShellApplication } from './types'

defineProps<{
  systemName: string
  applications: AppShellApplication[]
  activeCode: string
  collapsed: boolean
}>()

const emit = defineEmits<{
  selectApplication: [code: string]
  toggleSidebar: []
  openMobileMenu: []
}>()
</script>

<template>
  <header class="app-header layout_head">
    <div class="app-header__brand">
      <div class="app-header__mark" aria-hidden="true">
        <Icon icon="solar:health-bold" />
      </div>
      <span v-show="!collapsed" class="app-header__title">{{ systemName || '公共卫生信息系统' }}</span>
    </div>

    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      class="app-header__desktop-toggle"
      :aria-label="collapsed ? '展开侧边栏' : '收起侧边栏'"
      :title="collapsed ? '展开侧边栏' : '收起侧边栏'"
      @click="emit('toggleSidebar')"
    >
      <Icon :icon="collapsed ? 'solar:hamburger-menu-linear' : 'solar:sidebar-minimalistic-linear'" />
    </Button>
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      class="app-header__mobile-toggle"
      aria-label="打开菜单"
      title="打开菜单"
      @click="emit('openMobileMenu')"
    >
      <Icon icon="solar:hamburger-menu-linear" />
    </Button>

    <BusinessSwitcher
      :applications="applications"
      :active-code="activeCode"
      @select="emit('selectApplication', $event)"
    />

    <div class="app-header__actions">
      <HeaderSsoMenu />
      <HeaderNotificationCenter />
      <span class="app-header__separator" aria-hidden="true" />
      <UserSessionMenu />
    </div>
  </header>
</template>

<style scoped>
.app-header {
  display: flex;
  height: 52px;
  align-items: center;
  gap: 10px;
  padding: 0 16px 0 0;
  color: var(--primary-foreground);
  background: var(--primary);
  border-bottom: 1px solid rgb(255 255 255 / 12%);
}
.app-header__brand {
  display: flex;
  width: var(--sidebar-width);
  min-width: var(--sidebar-width);
  height: 52px;
  align-items: center;
  gap: 10px;
  padding: 0 18px;
  border-right: 1px solid rgb(255 255 255 / 14%);
  transition: width 180ms ease, min-width 180ms ease;
}
.app-header__mark { display: grid; flex: 0 0 auto; place-items: center; font-size: 24px; }
.app-header__title { min-width: 0; overflow: hidden; font-size: 16px; font-weight: 600; text-overflow: ellipsis; white-space: nowrap; }
.app-header__desktop-toggle,
.app-header__mobile-toggle { color: rgb(255 255 255 / 84%); }
.app-header__desktop-toggle:hover,
.app-header__mobile-toggle:hover { color: white; background: rgb(255 255 255 / 12%); }
.app-header__mobile-toggle { display: none; }
.app-header__actions { display: flex; flex: 0 0 auto; align-items: center; gap: 2px; }
.app-header__separator { width: 1px; height: 24px; margin: 0 4px; background: rgb(255 255 255 / 18%); }

@media (max-width: 900px) {
  .app-header { padding-left: 10px; gap: 6px; }
  .app-header__brand { width: auto; min-width: 0; padding: 0 8px; border-right: 0; }
  .app-header__title,
  .app-header__desktop-toggle { display: none; }
  .app-header__mobile-toggle { display: inline-flex; }
  .app-header__separator { display: none; }
}

@media (max-width: 560px) {
  .app-header__actions > :deep(:first-child) { display: none; }
}
</style>
