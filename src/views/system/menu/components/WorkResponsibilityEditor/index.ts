import { nextTick, onBeforeUnmount, onMounted, shallowRef, watch, type Ref } from 'vue'
import { createEditor, createToolbar, type IDomEditor, type Toolbar } from '@wangeditor/editor'
import type { WorkResponsibilityEditorEmits, WorkResponsibilityEditorProps } from './type'

export function useWorkResponsibilityEditor(
  props: Readonly<WorkResponsibilityEditorProps>,
  emit: WorkResponsibilityEditorEmits,
  toolbarElement: Ref<HTMLElement | null>,
  editorElement: Ref<HTMLElement | null>,
) {
  const editor = shallowRef<IDomEditor | null>(null)
  let toolbar: Toolbar | null = null
  let syncingFromModel = false
  let isComposing = false
  let syncTimer: ReturnType<typeof setTimeout> | undefined
  let lastEmittedHtml: string | undefined
  const compositionEndWaiters = new Set<() => void>()

  function emitHtml(html: string) {
    lastEmittedHtml = html
    emit('update:modelValue', html)
    void nextTick(() => {
      if (lastEmittedHtml === html) lastEmittedHtml = undefined
    })
  }

  async function waitForEditorSettled() {
    await nextTick()
    await new Promise<void>((resolve) => setTimeout(resolve, 0))
    await new Promise<void>((resolve) => setTimeout(resolve, 0))
  }

  async function flushModelValue() {
    if (isComposing) {
      await new Promise<void>((resolve) => compositionEndWaiters.add(resolve))
    }
    // wangEditor applies the final IME input after compositionend/input handlers run.
    await waitForEditorSettled()
    if (syncTimer) {
      clearTimeout(syncTimer)
      syncTimer = undefined
    }
    const instance = editor.value
    if (!instance || syncingFromModel) return ''
    const html = instance.getHtml()
    if (html !== lastEmittedHtml) emitHtml(html)
    return html
  }

  function scheduleModelValueSync(instance: IDomEditor) {
    if (syncingFromModel || isComposing) return
    if (syncTimer) clearTimeout(syncTimer)
    syncTimer = setTimeout(() => {
      syncTimer = undefined
      if (editor.value === instance && !isComposing) {
        const html = instance.getHtml()
        if (html !== lastEmittedHtml) emitHtml(html)
      }
    }, 200)
  }

  function handleCompositionStart() {
    isComposing = true
  }

  function handleCompositionEnd() {
    isComposing = false
    setTimeout(() => {
      compositionEndWaiters.forEach((resolve) => resolve())
      compositionEndWaiters.clear()
      const instance = editor.value
      if (instance) scheduleModelValueSync(instance)
    }, 0)
  }

  onMounted(() => {
    if (!toolbarElement.value || !editorElement.value) return

    editorElement.value.addEventListener('compositionstart', handleCompositionStart, true)
    editorElement.value.addEventListener('compositionend', handleCompositionEnd, true)
    editor.value = createEditor({
      selector: editorElement.value,
      html: props.modelValue ?? '',
      config: {
        placeholder: '请输入菜单管理工作职责',
        readOnly: Boolean(props.disabled),
        // Let the dialog manage initial focus so the editor remains reliably clickable.
        autoFocus: false,
        onChange: (instance) => {
          scheduleModelValueSync(instance)
        },
        onBlur: () => {
          void flushModelValue()
        },
      },
      mode: 'default',
    })
    toolbar = createToolbar({
      editor: editor.value,
      selector: toolbarElement.value,
      mode: 'default',
    })
  })

  watch(
    () => props.modelValue,
    (value) => {
      const instance = editor.value
      const nextValue = value ?? ''
      if (!instance || instance.getHtml() === nextValue) return
      if (nextValue === lastEmittedHtml) {
        lastEmittedHtml = undefined
        return
      }
      lastEmittedHtml = undefined
      if (syncTimer) {
        clearTimeout(syncTimer)
        syncTimer = undefined
      }
      syncingFromModel = true
      try {
        instance.setHtml(nextValue)
      } finally {
        syncingFromModel = false
      }
    },
  )

  watch(
    () => props.disabled,
    (disabled) => {
      if (!editor.value) return
      void flushModelValue()
      if (disabled) editor.value.disable()
      else editor.value.enable()
    },
  )

  onBeforeUnmount(() => {
    if (syncTimer) clearTimeout(syncTimer)
    if (editorElement.value) {
      editorElement.value.removeEventListener('compositionstart', handleCompositionStart, true)
      editorElement.value.removeEventListener('compositionend', handleCompositionEnd, true)
    }
    compositionEndWaiters.forEach((resolve) => resolve())
    compositionEndWaiters.clear()
    toolbar?.destroy()
    toolbar = null
    editor.value?.destroy()
    editor.value = null
  })

  return { editor, flushModelValue }
}
