<script setup lang="ts">
import { computed, onMounted, shallowRef } from 'vue'
import { Icon } from '@iconify/vue'
import { toast } from 'vue-sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { getSsoApplications, getSsoCredential } from '@/api/modular/system/headerTools'
import type { SsoApplication, SsoCredential } from '@/api/modular/system/headerTools'
import HeaderIconButton from './HeaderIconButton.vue'

const open = shallowRef(false)
const loaded = shallowRef(false)
const loading = shallowRef(false)
const launchingCode = shallowRef('')
const applications = shallowRef<SsoApplication[]>([])

const hasApplications = computed(() => applications.value.length > 0)

function appName(item: SsoApplication) {
  return String(item.yymc ?? item.YYMC ?? '外部应用')
}

function appUrl(item: SsoApplication) {
  return String(item.YYDZ ?? item.yydz ?? '')
}

function appKey(item: SsoApplication, index: number) {
  return String(item.guid ?? appName(item) ?? index)
}

async function loadApplications() {
  if (loaded.value || loading.value) return
  loading.value = true
  try {
    const response = await getSsoApplications()
    if (!response?.success) throw new Error(response?.message || '单点登录应用加载失败')
    applications.value = Array.isArray(response.data) ? response.data : []
    loaded.value = true
  } catch (error) {
    toast.error(error instanceof Error ? error.message : '单点登录应用加载失败')
  } finally {
    loading.value = false
  }
}

async function handleOpenChange(value: boolean) {
  open.value = value
  if (value) await loadApplications()
}

onMounted(loadApplications)

async function launch(item: SsoApplication, index: number) {
  const targetUrl = appUrl(item)
  if (!targetUrl) {
    toast.error('该应用未配置访问地址')
    return
  }

  const key = appKey(item, index)
  launchingCode.value = key
  const targetWindow = window.open('about:blank', '_blank')
  try {
    const response = await getSsoCredential()
    if (!response?.success) throw new Error(response?.message || '单点登录凭证获取失败')
    const credential = (response.data ?? {}) as SsoCredential
    const url = new URL(targetUrl, window.location.origin)
    if (credential.queryToken) url.searchParams.set('queryToken', credential.queryToken)
    if (credential.guid ?? item.guid)
      url.searchParams.set('guid', String(credential.guid ?? item.guid))
    if (credential.gh) url.searchParams.set('gh', credential.gh)

    if (targetWindow) targetWindow.location.href = url.toString()
    else window.open(url.toString(), '_blank', 'noopener,noreferrer')
    open.value = false
  } catch (error) {
    targetWindow?.close()
    toast.error(error instanceof Error ? error.message : '单点登录失败')
  } finally {
    launchingCode.value = ''
  }
}
</script>

<template>
  <Popover :open="open" @update:open="handleOpenChange">
    <PopoverTrigger as-child>
      <HeaderIconButton icon="solar:copy-linear" label="单点登录" />
    </PopoverTrigger>
    <PopoverContent
      align="end"
      class="sso-panel"
      :style="{
        width: 'min(210px, calc(100vw - 24px))',
        maxWidth: 'calc(100vw - 24px)',
        padding: '0',
        overflow: 'hidden',
      }"
    >
      <div class="sso-panel__header">
        <strong class="sso-panel__title">单点登录</strong>
      </div>

      <div v-if="loading" class="sso-panel__loading">
        <Icon icon="solar:refresh-linear" class="sso-panel__spinning" />
      </div>
      <div v-else-if="hasApplications" class="sso-panel__list">
        <button
          v-for="(application, index) in applications"
          :key="appKey(application, index)"
          type="button"
          class="sso-panel__item"
          :disabled="Boolean(launchingCode)"
          @click="launch(application, index)"
        >
          <Avatar class="sso-panel__avatar">
            <AvatarImage
              v-if="application.YYTBFTP || application.icon"
              :src="String(application.YYTBFTP ?? application.icon)"
              :alt="appName(application)"
            />
            <AvatarFallback><Icon icon="solar:global-linear" /></AvatarFallback>
          </Avatar>
          <span class="sso-panel__name">{{ appName(application) }}</span>
          <Icon
            v-if="launchingCode === appKey(application, index)"
            icon="solar:refresh-linear"
            class="sso-panel__spinning"
          />
          <span v-else class="sso-panel__action">单点登录</span>
        </button>
      </div>
      <div v-else class="sso-panel__empty">
        <Icon icon="solar:inbox-linear" />
        <span>暂无单点登录应用</span>
      </div>
    </PopoverContent>
  </Popover>
</template>

<style scoped>
.sso-panel__header {
  display: flex;
  height: 46px;
  align-items: center;
  padding: 0 16px;
  border-bottom: 1px solid var(--border);
}
.sso-panel__title {
  font-size: 14px;
  font-weight: 500;
}
.sso-panel__loading {
  display: grid;
  min-height: 82px;
  place-items: center;
  color: var(--muted-foreground);
}
.sso-panel__list {
  display: flex;
  max-height: 330px;
  flex-direction: column;
  overflow-y: auto;
}
.sso-panel__item {
  display: flex;
  width: 100%;
  min-height: 82px;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  color: var(--foreground);
  text-align: left;
  background: transparent;
  border: 0;
  cursor: pointer;
}
.sso-panel__item:hover {
  background: var(--accent);
}
.sso-panel__item:disabled {
  cursor: wait;
  opacity: 0.65;
}
.sso-panel__avatar {
  width: 34px;
  height: 34px;
}
.sso-panel__name {
  min-width: 0;
  flex: 1;
  overflow: hidden;
  font-size: 14px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.sso-panel__action {
  display: none;
  flex: 0 0 auto;
  color: var(--primary);
  font-size: 14px;
}
.sso-panel__item:hover .sso-panel__action {
  display: inline;
}
.sso-panel__spinning {
  width: 16px;
  height: 16px;
  animation: sso-spin 800ms linear infinite;
}
.sso-panel__empty {
  display: flex;
  min-height: 82px;
  align-items: center;
  justify-content: center;
  color: var(--muted-foreground);
  font-size: 14px;
}
.sso-panel__empty svg {
  display: none;
}
@keyframes sso-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
