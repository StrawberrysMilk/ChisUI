<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import HeaderIconButton from '../HeaderIconButton/index.vue'

import { useHeaderSsoMenu } from './index'

defineOptions({ name: 'HeaderSsoMenu' })

const {
  open,
  loading,
  launchingCode,
  applications,
  hasApplications,
  appName,
  appKey,
  handleOpenChange,
  launch,
} = useHeaderSsoMenu()
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

<style scoped lang="scss" src="./index.scss"></style>
