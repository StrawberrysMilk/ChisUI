import { onBeforeUnmount, onMounted, shallowRef } from 'vue'

/**
 * Keeps the page container inside the workspace viewport. The table area is
 * responsible for scrolling; the browser window must never become the scroll
 * container for a PageComponent page.
 */
export function usePageLayout() {
  const viewportHeight = shallowRef(0)

  const updateViewportHeight = () => {
    viewportHeight.value = window.innerHeight || document.documentElement.clientHeight
  }

  onMounted(() => {
    updateViewportHeight()
    window.addEventListener('resize', updateViewportHeight)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', updateViewportHeight)
  })

  return { viewportHeight, updateViewportHeight }
}
