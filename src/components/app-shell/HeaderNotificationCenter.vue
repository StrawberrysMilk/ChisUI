<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { Icon } from '@iconify/vue'
import { toast } from 'vue-sonner'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getExpiryNotices } from '@/api/modular/system/headerTools'
import type { ExpiryNotice } from '@/api/modular/system/headerTools'
import { useUserInfoStore } from '@/store/global'
import HeaderIconButton from './HeaderIconButton.vue'

const userInfoStore = useUserInfoStore()
const open = shallowRef(false)
const loaded = shallowRef(false)
const loading = shallowRef(false)
const notices = shallowRef<ExpiryNotice[]>([])
const activeTab = shallowRef('message')

const count = computed(() => notices.value.length)

function noticeTitle(item: ExpiryNotice) {
  const orgName = item.JGMC ? `[${item.JGMC}]` : ''
  const date = item.JSRQ ? `于${item.JSRQ}日` : ''
  const days = item.SYTS != null ? `（${item.SYTS}天）` : ''
  const name = item.ZZMC || '相关证照'
  return `${orgName}${name}${date}${days}到期，请及时更新。`
}

async function loadNotices(force = false) {
  if ((loaded.value && !force) || loading.value) return
  loading.value = true
  try {
    const response = await getExpiryNotices(userInfoStore.profile.orgCode)
    if (!response?.success) throw new Error(response?.message || '消息加载失败')
    notices.value = Array.isArray(response.data) ? response.data : []
    loaded.value = true
  } catch (error) {
    toast.error(error instanceof Error ? error.message : '消息加载失败')
  } finally {
    loading.value = false
  }
}

async function handleOpenChange(value: boolean) {
  open.value = value
  if (value) await loadNotices()
}
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
            <Icon icon="ant-design:inbox-outlined" />
            <span>暂无消息</span>
          </div>
        </TabsContent>

        <TabsContent value="notice" class="notice-panel__content">
          <div class="notice-panel__empty">
            <Icon icon="ant-design:inbox-outlined" /><span>暂无通知</span>
          </div>
        </TabsContent>
        <TabsContent value="todo" class="notice-panel__content">
          <div class="notice-panel__empty">
            <Icon icon="ant-design:inbox-outlined" /><span>暂无待办</span>
          </div>
        </TabsContent>
      </Tabs>
    </PopoverContent>
  </Popover>
</template>

<style scoped>
.notice-panel__tabs {
  gap: 0;
}
.notice-panel__bar {
  display: flex;
  height: 56px;
  align-items: center;
  border-bottom: 1px solid var(--border);
}
.notice-panel__tab-list {
  width: 100%;
  height: 100%;
  padding: 0;
  background: transparent;
  border-radius: 0;
}
.notice-panel__tab-list :deep([data-slot='tabs-trigger']) {
  position: relative;
  height: 100%;
  flex: 1;
  padding-inline: 14px;
  color: var(--muted-foreground);
  font-size: 14px;
  background: transparent;
  border: 0;
  border-radius: 0;
  box-shadow: none;
}
.notice-panel__tab-list :deep([data-slot='tabs-trigger'][data-state='active']) {
  color: var(--primary);
  background: transparent;
  box-shadow: inset 0 -2px 0 var(--primary);
}
.notice-panel__count {
  display: grid;
  min-width: 16px;
  height: 16px;
  place-items: center;
  padding-inline: 4px;
  color: white;
  font-size: 9px;
  background: var(--destructive);
  border-radius: 999px;
}
.notice-panel__content {
  position: relative;
  height: min(500px, calc(100vh - 124px));
  min-height: min(500px, calc(100vh - 124px));
  margin: 0;
  overflow-y: auto;
}
.notice-panel__loading {
  display: grid;
  height: 100%;
  place-items: center;
  color: var(--muted-foreground);
}
.notice-panel__list {
  display: flex;
  flex-direction: column;
  padding: 10px;
}
.notice-panel__item {
  display: flex;
  gap: 10px;
  padding: 10px;
  border-radius: var(--radius-md);
}
.notice-panel__item:hover {
  background: var(--accent);
}
.notice-panel__item-icon {
  display: grid;
  width: 32px;
  height: 32px;
  flex: 0 0 auto;
  place-items: center;
  color: var(--primary);
  background: color-mix(in oklab, var(--primary) 10%, var(--background));
  border-radius: var(--radius-md);
}
.notice-panel__item-icon svg {
  width: 17px;
  height: 17px;
}
.notice-panel__item-copy {
  min-width: 0;
  flex: 1;
}
.notice-panel__item-copy p {
  margin: 0;
  color: var(--foreground);
  font-size: 14px;
  line-height: 1.55;
}
.notice-panel__item-copy time {
  display: block;
  margin-top: 4px;
  color: var(--muted-foreground);
  font-size: 13px;
}
.notice-panel__empty {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: var(--muted-foreground);
  font-size: 14px;
}
.notice-panel__empty svg {
  width: 46px;
  height: 46px;
  opacity: 0.35;
}
.notice-panel__spinning {
  width: 22px;
  height: 22px;
  animation: notice-spin 800ms linear infinite;
}
@keyframes notice-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
