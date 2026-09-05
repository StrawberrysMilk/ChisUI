import type { Component, VNode } from 'vue'

export interface IFormItem<T extends object = Record<string, any>> {
  // 表单项 label
  label?: string | (() => VNode)
  // 表单项绑定字段
  field: string
  // 占位符
  placeholder?: any
  // 禁用标识
  disabled?: boolean
  // 表单项属性，组件会将所有的 props 传递给 type 绑定的组件
  props?: T
  // 给formItem传递的props 可写优先级更高的 labelCol配置
  formProps?: any
  // 组件类型，根据所传递的类型，动态渲染表单项，默认显示为 input 输入框  也可以传入一个组件
  type?: string | Component
  // 表单项栅格数
  span?: number
  // 表单项唯一标识，未传递时会使用 field 作为唯一标识，若表单项中存在相同的 field 则必须传递 key
  key?: string
  // 隐藏标识
  hidden?: boolean
  // 是否必填
  required?: boolean
  // 栅格配置
  [key: string]: any
}

export interface FormBuilderProps {
  formItems: IFormItem[]
  formConfig?: Record<string, any>
  span?: number // 列跨度
  rules?: Record<string, any>
}

export type FormBuilderResolvedProps = Readonly<FormBuilderProps> &
  Required<Pick<FormBuilderProps, 'formItems' | 'formConfig' | 'span'>>
