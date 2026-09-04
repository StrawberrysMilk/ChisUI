import type { Component, MaybeRefOrGetter } from 'vue'

export type DynamicFormModel = Record<string, any>

export interface DynamicFormOption {
  label: string
  value: string | number | boolean
  disabled?: boolean
}

export interface DynamicFormContext {
  model: DynamicFormModel
}

export type DynamicFormValue<T> = MaybeRefOrGetter<T> | ((context: DynamicFormContext) => T)

export type DynamicFormValidator = (
  value: unknown,
  context: DynamicFormContext,
) => string | undefined | Promise<string | undefined>

export interface DynamicFormField {
  field: string
  type: 'input' | 'number' | 'textarea' | 'select' | 'radioGroup' | 'switch' | 'separator' | Component
  label?: string
  description?: string
  placeholder?: string
  options?: DynamicFormValue<DynamicFormOption[]>
  hidden?: DynamicFormValue<boolean>
  disabled?: DynamicFormValue<boolean>
  required?: DynamicFormValue<boolean>
  colSpan?: 1 | 2
  componentProps?: Record<string, unknown>
  validate?: DynamicFormValidator
}

export type DynamicFormErrors = Record<string, string | undefined>
