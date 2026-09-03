import { computed, nextTick, onMounted, shallowRef, toValue, watch } from 'vue'
import type { CSSProperties, MaybeRefOrGetter } from 'vue'
import { useEventListener, useResizeObserver } from '@vueuse/core'

export interface UseAutoTableHeightOptions {
  /** 表格底部与视口底部之间预留的空间。 */
  bottomOffset?: MaybeRefOrGetter<number>
  /** 当前数据量；为 0 时不设置固定高度。 */
  dataLength?: MaybeRefOrGetter<number>
  /** 表格有数据时允许使用的最小高度。 */
  minHeight?: MaybeRefOrGetter<number>
  /** 高度重新计算后的回调。 */
  onHeightChange?: (height: number) => void
}

/**
 * 根据表格滚动容器到视口顶部的位置计算可用高度。
 *
 * 将 `containerRef` 绑定到 Table 外层的滚动容器，而不是 Table 本身：
 * `<div ref="containerRef" :style="containerStyle" class="overflow-auto">`。
 */
export function useAutoTableHeight(options: UseAutoTableHeightOptions = {}) {
  const containerRef = shallowRef<HTMLElement | null>(null)
  const height = shallowRef<number>()

  const calculateHeight = () => {
    const element = containerRef.value
    if (!element || !element.isConnected) return

    const dataLength = Math.max(0, toValue(options.dataLength ?? 0))
    if (dataLength === 0) {
      height.value = undefined
      options.onHeightChange?.(0)
      return
    }

    const bottomOffset = Math.max(0, toValue(options.bottomOffset ?? 60))
    const minHeight = Math.max(0, toValue(options.minHeight ?? 0))
    const top = element.getBoundingClientRect().top
    const availableHeight = Math.max(minHeight, window.innerHeight - top - bottomOffset)

    height.value = Number.isFinite(availableHeight) ? availableHeight : minHeight
    options.onHeightChange?.(height.value)
  }

  const scheduleCalculation = () => {
    window.requestAnimationFrame(calculateHeight)
  }

  const containerStyle = computed<CSSProperties>(() => {
    if (height.value === undefined) return { overflow: 'auto' }

    return {
      height: `${height.value}px`,
      maxHeight: `${height.value}px`,
      overflow: 'auto',
    }
  })

  useEventListener(window, 'resize', scheduleCalculation)
  useEventListener(document, 'fullscreenchange', scheduleCalculation)
  useResizeObserver(containerRef, scheduleCalculation)

  watch(
    [
      () => toValue(options.dataLength ?? 0),
      () => toValue(options.bottomOffset ?? 60),
      () => toValue(options.minHeight ?? 0),
    ],
    scheduleCalculation,
  )

  onMounted(async () => {
    await nextTick()
    scheduleCalculation()
  })

  return {
    containerRef,
    containerStyle,
    height,
    recalculate: scheduleCalculation,
  }
}
