<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import HeaderIconButton from '../HeaderIconButton/index.vue'

import { useHeaderNotificationCenter } from './index'

defineOptions({ name: 'HeaderNotificationCenter' })

const { open, loading, notices, activeTab, count, noticeTitle, handleOpenChange } =
  useHeaderNotificationCenter()
</script>

<template>
  <Popover :open="open" @update:open="handleOpenChange">
    <PopoverTrigger as-child>
      <HeaderIconButton icon="solar:bell-linear" label="消息中心" :badge="count" />
    </PopoverTrigger>
    <PopoverContent
      align="end"
      class="notice-panel"
      :style="{
        width: 'min(380px, calc(100vw - 24px))',
        maxWidth: 'calc(100vw - 24px)',
        padding: '0',
        overflow: 'hidden',
      }"
    >
      <Tabs v-model="activeTab" class="notice-panel__tabs">
        <div class="notice-panel__bar">
          <TabsList class="notice-panel__tab-list">
            <TabsTrigger value="message"
              >消息<span v-if="count" class="notice-panel__count">{{ count }}</span></TabsTrigger
            >
            <TabsTrigger value="notice">通知</TabsTrigger>
            <TabsTrigger value="todo">待办</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="message" class="notice-panel__content">
          <div v-if="loading" class="notice-panel__loading">
            <Icon icon="solar:refresh-linear" class="notice-panel__spinning" />
          </div>
          <div v-else-if="notices.length" class="notice-panel__list">
            <article
              v-for="(notice, index) in notices"
              :key="`${notice.JSRQ ?? ''}-${notice.ZZMC ?? ''}-${index}`"
              class="notice-panel__item"
            >
              <span class="notice-panel__item-icon"
                ><Icon icon="solar:danger-triangle-linear"
              /></span>
              <div class="notice-panel__item-copy">
                <p>{{ noticeTitle(notice) }}</p>
                <time v-if="notice.JSRQ">{{ notice.JSRQ }}</time>
              </div>
            </article>
          </div>
          <div v-else class="notice-panel__empty">
            <Icon icon="lucide:inbox" />
            <span>暂无消息</span>
          </div>
        </TabsContent>

        <TabsContent value="notice" class="notice-panel__content">
          <div class="notice-panel__empty"><Icon icon="lucide:inbox" /><span>暂无通知</span></div>
        </TabsContent>
        <TabsContent value="todo" class="notice-panel__content">
          <div class="notice-panel__empty"><Icon icon="lucide:inbox" /><span>暂无待办</span></div>
        </TabsContent>
      </Tabs>
    </PopoverContent>
  </Popover>
</template>

<style scoped lang="scss" src="./index.scss"></style>
