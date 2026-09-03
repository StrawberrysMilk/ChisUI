<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { Icon } from '@iconify/vue'
import { toast } from 'vue-sonner'
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
import { useAuthStore } from '@/store/authStore'
import { useUserInfoStore } from '@/store/global'
import { requestPasswordChange } from '@/utils/authEvents'

const authStore = useAuthStore()
const userInfoStore = useUserInfoStore()
const loggingOut = shallowRef(false)
const contactOpen = shallowRef(false)
const clearCacheOpen = shallowRef(false)
const displayName = computed(
  () => userInfoStore.profile.name || userInfoStore.profile.account || '用户',
)

async function logout() {
  if (loggingOut.value) return
  loggingOut.value = true
  try {
    await authStore.logout()
  } catch (error) {
    toast.error(error instanceof Error ? error.message : '退出失败')
  } finally {
    loggingOut.value = false
  }
}

function unavailable(label: string) {
  toast.info(`${label}将在对应功能模块迁移后开放`)
}

async function clearLoginCache() {
  clearCacheOpen.value = false
  await authStore.logout({ notifyServer: false })
}
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

<style scoped>
.user-trigger {
  height: 42px;
  max-width: 240px;
  padding-inline: 8px;
  color: white;
  font-size: 14px;
}
.user-trigger:hover {
  color: white;
  background: rgb(255 255 255 / 14%);
}
.user-avatar {
  width: 30px;
  height: 30px;
  border: 1px solid rgb(255 255 255 / 35%);
}
.user-avatar__fallback {
  color: var(--primary);
  background: white;
}
.user-avatar__fallback svg {
  width: 18px;
  height: 18px;
}
.user-name {
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.user-menu-item {
  min-height: 32px;
  gap: 10px;
  padding-inline: 12px;
  font-size: 14px;
}
.contact-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  background: var(--muted);
  border-radius: var(--radius-md);
}
.contact-icon {
  display: grid;
  width: 40px;
  height: 40px;
  place-items: center;
  color: var(--primary);
  background: var(--background);
  border-radius: var(--radius-md);
}
.contact-icon svg {
  width: 20px;
  height: 20px;
}
.contact-label,
.contact-value {
  display: block;
}
.contact-label {
  color: var(--muted-foreground);
  font-size: 12px;
}
.contact-value {
  margin-top: 2px;
  font-size: 16px;
}

@media (max-width: 640px) {
  .user-trigger {
    max-width: 46px;
  }
  .user-name {
    display: none;
  }
}
</style>
