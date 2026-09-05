import { computed, ref } from 'vue'
import type { DynamicTreeSelectProps, DynamicTreeSelectEmits } from './type'

export function useDynamicTreeSelect(
  props: Readonly<DynamicTreeSelectProps>,
  emit: DynamicTreeSelectEmits,
) {
  const open = ref(false)
  const expanded = ref<Set<string>>(new Set())
  const selected = computed(() => findNode(props.treeData ?? [], props.modelValue))

  function nodeKey(node: any, index: number) {
    return String(node.value ?? node.id ?? `${node.label ?? node.title ?? node.name}-${index}`)
  }
  function label(node: any) {
    return String(node.label ?? node.title ?? node.name ?? node.value ?? node.id ?? '')
  }
  function toggle(node: any, index: number) {
    const key = nodeKey(node, index)
    const next = new Set(expanded.value)
    next.has(key) ? next.delete(key) : next.add(key)
    expanded.value = next
  }
  function choose(node: any) {
    if (node.disabled) return
    emit('update:modelValue', (node.value ?? node.id ?? null) as string | number | null)
    open.value = false
  }
  return { open, expanded, selected, nodeKey, label, toggle, choose }
}

function findNode(nodes: any[], value: unknown): any {
  for (const node of nodes) {
    if (String(node.value ?? node.id ?? '') === String(value ?? '')) return node
    const found = findNode(node.children ?? [], value)
    if (found) return found
  }
  return undefined
}
