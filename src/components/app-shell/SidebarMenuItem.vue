<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue'
import { Icon } from '@iconify/vue'
import type { AppMenuNode } from './types'

defineOptions({ name: 'SidebarMenuItem' })

const props = withDefaults(defineProps<{
  node: AppMenuNode
  activePath: string
  collapsed?: boolean
  depth?: number
}>(), {
  collapsed: false,
  depth: 0,
})

const emit = defineEmits<{
  navigate: [node: AppMenuNode]
  requestExpand: []
}>()

const open = shallowRef(false)
const hasChildren = computed(() => props.node.children.length > 0)
const isActive = computed(() => props.node.path === props.activePath)
const containsActive = computed(() => {
  const find = (node: AppMenuNode): boolean =>
    node.path === props.activePath || node.children.some(find)
  return find(props.node)
})

watch(containsActive, (active) => {
  if (active) open.value = true
}, { immediate: true })

function activate() {
  if (hasChildren.value) {
    if (props.collapsed) emit('requestExpand')
    else open.value = !open.value
    return
  }
  emit('navigate', props.node)
}
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

<style scoped>
.sidebar-menu-item { list-style: none; }
.sidebar-menu-item__trigger {
  display: flex;
  width: 100%;
  min-height: 40px;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  color: var(--muted-foreground);
  font-size: 14px;
  line-height: 20px;
  text-align: left;
  background: transparent;
  border: 0;
  border-bottom: 1px solid var(--border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: color 140ms ease, background-color 140ms ease;
}
.sidebar-menu-item__trigger:hover { color: var(--foreground); background: var(--accent); }
.sidebar-menu-item__trigger:focus-visible { outline: 3px solid color-mix(in oklab, var(--ring) 50%, transparent); outline-offset: -1px; }
.sidebar-menu-item__trigger--active { color: var(--primary); font-weight: 600; background: color-mix(in oklab, var(--primary) 10%, var(--background)); }
.sidebar-menu-item__trigger--active:hover { color: var(--primary); background: color-mix(in oklab, var(--primary) 14%, var(--background)); }
.sidebar-menu-item__trigger--branch-active { color: var(--foreground); }
.sidebar-menu-item__trigger--collapsed { justify-content: center; padding-inline: 0; }
.sidebar-menu-item__icon { width: 18px; height: 18px; flex: 0 0 auto; }
.sidebar-menu-item__label { min-width: 0; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.sidebar-menu-item__chevron { width: 14px; height: 14px; flex: 0 0 auto; transition: transform 160ms ease; }
.sidebar-menu-item__chevron--open { transform: rotate(180deg); }
.sidebar-menu-item__children { display: flex; flex-direction: column; gap: 2px; padding: 2px 0; }
</style>
