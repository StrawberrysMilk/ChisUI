<template>
  <form ref="formRef" @submit.prevent>
    <div class="form-builder-grid">
      <div
        v-for="item of formItemsComputed"
        :key="item.field"
        :span="item.span || span"
      >
        <div class="form-builder-item">
          <!-- 兼容一下 label传递vnode的场景 -->
          <template v-slot:label>
            <span v-if="typeof item.label === 'function'">
              <component :is="item.label()"></component>
            </span>
            <span v-else>{{ item.label }}</span>
          </template>
          <!-- 定义插槽 如果外面传了插槽以外面传的为准就不渲染对应的组件了 -->
          <slot :name="item.field">
            <ComponentItem :item="item"> </ComponentItem>
          </slot>
        </div>
      </div>
    </div>
  </form>
</template>

<script lang="ts" setup>
import { getFormItemComponent } from './config';
import { type Component, ref, computed, h, VNode } from 'vue';

defineOptions({
  name: 'FormBuilder',
});

interface IFormItem<T extends object = Record<string, any>> {
  // 表单项 label
  label?: string | (() => VNode);
  // 表单项绑定字段
  field: string;
  // 占位符
  placeholder?: any;
  // 禁用标识
  disabled?: boolean;
  // 表单项属性，组件会将所有的 props 传递给 type 绑定的组件
  props?: T;
  // 给formItem传递的props 可写优先级更高的 labelCol配置
  formProps?: any;
  // 组件类型，根据所传递的类型，动态渲染表单项，默认显示为 input 输入框  也可以传入一个组件
  type?: string | Component;
  // 表单项栅格数
  span?: number;
  // 表单项唯一标识，未传递时会使用 field 作为唯一标识，若表单项中存在相同的 field 则必须传递 key
  key?: string;
  // 隐藏标识
  hidden?: boolean;
  // 是否必填
  required?: boolean;
  // 栅格配置
  [key: string]: any;
}

interface Props {
  formItems: IFormItem[];
  formConfig?: Record<string, any>;
  span?: number; // 列跨度
  rules?: Record<string, any>;
}

// 定义表单数据模型
const formData = defineModel<Record<string, any>>({
  default: () => ({}), // 默认值为空对象
});

// 定义组件属性并设置默认值
const props = withDefaults(defineProps<Props>(), {
  formItems: () => [], // 默认表单项为空数组
  formConfig: () => ({}), // 默认表单配置为空对象
  span: 24, // 默认列跨度为24
});

// 表单实例引用
const formRef = ref();

// 默认标签宽度
const defaultLabelWidth = '80px';

// 计算表单项，过滤掉隐藏的项
const formItemsComputed = computed(() => {
  return props.formItems.filter((item) => item.hidden !== true);
});

/**
 * 获取表单项属性
 */
function getFormItemProps(formItem: IFormItem) {
  const { formProps = {} } = formItem;
  const { labelCol = {}, ...rest } = formProps;
  const formLabelWidth = props?.formConfig?.labelCol?.style?.width;
  // 优先级：formItem.labelCol > formConfig.labelCol > defaultLabelWidth  要处理下 formProps配置了labelCol为0px的情况
  const labelWidth =
    labelCol?.style?.width === '0px' ? formLabelWidth : labelCol?.style?.width;
  return {
    labelCol: {
      style: {
        width: labelWidth || defaultLabelWidth,
      },
    },
    ...rest, // 其他属性
  };
}

const selectType = new Set(['select', 'date', 'time', 'treeSelect']);

// 传入input/select等组件时过滤掉不需要的props
const baseFieldReg =
  /^(type|label|props|on|span|key|hidden|required|rules|col|formProps)$/;
const ComponentItem = {
  props: ['item'],
  setup({ item }: { item: IFormItem }) {
    // 处理传递给组件的props 初始值即为配置项传入的props 过滤掉不需要传递的key
    const props = Object.keys(item).reduce<Record<string, any>>(
      (prev, key) => {
        if (!baseFieldReg.test(key)) {
          prev[key] = item[key];
        }
        return prev;
      },
      {
        ...item.props,
        //  formData: formData.value
      }
    );

    if (!('placeholder' in props)) {
      const { type } = item;
      let text = '请输入';
      if (typeof type === 'string' && selectType.has(type)) {
        text = '请选择';
      }
      // 确保item.label存在且为字符串
      const labelText = typeof item.label === 'string' ? item.label : '';
      props.placeholder = text + labelText;
    }
    // 通过 type 获取对应的组件进行渲染
    const tag = getFormItemComponent(item.type);
    return () =>
      h(
        tag,
        {
          ...props,
          // 处理成v-model  至于antD input框等需要 v-model:value才可以生效，会在getFormItemComponent内部劫持一下
          modelValue: formData.value[item.field],
          'onUpdate:modelValue': (val: string) => {
            formData.value[item.field] = val;
          }, // 更新 modelValue
        },
        // 配置型可以传入的插槽内容
        item.slots // 插槽内容
      );
  },
};

/**
 * 验证表单
 */
function validate() {
  return Promise.resolve(true);
}

defineExpose({
  validate,
});
</script>
