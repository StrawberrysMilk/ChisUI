<script setup lang="ts">
import type { FormBuilderProps } from './type'

import { useFormBuilder } from './index'

defineOptions({
  name: 'FormBuilder',
})

const formData = defineModel<Record<string, any>>({
  default: () => ({}), // 默认值为空对象
})

const props = withDefaults(defineProps<FormBuilderProps>(), {
  formItems: () => [], // 默认表单项为空数组
  formConfig: () => ({}), // 默认表单配置为空对象
  span: 24, // 默认列跨度为24
})

const { formRef, formItemsComputed, ComponentItem, validate } = useFormBuilder(formData, props)

defineExpose({
  validate,
})
</script>

<template>
  <form ref="formRef" @submit.prevent>
    <div class="form-builder-grid">
      <div v-for="item of formItemsComputed" :key="item.field" :span="item.span || span">
        <div class="form-builder-item">
          <!-- 兼容一下 label传递vnode的场景 -->
          <div class="form-builder-label">
            <span v-if="typeof item.label === 'function'">
              <component :is="item.label()"></component>
            </span>
            <span v-else>{{ item.label }}</span>
          </div>
          <!-- 定义插槽 如果外面传了插槽以外面传的为准就不渲染对应的组件了 -->
          <slot :name="item.field">
            <ComponentItem :item="item"> </ComponentItem>
          </slot>
        </div>
      </div>
    </div>
  </form>
</template>

<style scoped lang="scss" src="./index.scss"></style>
