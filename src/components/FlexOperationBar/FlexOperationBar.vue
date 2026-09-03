<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, shallowRef, useTemplateRef } from 'vue'

withDefaults(
  defineProps<{
    showButton?: boolean
    buttonTop?: string
    numtj?: number
    leftBt?: number
    windoWidth?: number
    rigbtnWidth?: number
    leftbutWidth?: number
    classTagWidth?: number
  }>(),
  {
    showButton: true,
    buttonTop: '',
    numtj: 0,
    leftBt: 1,
    windoWidth: 1920,
    rigbtnWidth: 0,
    leftbutWidth: 0,
    classTagWidth: 0,
  },
)

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
</script>

<template>
  <div ref="root" class="FlexOperation" :class="{ 'FlexOperation--stacked': !fitsInline }">
    <div ref="condition" class="FlexOperation__condition"><slot name="cxtj" /></div>
    <div v-if="showButton" ref="action" class="FlexOperation__actions">
      <slot name="otherButton" />
    </div>
  </div>
</template>

<style scoped>
.FlexOperation {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 64px;
  padding: 12px 16px;
  overflow: hidden;
  background: hsl(var(--background));
}

.FlexOperation__condition {
  min-width: 0;
  flex: 1 1 auto;
}

.FlexOperation__actions {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: flex-end;
  white-space: nowrap;
  position: absolute;
  top: 50%;
  right: 16px;
  transform: translateY(-50%);
}

.FlexOperation--stacked {
  flex-wrap: wrap;
  align-items: flex-start;
}

.FlexOperation--stacked .FlexOperation__condition {
  flex-basis: 100%;
}

.FlexOperation--stacked .FlexOperation__actions {
  position: static;
  width: 100%;
  justify-content: flex-end;
  transform: none;
}
</style>
