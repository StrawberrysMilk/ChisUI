import { computed, shallowRef } from 'vue'
import { toast } from 'vue-sonner'
import { getExpiryNotices } from '@/api/modular/system/headerTools'
import type { ExpiryNotice } from '@/api/modular/system/headerTools'
import { useUserInfoStore } from '@/store/global'

export function useHeaderNotificationCenter() {
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

  return { open, loading, notices, activeTab, count, noticeTitle, handleOpenChange }
}
