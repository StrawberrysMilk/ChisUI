<script setup lang="ts">
import { useTemplateRef } from 'vue'
import '@wangeditor/editor/dist/css/style.css'
import type { WorkResponsibilityEditorEmits, WorkResponsibilityEditorProps } from './type'
import { useWorkResponsibilityEditor } from './index'
import './index.scss'

const props = withDefaults(defineProps<WorkResponsibilityEditorProps>(), {
  modelValue: '',
  disabled: false,
})
const emit = defineEmits<WorkResponsibilityEditorEmits>()
const toolbarElement = useTemplateRef<HTMLElement>('toolbar')
const editorElement = useTemplateRef<HTMLElement>('editor')
const { flushModelValue } = useWorkResponsibilityEditor(props, emit, toolbarElement, editorElement)

defineExpose({ flushModelValue })
</script>

<template>
  <section class="work-responsibility-editor" :aria-disabled="disabled">
    <div ref="toolbar" class="work-responsibility-editor__toolbar" />
    <div ref="editor" class="work-responsibility-editor__content" />
  </section>
</template>
