import type { PageComponentResolvedProps } from './type'
import { computed } from 'vue'
import { usePageLayout } from './usePageLayout'

export function usePageComponent(props: PageComponentResolvedProps) {
  const hasTable = computed(() => props.columns.length > 0)

  usePageLayout()

  return { hasTable }
}
