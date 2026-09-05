<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { useUserSessionMenu } from './index'

defineOptions({ name: 'UserSessionMenu' })

const {
  loggingOut,
  contactOpen,
  clearCacheOpen,
  displayName,
  logout,
  unavailable,
  clearLoginCache,
  requestPasswordChange,
} = useUserSessionMenu()
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="ghost" size="sm" class="user-trigger">
        <Avatar class="user-avatar">
          <AvatarFallback class="user-avatar__fallback">
            <Icon icon="solar:user-bold" />
          </AvatarFallback>
        </Avatar>
        <span class="user-name">{{ displayName }}</span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent
      align="end"
      class="user-menu-content"
      :style="{ width: '180px', minWidth: '180px', paddingBlock: '6px' }"
    >
      <DropdownMenuGroup>
        <DropdownMenuItem class="user-menu-item" @select="requestPasswordChange('manual')">
          <Icon icon="solar:lock-password-linear" />
          修改密码
        </DropdownMenuItem>
        <DropdownMenuItem class="user-menu-item" @select="unavailable('导出任务')">
          <Icon icon="solar:export-linear" />
          <span>导出任务</span>
        </DropdownMenuItem>
        <DropdownMenuItem class="user-menu-item" @select="unavailable('控件下载')">
          <Icon icon="solar:download-minimalistic-linear" />
          <span>控件下载</span>
        </DropdownMenuItem>
        <DropdownMenuItem class="user-menu-item" @select="unavailable('硬件设置')">
          <Icon icon="solar:settings-minimalistic-linear" />
          <span>硬件设置</span>
        </DropdownMenuItem>
        <DropdownMenuItem class="user-menu-item" @select="unavailable('公众号推广二维码')">
          <Icon icon="solar:qr-code-linear" />
          <span>公众号推广二维码</span>
        </DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <DropdownMenuItem class="user-menu-item" @select="contactOpen = true">
          <Icon icon="solar:headphones-round-sound-linear" />
          联系客服
        </DropdownMenuItem>
        <DropdownMenuItem
          class="user-menu-item"
          variant="destructive"
          :disabled="loggingOut"
          @select="logout"
        >
          <Icon icon="solar:logout-2-linear" />
          退出登录
        </DropdownMenuItem>
        <DropdownMenuItem class="user-menu-item" @select="clearCacheOpen = true">
          <Icon icon="solar:trash-bin-minimalistic-linear" />
          清除缓存
        </DropdownMenuItem>
      </DropdownMenuGroup>
    </DropdownMenuContent>
  </DropdownMenu>

  <Dialog v-model:open="contactOpen">
    <DialogContent class="sm:max-w-sm">
      <DialogHeader>
        <DialogTitle>联系客服</DialogTitle>
        <DialogDescription
          >遇到系统问题时，请联系技术支持并说明当前账号和操作页面。</DialogDescription
        >
      </DialogHeader>
      <div class="contact-row">
        <span class="contact-icon"><Icon icon="solar:phone-calling-linear" /></span>
        <div>
          <span class="contact-label">服务热线</span>
          <strong class="contact-value">18584630881</strong>
        </div>
      </div>
      <DialogFooter>
        <Button type="button" @click="contactOpen = false">知道了</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <Dialog v-model:open="clearCacheOpen">
    <DialogContent class="sm:max-w-sm">
      <DialogHeader>
        <DialogTitle>清理登录缓存？</DialogTitle>
        <DialogDescription
          >这会清除当前登录信息、菜单和页签缓存，并返回登录页，不会删除业务数据。</DialogDescription
        >
      </DialogHeader>
      <DialogFooter>
        <Button type="button" variant="outline" @click="clearCacheOpen = false">取消</Button>
        <Button type="button" variant="destructive" @click="clearLoginCache">清理并退出</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<style scoped lang="scss" src="./index.scss"></style>
