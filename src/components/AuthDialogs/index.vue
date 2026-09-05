<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

import { useAuthDialogs } from './index'

defineOptions({ name: 'AuthDialogs' })

const {
  userInfoStore,
  recoveryOpen,
  recoveryPassword,
  recoveryError,
  recoveryPending,
  passwordMode,
  passwordPending,
  passwordForm,
  passwordTitle,
  passwordForced,
  lengthValid,
  combinationValid,
  passwordsMatch,
  passwordValid,
  submitRecovery,
  endSession,
  closePasswordDialog,
  submitPassword,
} = useAuthDialogs()
</script>

<template>
  <Dialog :open="recoveryOpen">
    <DialogContent
      :show-close-button="false"
      @escape-key-down.prevent
      @pointer-down-outside.prevent
    >
      <DialogHeader>
        <DialogTitle>登录状态已过期</DialogTitle>
        <DialogDescription>请输入当前账号密码，验证成功后会继续刚才的操作。</DialogDescription>
      </DialogHeader>
      <form class="auth-form" @submit.prevent="submitRecovery">
        <label class="auth-field">
          <span>账号</span>
          <Input :model-value="userInfoStore.profile.account" disabled />
        </label>
        <label class="auth-field">
          <span>密码</span>
          <Input
            v-model="recoveryPassword"
            type="password"
            autocomplete="current-password"
            autofocus
          />
        </label>
        <Alert v-if="recoveryError" variant="destructive">
          <Icon icon="solar:danger-triangle-linear" />
          <AlertTitle>验证失败</AlertTitle>
          <AlertDescription>{{ recoveryError }}</AlertDescription>
        </Alert>
        <DialogFooter>
          <Button type="button" variant="outline" :disabled="recoveryPending" @click="endSession"
            >退出登录</Button
          >
          <Button type="submit" :disabled="recoveryPending || !recoveryPassword">
            <Icon
              v-if="recoveryPending"
              icon="svg-spinners:180-ring-with-bg"
              data-icon="inline-start"
            />
            重新验证
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>

  <Dialog :open="Boolean(passwordMode)" @update:open="(open) => !open && closePasswordDialog()">
    <DialogContent
      :show-close-button="!passwordForced"
      @escape-key-down="passwordForced && $event.preventDefault()"
      @pointer-down-outside="passwordForced && $event.preventDefault()"
    >
      <DialogHeader>
        <DialogTitle>{{ passwordTitle }}</DialogTitle>
        <DialogDescription>
          {{
            passwordForced
              ? '必须修改密码后才能继续使用系统。'
              : '修改成功后需要使用新密码重新登录。'
          }}
        </DialogDescription>
      </DialogHeader>
      <form class="auth-form" @submit.prevent="submitPassword">
        <label class="auth-field">
          <span>原密码</span>
          <Input
            v-model="passwordForm.oldPassword"
            type="password"
            autocomplete="current-password"
          />
        </label>
        <label class="auth-field">
          <span>新密码</span>
          <Input v-model="passwordForm.newPassword" type="password" autocomplete="new-password" />
        </label>
        <label class="auth-field">
          <span>确认新密码</span>
          <Input v-model="passwordForm.confirmation" type="password" autocomplete="new-password" />
        </label>
        <div class="password-rules" aria-live="polite">
          <p :data-valid="lengthValid">
            <Icon
              :icon="lengthValid ? 'solar:check-circle-linear' : 'solar:info-circle-linear'"
            />至少 8 个字符
          </p>
          <p :data-valid="combinationValid">
            <Icon
              :icon="combinationValid ? 'solar:check-circle-linear' : 'solar:info-circle-linear'"
            />字母、数字、特殊字符至少包含两类
          </p>
          <p :data-valid="passwordsMatch">
            <Icon
              :icon="passwordsMatch ? 'solar:check-circle-linear' : 'solar:info-circle-linear'"
            />两次输入的新密码一致
          </p>
        </div>
        <DialogFooter>
          <Button
            v-if="!passwordForced"
            type="button"
            variant="outline"
            @click="closePasswordDialog"
            >取消</Button
          >
          <Button type="submit" :disabled="passwordPending || !passwordValid">
            <Icon
              v-if="passwordPending"
              icon="svg-spinners:180-ring-with-bg"
              data-icon="inline-start"
            />
            确认修改
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<style scoped lang="scss" src="./index.scss"></style>
