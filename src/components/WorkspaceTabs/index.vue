<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { Button } from '@/components/ui/button'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'

import type { WorkspaceTabsProps, WorkspaceTabsEmits } from './type'

import { useWorkspaceTabs } from './index'

defineOptions({ name: 'WorkspaceTabs' })

const props = defineProps<WorkspaceTabsProps>()

const emit = defineEmits<WorkspaceTabsEmits>()

const { canScrollLeft, canScrollRight, otherTabs, updateScrollState, scrollTabs } =
  useWorkspaceTabs(props)
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

<style scoped lang="scss" src="./index.scss"></style>
