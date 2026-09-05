import { computed, onMounted, shallowRef } from 'vue'
import { toast } from 'vue-sonner'
import { getSsoApplications, getSsoCredential } from '@/api/modular/system/headerTools'
import type { SsoApplication, SsoCredential } from '@/api/modular/system/headerTools'

export function useHeaderSsoMenu() {
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

  return {
    open,
    loading,
    launchingCode,
    applications,
    hasApplications,
    appName,
    appKey,
    handleOpenChange,
    launch,
  }
}
