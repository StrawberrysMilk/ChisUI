<script setup lang="ts">
import { Icon } from '@iconify/vue'

import type { SidebarMenuItemProps, SidebarMenuItemEmits } from './type'

import { useSidebarMenuItem } from './index'

defineOptions({ name: 'SidebarMenuItem' })

const props = withDefaults(defineProps<SidebarMenuItemProps>(), {
  collapsed: false,
  depth: 0,
})

const emit = defineEmits<SidebarMenuItemEmits>()

const { open, hasChildren, isActive, containsActive, activate } = useSidebarMenuItem(props, emit)
</script>

<template>
  <li class="sidebar-menu-item">
    <button
      type="button"
      :class="[
        'sidebar-menu-item__trigger',
        {
          'sidebar-menu-item__trigger--active': isActive,
          'sidebar-menu-item__trigger--branch-active': containsActive && !isActive,
          'sidebar-menu-item__trigger--collapsed': collapsed,
        },
      ]"
      :style="{ paddingLeft: collapsed ? undefined : `${12 + depth * 16}px` }"
      :aria-current="isActive ? 'page' : undefined"
      :aria-expanded="hasChildren ? open : undefined"
      :title="collapsed ? node.title : undefined"
      @click="activate"
    >
      <Icon :icon="node.icon" class="sidebar-menu-item__icon" />
      <span v-if="!collapsed" class="sidebar-menu-item__label">{{ node.title }}</span>
      <Icon
        v-if="hasChildren && !collapsed"
        icon="solar:alt-arrow-down-linear"
        :class="['sidebar-menu-item__chevron', { 'sidebar-menu-item__chevron--open': open }]"
      />
    </button>

    <ul v-if="hasChildren && !collapsed && open" class="sidebar-menu-item__children">
      <SidebarMenuItem
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :active-path="activePath"
        :depth="depth + 1"
        @navigate="emit('navigate', $event)"
        @request-expand="emit('requestExpand')"
      />
    </ul>
  </li>
</template>

<style scoped lang="scss" src="./index.scss"></style>
