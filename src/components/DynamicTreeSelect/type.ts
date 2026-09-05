import type { DynamicTreeNode } from '@/components/DynamicForm/type'

export interface DynamicTreeSelectProps {
  modelValue?: string | number | null
  treeData?: DynamicTreeNode[]
  placeholder?: string
  disabled?: boolean
  ariaInvalid?: boolean
}

export interface DynamicTreeSelectEmits {
  (event: 'update:modelValue', value: string | number | null): void
}
