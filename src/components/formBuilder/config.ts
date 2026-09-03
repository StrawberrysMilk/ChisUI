import {
  Cascader,
  Checkbox,
  CheckboxGroup,
  DatePicker,
  Input,
  InputNumber,
  Radio,
  RadioGroup,
  Slider,
  Switch,
  Textarea,
  TimePicker,
  TreeSelect,
  Select,
} from 'ant-design-vue';
import { type Component, defineComponent, h } from 'vue';
import isString from 'lodash-es/isString'
// 获取type对应的组件
export const getFormItemComponent = (type?: string | Component): Component => {
  if (type && !isString(type)) return type;
  // 只在 type 是 string 时查表
  const component = type && isString(type) ? formItemMap.get(type) : undefined;
  // 如果查不到，兜底用 input，并用 ! 断言一定有值
  return component || formItemMap.get('input')!;
};

/**
 * 由于 ant-design-vue 组件许多都是 v-model:value 绑定的，为了统一处理，使用这个函数将组件转换为支持 v-model 的组件。
 * 将传入的组件转换为支持 v-model 双向绑定的组件。
 * @param component 要转换为支持 v-model 的 Vue 组件
 * @param key 绑定属性的名称，默认为 'value'
 * @returns 返回一个新的包装组件，支持 v-model 绑定
 */
export function transformModelValue(
  component: Component,
  key = 'value'
): Component {
  return defineComponent({
    setup(props: any, { attrs, slots, emit }) {
      return () => {
        const { modelValue, ..._props } = { ...props, ...attrs };
        return h(
          component,
          {
            ..._props,
            // 将接收到的v-model值传给 组件需要的 key（input是value  checkbox是checked）
            [key]: modelValue,
            // v-mode:value  变化时会触发的钩子   重新赋值触发为 modelValue 使得外面的v-model能生效
            [`onUpdate:${key}`]: emit.bind(null, 'update:modelValue'),
          },
          slots
        );
      };
    },
  });
}

const formItemMap = new Map<string, Component>([
  ['input', transformModelValue(Input)],
  ['textarea', transformModelValue(Textarea)],
  ['number', transformModelValue(InputNumber)],
  ['time', transformModelValue(TimePicker)],
  [
    'date',
    transformModelValue((props, { slots, attrs }) =>
      h(DatePicker, { valueFormat: 'YYYY-MM-DD', ...attrs, ...props }, slots)
    ),
  ],
  ['cascader', Cascader],
  ['slider', Slider],
  ['checkbox', transformModelValue(Checkbox, 'checked')],
  ['checkboxGroup', CheckboxGroup],
  ['radio', Radio],
  ['radioGroup', transformModelValue(RadioGroup)],
  ['switch', Switch],
  ['treeSelect', TreeSelect],
  ['select', transformModelValue(Select)],
]);
