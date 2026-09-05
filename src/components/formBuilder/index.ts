import type { FormBuilderResolvedProps } from './type'
import { getFormItemComponent } from './config'
import { ref, computed, h } from 'vue'

import type { Ref } from 'vue'

import type { IFormItem } from './type'

export function useFormBuilder(
  formData: Ref<Record<string, any>>,
  props: FormBuilderResolvedProps,
) {
  const formRef = ref()

  const defaultLabelWidth = '80px'

  const formItemsComputed = computed(() => {
    return props.formItems.filter((item) => item.hidden !== true)
  })

  function getFormItemProps(formItem: IFormItem) {
    const { formProps = {} } = formItem
    const { labelCol = {}, ...rest } = formProps
    const formLabelWidth = props?.formConfig?.labelCol?.style?.width
    // 优先级：formItem.labelCol > formConfig.labelCol > defaultLabelWidth  要处理下 formProps配置了labelCol为0px的情况
    const labelWidth = labelCol?.style?.width === '0px' ? formLabelWidth : labelCol?.style?.width
    return {
      labelCol: {
        style: {
          width: labelWidth || defaultLabelWidth,
        },
      },
      ...rest, // 其他属性
    }
  }

  const selectType = new Set(['select', 'date', 'time', 'treeSelect'])

  const baseFieldReg = /^(type|label|props|on|span|key|hidden|required|rules|col|formProps)$/

  const ComponentItem = {
    props: ['item'],
    setup({ item }: { item: IFormItem }) {
      // 处理传递给组件的props 初始值即为配置项传入的props 过滤掉不需要传递的key
      const props = Object.keys(item).reduce<Record<string, any>>(
        (prev, key) => {
          if (!baseFieldReg.test(key)) {
            prev[key] = item[key]
          }
          return prev
        },
        {
          ...item.props,
          //  formData: formData.value
        },
      )

      if (!('placeholder' in props)) {
        const { type } = item
        let text = '请输入'
        if (typeof type === 'string' && selectType.has(type)) {
          text = '请选择'
        }
        // 确保item.label存在且为字符串
        const labelText = typeof item.label === 'string' ? item.label : ''
        props.placeholder = text + labelText
      }
      // 通过 type 获取对应的组件进行渲染
      const tag = getFormItemComponent(item.type)
      return () =>
        h(
          tag,
          {
            ...props,
            // 处理成v-model  至于antD input框等需要 v-model:value才可以生效，会在getFormItemComponent内部劫持一下
            modelValue: formData.value[item.field],
            'onUpdate:modelValue': (val: string) => {
              formData.value[item.field] = val
            }, // 更新 modelValue
          },
          // 配置型可以传入的插槽内容
          item.slots, // 插槽内容
        )
    },
  }

  function validate() {
    return Promise.resolve(true)
  }

  return { formRef, formItemsComputed, ComponentItem, validate }
}
