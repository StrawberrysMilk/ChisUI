import { computed, nextTick, shallowRef, useTemplateRef, watch } from 'vue'

import type { WorkspaceTabsProps } from './type'

export function useWorkspaceTabs(props: Readonly<WorkspaceTabsProps>) {
  const otherTabsRef = useTemplateRef<HTMLElement>('otherTabs')

  const canScrollLeft = shallowRef(false)

  const canScrollRight = shallowRef(false)

  const otherTabs = computed(() => props.tabs.filter((tab) => tab.path !== '/home'))

  const previousTabCount = shallowRef(otherTabs.value.length)

  function updateScrollState() {
    const e = otherTabsRef.value
    if (!e) return
    const overflow = e.scrollWidth > e.clientWidth + 1
    canScrollLeft.value = overflow
    canScrollRight.value = overflow
  }

  function scrollTabs(direction: number) {
    const e = otherTabsRef.value
    if (!e) return
    e.scrollBy({ left: direction * Math.max(180, e.clientWidth * 0.65), behavior: 'smooth' })
    window.setTimeout(updateScrollState, 220)
  }

  watch(
    () => props.tabs.length,
    async (count, previousCount) => {
      await nextTick()
      updateScrollState()
      if (count > (previousCount ?? previousTabCount.value)) {
        const e = otherTabsRef.value
        e?.scrollTo({ left: e.scrollWidth, behavior: 'smooth' })
        window.setTimeout(updateScrollState, 220)
      }
      previousTabCount.value = count
    },
    { immediate: true },
  )

  return { canScrollLeft, canScrollRight, otherTabs, updateScrollState, scrollTabs }
}
