import { computed, shallowRef } from 'vue'
import { toast } from 'vue-sonner'
import { useAuthStore } from '@/store/authStore'
import { useUserInfoStore } from '@/store/global'
import { requestPasswordChange } from '@/utils/authEvents'

export function useUserSessionMenu() {
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

  return {
    loggingOut,
    contactOpen,
    clearCacheOpen,
    displayName,
    logout,
    unavailable,
    clearLoginCache,
    requestPasswordChange,
  }
}
