import { computed, onBeforeUnmount, onMounted, reactive, shallowRef, watch } from 'vue'
import { toast } from 'vue-sonner'
import { useAuthStore } from '@/store/authStore'
import { useUserInfoStore } from '@/store/global'
import { authEventNames, cancelSessionRecovery, completeSessionRecovery } from '@/utils/authEvents'
import type { PasswordDialogMode } from '@/utils/authEvents'

export function useAuthDialogs() {
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

  const passwordForced = computed(
    () => passwordMode.value === 'expired' || passwordMode.value === 'complexity',
  )

  const lengthValid = computed(() => passwordForm.newPassword.length >= 8)

  const combinationValid = computed(() => {
    const value = passwordForm.newPassword
    const categories = [/[A-Za-z]/.test(value), /\d/.test(value), /[^A-Za-z0-9]/.test(value)]
    return categories.filter(Boolean).length >= 2
  })

  const passwordsMatch = computed(
    () =>
      Boolean(passwordForm.confirmation) && passwordForm.newPassword === passwordForm.confirmation,
  )

  const passwordValid = computed(
    () =>
      Boolean(passwordForm.oldPassword) &&
      lengthValid.value &&
      combinationValid.value &&
      passwordsMatch.value,
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
      if (requirement)
        handlePasswordRequired(
          new CustomEvent(authEventNames.passwordRequired, { detail: requirement }),
        )
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

  return {
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
  }
}
