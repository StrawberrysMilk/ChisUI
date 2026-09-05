<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { Button } from '@/components/ui/button'
import SidebarMenuItem from '../SidebarMenuItem/index.vue'

import type { AppSidebarProps, AppSidebarEmits } from './type'

defineOptions({ name: 'AppSidebar' })

const props = defineProps<AppSidebarProps>()

const emit = defineEmits<AppSidebarEmits>()
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

<style scoped lang="scss" src="./index.scss"></style>
