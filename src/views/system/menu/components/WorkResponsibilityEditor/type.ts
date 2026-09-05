export interface WorkResponsibilityEditorProps {
  modelValue?: string
  disabled?: boolean
}

export interface WorkResponsibilityEditorEmits {
  (event: 'update:modelValue', value: string): void
}
