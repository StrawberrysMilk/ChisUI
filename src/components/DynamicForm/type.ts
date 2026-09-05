import type { Component, MaybeRefOrGetter } from 'vue'
import type { DynamicFormFieldKind } from './enum'

export type DynamicFormModel = Record<string, any>

export interface DynamicFormOption {
  label: string
  value: string | number | boolean
  disabled?: boolean
}

export interface DynamicTreeNode {
  label?: string
  title?: string
  name?: string
  value?: string | number
  id?: string | number
  disabled?: boolean
  children?: DynamicTreeNode[]
  [key: string]: unknown
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
  type: DynamicFormFieldKind | Component
  label?: string
  description?: string
  placeholder?: string
  options?: DynamicFormValue<DynamicFormOption[]>
  treeData?: DynamicFormValue<DynamicTreeNode[]>
  hidden?: DynamicFormValue<boolean>
  disabled?: DynamicFormValue<boolean>
  required?: DynamicFormValue<boolean>
  colSpan?: 1 | 2
  componentProps?: Record<string, unknown>
  validate?: DynamicFormValidator
  requiredMessage?: string
  /** 原配置中未被动态表单直接消费的布局/扩展属性 */
  span?: number
  labelCol?: Record<string, unknown>
  wrapperCol?: Record<string, unknown>
  hasFeedback?: boolean
  meta?: Record<string, unknown>
  [key: string]: unknown
}

export type DynamicFormErrors = Record<string, string | undefined>

export type DynamicFormProps = { schema: DynamicFormField[]; readonly?: boolean }
