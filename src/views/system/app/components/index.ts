import type { AppFormDialogProps } from './type'
import type { AppFormDialogMode } from './enum'
import { reactive, shallowRef } from 'vue'
import { AppIconField } from '@/components'
import { renderDialogForm } from '@/utils/CommonMethod/DynamicallyCreateForms'

export function useAppFormDialog(props: Readonly<AppFormDialogProps>) {
  const mode = shallowRef<AppFormDialogMode>('add')
  const dialog = shallowRef<ReturnType<typeof renderDialogForm>>()
  const items1 = [
    {
      type: 'input',
      label: '应用名称',
      field: 'name',
      hasFeedback: true,
      placeholder: '请输入应用名称',
      span: 24,
      labelCol: { span: 6 },
      wrapperCol: { span: 18 },
    },
    {
      type: 'input',
      label: '唯一编码',
      field: 'code',
      hasFeedback: true,
      placeholder: '请输入唯一编码',
      span: 24,
      labelCol: { span: 6 },
      wrapperCol: { span: 18 },
    },
    {
      type: 'input',
      label: '首页路由',
      field: 'router',
      placeholder: '请输入首页路由',
      span: 24,
      labelCol: { span: 6 },
      wrapperCol: { span: 18 },
    },
    {
      type: AppIconField,
      label: '应用图标',
      field: 'iconBase',
      span: 24,
      labelCol: { span: 6 },
      wrapperCol: { span: 18 },
    },
    {
      type: 'number',
      label: '排序',
      field: 'sort',
      placeholder: '请输入排序值',
      span: 24,
      labelCol: { span: 6 },
      wrapperCol: { span: 18 },
      props: { min: 1, max: 1000 },
    },
  ]
  const rules = {
    name: [{ required: true, message: '请输入应用名称' }],
    code: [{ required: true, message: '请输入唯一编码' }],
  }

  function open(record: Record<string, any> | undefined, type?: number) {
    mode.value = record ? 'edit' : 'add'
    const formData = reactive(
      record
        ? { ...record, sort: record.sort || 100, active: record.active || 'N' }
        : {
            id: '',
            name: '',
            code: '',
            router: '',
            sort: 100,
            active: 'N',
            iconBase: '',
          },
    )
    dialog.value = renderDialogForm(
      {
        formItems: items1,
        rules,
        modelValue: formData,
        componentInstance: { submit: (values) => props.onSubmit(values, mode.value) },
      },
      {},
      {
        title: () => (mode.value === 'add' ? '新增应用' : '编辑应用'),
        width: window.innerWidth * 0.3,
        cancelText: '取消',
        okText: '确定',
        centered: true,
        description: '',
        okButtonProps: { style: { display: type === 1 ? 'none' : '' } },
      },
    )
  }

  function add(type?: number) {
    open(undefined, type)
  }
  function edit(record: Record<string, any>, type?: number) {
    open(record, type)
  }

  function close() {
    return dialog.value?.close()
  }
  return { add, edit, close }
}
