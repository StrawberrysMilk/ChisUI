<script setup lang="ts">
import type { FlexOperationBarProps } from './type'

import { useFlexOperationBar } from './index'

defineOptions({ name: 'FlexOperationBar' })

withDefaults(defineProps<FlexOperationBarProps>(), {
  showButton: true,
  buttonTop: '',
  numtj: 0,
  leftBt: 1,
  windoWidth: 1920,
  rigbtnWidth: 0,
  leftbutWidth: 0,
  classTagWidth: 0,
})

const { fitsInline } = useFlexOperationBar()
</script>

<template>
  <div ref="root" class="FlexOperation" :class="{ 'FlexOperation--stacked': !fitsInline }">
    <div ref="condition" class="FlexOperation__condition"><slot name="cxtj" /></div>
    <div v-if="showButton" ref="action" class="FlexOperation__actions">
      <slot name="otherButton" />
    </div>
  </div>
</template>

<style scoped lang="scss" src="./index.scss"></style>
