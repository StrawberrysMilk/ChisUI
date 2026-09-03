<template>
    <FormBuilder
      :rules="rules"
      :form-items="formItems"
      v-model="formData"
      ref="form"
    />
    <a-button @click="submit">提交</a-button>
</template>
<script setup lang="ts">
import { ref, useTemplateRef } from 'vue';
import type { FormInstance } from 'ant-design-vue';

defineOptions({
  name: 'DAGLPage'
});

const formInstance = useTemplateRef<FormInstance>('form')
const formData = ref({})
const formItems = [
  {
    type: 'input',
    label: '姓名',
    field: 'name',
    placeholder: '请输入姓名',
  },
  {
    type: 'date',
    label: '出生日期',
    field: 'birthDate',
    placeholder: '请选择出生日期',
    format: 'YYYY-MM-DD',
  },
]
// 如果需要动态显隐列 把formItems用computed包一下，传入配置项时加hidden即可
const rules = {
  name: [{ required: true, message: '请输入姓名' }],
  birthDate: [{ required: true, message: '请选择出生日期' }],
}
async function submit() {
  if (formInstance.value) {
    await formInstance.value.validate()
  }
  console.log('formData.value ==> ', formData.value)
}
</script>
