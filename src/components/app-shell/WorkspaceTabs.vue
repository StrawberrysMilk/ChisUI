<script setup lang="ts">
import { computed, nextTick, shallowRef, useTemplateRef, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { Button } from '@/components/ui/button'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import type { WorkspaceTab } from './types'

const props = defineProps<{ tabs: WorkspaceTab[]; activePath: string }>()
const emit = defineEmits<{
  select: [path: string]
  close: [path: string]
  closeLeft: [path: string]
  closeRight: [path: string]
  closeAll: []
}>()
const otherTabsRef = useTemplateRef<HTMLElement>('otherTabs')
const canScrollLeft = shallowRef(false)
const canScrollRight = shallowRef(false)
const otherTabs = computed(() => props.tabs.filter((tab) => tab.path !== '/home'))
const previousTabCount = shallowRef(otherTabs.value.length)

function updateScrollState() {
  const e = otherTabsRef.value
  if (!e) return
  const overflow = e.scrollWidth > e.clientWidth + 1
  canScrollLeft.value = overflow
  canScrollRight.value = overflow
}
function scrollTabs(direction: number) {
  const e = otherTabsRef.value
  if (!e) return
  e.scrollBy({ left: direction * Math.max(180, e.clientWidth * 0.65), behavior: 'smooth' })
  window.setTimeout(updateScrollState, 220)
}
watch(
  () => props.tabs.length,
  async (count, previousCount) => {
    await nextTick()
    updateScrollState()
    if (count > (previousCount ?? previousTabCount.value)) {
      const e = otherTabsRef.value
      e?.scrollTo({ left: e.scrollWidth, behavior: 'smooth' })
      window.setTimeout(updateScrollState, 220)
    }
    previousTabCount.value = count
  },
  { immediate: true },
)
</script>

<template>
  <div class="workspace-tabs multi_tab_header">
    <div class="workspace-tabs__home" role="tablist" aria-label="固定页面">
      <ContextMenu>
        <ContextMenuTrigger as-child>
          <div
            v-if="tabs[0]"
            role="tab"
            :aria-selected="tabs[0].path === activePath"
            :class="[
              'workspace-tabs__tab',
              { 'workspace-tabs__tab--active': tabs[0].path === activePath },
            ]"
          >
            <button
              type="button"
              class="workspace-tabs__main"
              @click="emit('select', tabs[0].path)"
            >
              <span class="workspace-tabs__label">{{ tabs[0].title }}</span>
            </button>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent
          class="workspace-tabs__context-menu"
          :style="{ width: '132px', minWidth: '132px', padding: '4px' }"
        >
          <ContextMenuItem disabled>关闭当前标签</ContextMenuItem>
          <ContextMenuItem @select="emit('closeRight', '/home')">关闭右侧</ContextMenuItem>
          <ContextMenuItem disabled>关闭左侧</ContextMenuItem>
          <ContextMenuItem @select="emit('closeAll')">关闭全部</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </div>
    <Button
      v-if="canScrollLeft"
      type="button"
      variant="ghost"
      size="icon-sm"
      class="workspace-tabs__arrow"
      aria-label="向左滚动页签"
      title="向左滚动页签"
      @click="scrollTabs(-1)"
      ><Icon icon="solar:alt-arrow-left-linear"
    /></Button>
    <div
      ref="otherTabs"
      class="workspace-tabs__scroll"
      role="tablist"
      aria-label="业务页面"
      @scroll="updateScrollState"
    >
      <ContextMenu v-for="tab in otherTabs" :key="tab.path">
        <ContextMenuTrigger as-child>
          <div
            role="tab"
            :aria-selected="tab.path === activePath"
            :class="[
              'workspace-tabs__tab',
              { 'workspace-tabs__tab--active': tab.path === activePath },
            ]"
          >
            <button type="button" class="workspace-tabs__main" @click="emit('select', tab.path)">
              <span class="workspace-tabs__label">{{ tab.title }}</span>
            </button>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              class="workspace-tabs__close"
              aria-label="关闭页签"
              title="关闭页签"
              @click.stop="emit('close', tab.path)"
              ><Icon icon="solar:close-circle-linear"
            /></Button>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent
          class="workspace-tabs__context-menu"
          :style="{ width: '132px', minWidth: '132px', padding: '4px' }"
        >
          <ContextMenuItem @select="emit('close', tab.path)">关闭当前标签</ContextMenuItem>
          <ContextMenuItem @select="emit('closeRight', tab.path)">关闭右侧</ContextMenuItem>
          <ContextMenuItem @select="emit('closeLeft', tab.path)">关闭左侧</ContextMenuItem>
          <ContextMenuItem @select="emit('closeAll')">关闭全部</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </div>
    <Button
      v-if="canScrollRight"
      type="button"
      variant="ghost"
      size="icon-sm"
      class="workspace-tabs__arrow"
      aria-label="向右滚动页签"
      title="向右滚动页签"
      @click="scrollTabs(1)"
      ><Icon icon="solar:alt-arrow-right-linear"
    /></Button>
  </div>
</template>

<style scoped>
.workspace-tabs {
  display: flex;
  height: 76px;
  align-items: center;
  gap: 0;
  padding: 16px;
  background: #f3f4f6;
}
.workspace-tabs__home {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
}
.workspace-tabs__scroll {
  display: flex;
  min-width: 0;
  flex: 1;
  align-items: center;
  gap: 4px;
  overflow-x: auto;
  padding: 0 4px;
  scrollbar-width: none;
}
.workspace-tabs__scroll::-webkit-scrollbar {
  display: none;
}
.workspace-tabs__tab {
  display: inline-flex;
  min-width: 96px;
  max-width: 220px;
  height: 38px;
  flex: 0 0 auto;
  align-items: center;
  padding: 0 6px 0 12px;
  color: var(--muted-foreground);
  font-size: 14px;
  background: var(--background);
  border: 1px solid transparent;
  border-radius: 8px;
}
.workspace-tabs__tab:hover {
  color: var(--foreground);
  background: var(--background);
}
.workspace-tabs__tab--active {
  color: white;
  background: var(--primary);
  border-color: var(--primary);
  box-shadow: 0 1px 2px rgb(0 0 0 / 8%);
}
.workspace-tabs__main {
  display: flex;
  min-width: 0;
  height: 100%;
  flex: 1;
  align-items: center;
  gap: 8px;
  color: inherit;
  background: transparent;
  border: 0;
  cursor: pointer;
}
.workspace-tabs__main > svg {
  width: 16px;
  height: 16px;
  flex: 0 0 auto;
}
.workspace-tabs__label {
  min-width: 0;
  flex: 1;
  overflow: hidden;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.workspace-tabs__close {
  flex: 0 0 auto;
}
.workspace-tabs__close:hover {
  color: inherit;
  background: rgb(255 255 255 / 16%);
}
.workspace-tabs__close svg {
  width: 14px;
  height: 14px;
}
.workspace-tabs__arrow {
  flex: 0 0 auto;
  color: var(--muted-foreground);
}
.workspace-tabs__arrow:hover {
  color: var(--foreground);
  background: var(--background);
}
:global(.workspace-tabs__context-menu) {
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgb(15 23 42 / 14%);
}
:global(.workspace-tabs__context-menu [data-slot='context-menu-item']) {
  min-height: 30px;
  padding: 5px 10px;
  color: #374151;
  font-size: 14px;
  line-height: 20px;
  border-radius: 4px;
}
:global(.workspace-tabs__context-menu [data-slot='context-menu-item']:focus) {
  color: #1d4ed8;
  background: #eaf3ff;
}
:global(.workspace-tabs__context-menu [data-slot='context-menu-item'][data-disabled]) {
  color: #9ca3af;
  opacity: 1;
}
</style>
