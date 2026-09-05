import { nextTick, onBeforeUnmount, onMounted, shallowRef, useTemplateRef } from 'vue'

export function useFlexOperationBar() {
  const rootRef = useTemplateRef<HTMLElement>('root')

  const conditionRef = useTemplateRef<HTMLElement>('condition')

  const actionRef = useTemplateRef<HTMLElement>('action')

  const fitsInline = shallowRef(true)

  let observer: ResizeObserver | undefined

  function measure() {
    const root = rootRef.value
    const condition = conditionRef.value
    const action = actionRef.value
    if (!root || !condition || !action) {
      fitsInline.value = false
      return
    }
    // A condition slot commonly contains a full-width grid. Measure the
    // available viewport and action width instead of that grid's scrollWidth.
    // The original layout keeps the right-side actions on the same row on
    // desktop. Only stack them when the actual workspace becomes narrow.
    fitsInline.value = root.clientWidth >= 960
  }

  onMounted(async () => {
    await nextTick()
    measure()
    observer = new ResizeObserver(measure)
    if (rootRef.value) observer.observe(rootRef.value)
    if (conditionRef.value) observer.observe(conditionRef.value)
    if (actionRef.value) observer.observe(actionRef.value)
  })

  onBeforeUnmount(() => observer?.disconnect())

  return { fitsInline }
}
