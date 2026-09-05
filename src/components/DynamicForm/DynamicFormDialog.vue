<script setup lang="ts">
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import DynamicForm from './DynamicForm.vue'
import type { DynamicFormErrors, DynamicFormField, DynamicFormModel } from './types'

const props = withDefaults(defineProps<{
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
}>(), {
  title: '编辑',
  description: '',
  showFooter: true,
  showOk: true,
  cancelText: '取消',
  okText: '确定',
  loading: false,
})
const emit = defineEmits<{ close: []; submit: [model: DynamicFormModel] }>()
const open = defineModel<boolean>('open', { default: true })
const model = defineModel<DynamicFormModel>('modelValue', { required: true })
const errors = ref<DynamicFormErrors>({})
const formRef = ref<InstanceType<typeof DynamicForm> | null>(null)
const formSchema = computed(() => props.schema)

async function submit() {
  if (!(await formRef.value?.validate())) return false
  const value = { ...model.value }
  emit('submit', value)
  const result = props.onSubmit ? await props.onSubmit(value) : true
  if (result !== false) open.value = false
  return result !== false
}

function close() {
  open.value = false
  emit('close')
}

defineExpose({ submit, getFormData: () => model.value, validate: () => formRef.value?.validate() })
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="max-h-[80vh] overflow-hidden sm:max-w-2xl" :style="width ? { width: typeof width === 'number' ? `${width}px` : width } : undefined">
      <DialogHeader>
        <DialogTitle>{{ title }}</DialogTitle>
        <DialogDescription v-if="description">{{ description }}</DialogDescription>
      </DialogHeader>
      <div class="max-h-[55vh] overflow-y-auto px-1 py-2">
        <DynamicForm ref="formRef" v-model="model" v-model:errors="errors" :schema="formSchema" :readonly="readonly" />
      </div>
      <DialogFooter v-if="showFooter">
        <Button type="button" variant="outline" :disabled="loading" @click="close">{{ cancelText }}</Button>
        <Button v-if="showOk" type="button" class="text-white" :disabled="loading" @click="submit">{{ loading ? '保存中...' : okText }}</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
