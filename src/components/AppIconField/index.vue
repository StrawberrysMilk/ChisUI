<script setup lang="ts">
import type { AppIconFieldProps, AppIconFieldEmits } from './type'

import { useAppIconField } from './index'

defineOptions({ name: 'AppIconField' })

const props = defineProps<AppIconFieldProps>()

const emit = defineEmits<AppIconFieldEmits>()

const { preview, chooseFile } = useAppIconField(props, emit)
</script>

<template>
  <div class="flex flex-col gap-2">
    <label
      class="relative flex h-20 w-20 cursor-pointer items-center justify-center overflow-hidden border border-dashed border-input bg-muted/20 transition-colors hover:bg-muted/50"
      :class="{ 'pointer-events-none opacity-50': disabled }"
    >
      <img v-if="preview" :src="preview" alt="应用图标预览" class="h-full w-full object-contain" />
      <span v-else class="flex flex-col items-center gap-1 text-muted-foreground">
        <span class="text-3xl font-light leading-none">+</span>
        <span class="text-[11px]">点击上传图片</span>
      </span>
      <input
        class="sr-only"
        type="file"
        accept="image/*"
        :disabled="disabled"
        @change="chooseFile"
      />
    </label>
  </div>
</template>

<style scoped lang="scss" src="./index.scss"></style>
