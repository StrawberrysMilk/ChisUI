<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ modelValue?: string; disabled?: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
const preview = computed(() => props.modelValue || '')

function chooseFile(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => emit('update:modelValue', String(reader.result || ''))
  reader.readAsDataURL(file)
}
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
      <input class="sr-only" type="file" accept="image/*" :disabled="disabled" @change="chooseFile" />
    </label>
  </div>
</template>
