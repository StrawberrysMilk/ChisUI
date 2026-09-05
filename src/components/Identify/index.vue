<script setup lang="ts">
import { identifyDefaults, useIdentify } from './index'
import type { IdentifyProps } from './type'

defineOptions({ name: 'Identify' })
const props = withDefaults(defineProps<IdentifyProps>(), identifyDefaults)
defineExpose(useIdentify(props))
</script>

<template>
  <canvas
    id="s-canvas"
    :width="contentWidth"
    :height="contentHeight"
    @click="$emit('click', $event)"
  ></canvas>
</template>

<style scoped lang="scss" src="./index.scss"></style>
