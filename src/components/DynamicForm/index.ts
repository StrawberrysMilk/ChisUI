import { computed, toValue } from 'vue'
import type {
  DynamicFormContext,
  DynamicFormErrors,
  DynamicFormField,
  DynamicFormModel,
  DynamicFormValue,
} from './type'

import type { Ref } from 'vue'

import type { DynamicFormProps } from './type'

export function useDynamicForm(
  props: Readonly<DynamicFormProps>,
  model: Ref<DynamicFormModel>,
  errors: Ref<DynamicFormErrors>,
) {
  const context = computed<DynamicFormContext>(() => ({ model: model.value }))

  function resolve<T>(source: DynamicFormValue<T> | undefined, fallback: T): T {
    if (source === undefined) return fallback
    if (typeof source === 'function')
      return (source as (context: DynamicFormContext) => T)(context.value)
    return toValue(source)
  }

  function isHidden(item: DynamicFormField) {
    return resolve(item.hidden, false)
  }

  function isDisabled(item: DynamicFormField) {
    return props.readonly || resolve(item.disabled, false)
  }

  function isRequired(item: DynamicFormField) {
    return resolve(item.required, false)
  }

  function fieldStyle(item: DynamicFormField) {
    const labelSpan = Number((item.labelCol as any)?.span ?? 6)
    const wrapperSpan = Number((item.wrapperCol as any)?.span ?? Math.max(24 - labelSpan, 1))
    return { '--dynamic-label-width': `${(labelSpan / (labelSpan + wrapperSpan)) * 100}%` }
  }

  function options(item: DynamicFormField) {
    return resolve(item.options, [])
  }

  function treeData(item: DynamicFormField) {
    return resolve(item.treeData, [])
  }

  function inputType(item: DynamicFormField) {
    return item.type === 'number' ? 'number' : 'text'
  }

  function update(field: string, value: unknown) {
    model.value[field] = value
    if (errors.value[field]) errors.value[field] = undefined
  }

  async function validate() {
    const nextErrors: DynamicFormErrors = {}
    for (const item of props.schema) {
      if (isHidden(item) || item.type === 'separator') continue
      const value = model.value[item.field]
      if (
        isRequired(item) &&
        (value === undefined || value === null || String(value).trim() === '')
      ) {
        nextErrors[item.field] =
          item.requiredMessage ??
          `请${item.type === 'select' || item.type === 'radioGroup' ? '选择' : '填写'}${item.label ?? '该字段'}`
        continue
      }
      const message = await item.validate?.(value, context.value)
      if (message) nextErrors[item.field] = message
    }
    errors.value = nextErrors
    return Object.keys(nextErrors).length === 0
  }

  function resetValidation() {
    errors.value = {}
  }

  return {
    isHidden,
    isDisabled,
    isRequired,
    fieldStyle,
    options,
    treeData,
    inputType,
    update,
    validate,
    resetValidation,
  }
}
