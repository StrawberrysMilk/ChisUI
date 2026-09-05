import type { DynamicFormField, DynamicFormModel } from '../DynamicForm/type'

export type DynamicFormDialogProps = {
  title?: string
  description?: string
  schema: DynamicFormField[]
  readonly?: boolean
  showFooter?: boolean
  showOk?: boolean
  width?: string | number
  cancelText?: string
  okText?: string
  loading?: boolean
  onSubmit?: (model: DynamicFormModel) => unknown | Promise<unknown>
}

export type DynamicFormDialogEmits = { close: []; submit: [model: DynamicFormModel] }

export type DynamicFormDialogResolvedProps = Readonly<DynamicFormDialogProps> &
  Required<
    Pick<
      DynamicFormDialogProps,
      'title' | 'description' | 'showFooter' | 'showOk' | 'cancelText' | 'okText' | 'loading'
    >
  >
