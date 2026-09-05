import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { type Component, defineComponent, h } from 'vue'
import isString from 'lodash-es/isString'
// 获取type对应的组件
export const getFormItemComponent = (type?: string | Component): Component => {
  if (type && !isString(type)) return type
  // 只在 type 是 string 时查表
  const component = type && isString(type) ? formItemMap.get(type) : undefined
  // 如果查不到，兜底用 input，并用 ! 断言一定有值
  return component || formItemMap.get('input')!
}

/**
 * 将组件统一转换为支持 v-model 的组件。
 * 将传入的组件转换为支持 v-model 双向绑定的组件。
 * @param component 要转换为支持 v-model 的 Vue 组件
 * @param key 绑定属性的名称，默认为 'value'
 * @returns 返回一个新的包装组件，支持 v-model 绑定
 */
export function transformModelValue(component: Component, key = 'value'): Component {
  return defineComponent({
    setup(props: any, { attrs, slots, emit }) {
      return () => {
        const { modelValue, ..._props } = { ...props, ...attrs }
        return h(
          component,
          {
            ..._props,
            // 将接收到的v-model值传给 组件需要的 key（input是value  checkbox是checked）
            [key]: modelValue,
            // v-mode:value  变化时会触发的钩子   重新赋值触发为 modelValue 使得外面的v-model能生效
            [`onUpdate:${key}`]: emit.bind(null, 'update:modelValue'),
          },
          slots,
        )
      }
    },
  })
}

const formItemMap = new Map<string, Component>([
  ['input', transformModelValue(Input)],
  ['textarea', transformModelValue(Textarea)],
  ['number', transformModelValue(Input)],
  ['time', transformModelValue(Input)],
  ['date', transformModelValue(Input)],
  ['switch', Switch],
  ['select', transformModelValue(Select)],
])
