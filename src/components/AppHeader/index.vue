<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { Button } from '@/components/ui/button'
import UserSessionMenu from '@/components/UserSessionMenu/index.vue'
import BusinessSwitcher from '../BusinessSwitcher/index.vue'
import HeaderNotificationCenter from '../HeaderNotificationCenter/index.vue'
import HeaderSsoMenu from '../HeaderSsoMenu/index.vue'

import type { AppHeaderProps, AppHeaderEmits } from './type'

defineOptions({ name: 'AppHeader' })

defineProps<AppHeaderProps>()

const emit = defineEmits<AppHeaderEmits>()
</script>

<template>
  <header class="app-header layout_head">
    <div class="app-header__brand">
      <div class="app-header__mark" aria-hidden="true">
        <Icon icon="solar:health-bold" />
      </div>
      <span v-show="!collapsed" class="app-header__title">{{
        systemName || '公共卫生信息系统'
      }}</span>
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
      <Icon
        :icon="collapsed ? 'solar:hamburger-menu-linear' : 'solar:sidebar-minimalistic-linear'"
      />
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

<style scoped lang="scss" src="./index.scss"></style>
