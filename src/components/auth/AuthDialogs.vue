<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, shallowRef, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { toast } from 'vue-sonner'
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
import { useAuthStore } from '@/store/authStore'
import { useUserInfoStore } from '@/store/global'
import {
  authEventNames,
  cancelSessionRecovery,
  completeSessionRecovery,
} from '@/utils/authEvents'
import type { PasswordDialogMode } from '@/utils/authEvents'

const authStore = useAuthStore()
const userInfoStore = useUserInfoStore()
const recoveryOpen = shallowRef(false)
const recoveryPassword = shallowRef('')
const recoveryError = shallowRef('')
const recoveryPending = shallowRef(false)
const passwordMode = shallowRef<PasswordDialogMode | null>(null)
const passwordPending = shallowRef(false)
const passwordForm = reactive({ oldPassword: '', newPassword: '', confirmation: '' })

const passwordTitle = computed(() => {
  if (passwordMode.value === 'expired') return '密码已过期'
  if (passwordMode.value === 'complexity') return '密码强度不足'
  return '修改密码'
})
const passwordForced = computed(() => passwordMode.value === 'expired' || passwordMode.value === 'complexity')
const lengthValid = computed(() => passwordForm.newPassword.length >= 8)
const combinationValid = computed(() => {
  const value = passwordForm.newPassword
  const categories = [/[A-Za-z]/.test(value), /\d/.test(value), /[^A-Za-z0-9]/.test(value)]
  return categories.filter(Boolean).length >= 2
})
const passwordsMatch = computed(() =>
  Boolean(passwordForm.confirmation) && passwordForm.newPassword === passwordForm.confirmation,
)
const passwordValid = computed(() =>
  Boolean(passwordForm.oldPassword) && lengthValid.value && combinationValid.value && passwordsMatch.value,
)

function handleSessionExpired() {
  recoveryPassword.value = ''
  recoveryError.value = ''
  recoveryOpen.value = true
}

function handlePasswordRequired(event: Event) {
  const detail = (event as CustomEvent<PasswordDialogMode>).detail
  passwordMode.value = detail
  Object.assign(passwordForm, { oldPassword: '', newPassword: '', confirmation: '' })
}

async function submitRecovery() {
  if (!recoveryPassword.value || recoveryPending.value) return
  recoveryPending.value = true
  recoveryError.value = ''
  try {
    await authStore.reauthenticate(recoveryPassword.value)
    recoveryOpen.value = false
    recoveryPassword.value = ''
    completeSessionRecovery()
    toast.success('登录状态已恢复')
  } catch (error) {
    recoveryError.value = error instanceof Error ? error.message : '身份验证失败'
  } finally {
    recoveryPending.value = false
  }
}

async function endSession() {
  recoveryOpen.value = false
  cancelSessionRecovery()
  await authStore.logout({ notifyServer: false })
}

function closePasswordDialog() {
  if (!passwordForced.value) passwordMode.value = null
}

async function submitPassword() {
  if (!passwordValid.value || passwordPending.value) return
  passwordPending.value = true
  try {
    await authStore.changePassword(passwordForm.oldPassword, passwordForm.newPassword)
    passwordMode.value = null
    toast.success('密码修改成功，请使用新密码重新登录')
  } catch (error) {
    toast.error(error instanceof Error ? error.message : '密码修改失败')
  } finally {
    passwordPending.value = false
  }
}

watch(
  () => userInfoStore.passwordRequirement,
  (requirement) => {
    if (requirement) handlePasswordRequired(new CustomEvent(authEventNames.passwordRequired, { detail: requirement }))
  },
  { immediate: true },
)

onMounted(() => {
  window.addEventListener(authEventNames.sessionExpired, handleSessionExpired)
  window.addEventListener(authEventNames.passwordRequired, handlePasswordRequired)
})

onBeforeUnmount(() => {
  window.removeEventListener(authEventNames.sessionExpired, handleSessionExpired)
  window.removeEventListener(authEventNames.passwordRequired, handlePasswordRequired)
})
</script>

<template>
  <Dialog :open="recoveryOpen">
    <DialogContent :show-close-button="false" @escape-key-down.prevent @pointer-down-outside.prevent>
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
          <Input v-model="recoveryPassword" type="password" autocomplete="current-password" autofocus />
        </label>
        <Alert v-if="recoveryError" variant="destructive">
          <Icon icon="solar:danger-triangle-linear" />
          <AlertTitle>验证失败</AlertTitle>
          <AlertDescription>{{ recoveryError }}</AlertDescription>
        </Alert>
        <DialogFooter>
          <Button type="button" variant="outline" :disabled="recoveryPending" @click="endSession">退出登录</Button>
          <Button type="submit" :disabled="recoveryPending || !recoveryPassword">
            <Icon v-if="recoveryPending" icon="svg-spinners:180-ring-with-bg" data-icon="inline-start" />
            重新验证
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>

  <Dialog :open="Boolean(passwordMode)" @update:open="(open) => !open && closePasswordDialog()">
    <DialogContent :show-close-button="!passwordForced" @escape-key-down="passwordForced && $event.preventDefault()"
      @pointer-down-outside="passwordForced && $event.preventDefault()">
      <DialogHeader>
        <DialogTitle>{{ passwordTitle }}</DialogTitle>
        <DialogDescription>
          {{ passwordForced ? '必须修改密码后才能继续使用系统。' : '修改成功后需要使用新密码重新登录。' }}
        </DialogDescription>
      </DialogHeader>
      <form class="auth-form" @submit.prevent="submitPassword">
        <label class="auth-field">
          <span>原密码</span>
          <Input v-model="passwordForm.oldPassword" type="password" autocomplete="current-password" />
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
          <p :data-valid="lengthValid"><Icon :icon="lengthValid ? 'solar:check-circle-linear' : 'solar:info-circle-linear'" />至少 8 个字符</p>
          <p :data-valid="combinationValid"><Icon :icon="combinationValid ? 'solar:check-circle-linear' : 'solar:info-circle-linear'" />字母、数字、特殊字符至少包含两类</p>
          <p :data-valid="passwordsMatch"><Icon :icon="passwordsMatch ? 'solar:check-circle-linear' : 'solar:info-circle-linear'" />两次输入的新密码一致</p>
        </div>
        <DialogFooter>
          <Button v-if="!passwordForced" type="button" variant="outline" @click="closePasswordDialog">取消</Button>
          <Button type="submit" :disabled="passwordPending || !passwordValid">
            <Icon v-if="passwordPending" icon="svg-spinners:180-ring-with-bg" data-icon="inline-start" />
            确认修改
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<style scoped>
.auth-form { display: flex; flex-direction: column; gap: 16px; }
.auth-field { display: flex; flex-direction: column; gap: 6px; color: var(--foreground); font-size: 13px; font-weight: 500; }
.password-rules { display: flex; flex-direction: column; gap: 6px; color: var(--muted-foreground); font-size: 12px; }
.password-rules p { display: flex; align-items: center; gap: 6px; }
.password-rules p[data-valid='true'] { color: var(--foreground); }
</style>
