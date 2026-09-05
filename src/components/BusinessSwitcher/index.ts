import { computed } from 'vue'
import { useWindowSize } from '@vueuse/core'

import type { BusinessSwitcherProps } from './type'

export function useBusinessSwitcher(props: Readonly<BusinessSwitcherProps>) {
  const activeApplication = computed(() =>
    props.applications.find((item) => String(item.code) === props.activeCode),
  )

  const { width } = useWindowSize()

  const visibleCount = computed(() => {
    if (width.value >= 1660) return 9
    if (width.value >= 1460) return 7
    if (width.value >= 1220) return 6
    return 4
  })

  const visibleApplications = computed(() => props.applications.slice(0, visibleCount.value))

  const overflowApplications = computed(() => props.applications.slice(visibleCount.value))

  function appIcon(name: string) {
    if (/档案/.test(name)) return 'solar:folder-with-files-linear'
    if (/疾病|慢病/.test(name)) return 'solar:heart-pulse-linear'
    if (/妇幼/.test(name)) return 'solar:users-group-two-rounded-linear'
    if (/三高/.test(name)) return 'solar:medical-kit-linear'
    if (/教育/.test(name)) return 'solar:square-academic-cap-linear'
    if (/统计/.test(name)) return 'solar:chart-2-linear'
    if (/登记/.test(name)) return 'solar:clipboard-text-linear'
    if (/质控/.test(name)) return 'solar:shield-check-linear'
    return 'solar:widget-5-linear'
  }

  return { activeApplication, width, visibleApplications, overflowApplications, appIcon }
}
