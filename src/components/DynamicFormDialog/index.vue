<script setup lang="ts">
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import DynamicForm from '../DynamicForm/index.vue'
import type { DynamicFormModel } from '../DynamicForm/type'

import type { DynamicFormDialogProps, DynamicFormDialogEmits } from './type'

import { useDynamicFormDialog } from './index'

defineOptions({ name: 'DynamicFormDialog' })

const props = withDefaults(defineProps<DynamicFormDialogProps>(), {
  title: '编辑',
  description: '',
  showFooter: true,
  showOk: true,
  cancelText: '取消',
  okText: '确定',
  loading: false,
})

const emit = defineEmits<DynamicFormDialogEmits>()

const open = defineModel<boolean>('open', { default: true })

const model = defineModel<DynamicFormModel>('modelValue', { required: true })

const { errors, formRef, formSchema, submit, close } = useDynamicFormDialog(
  props,
  emit,
  open,
  model,
)

defineExpose({ submit, getFormData: () => model.value, validate: () => formRef.value?.validate() })
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent
      class="max-h-[80vh] overflow-hidden sm:max-w-2xl"
      :style="width ? { width: typeof width === 'number' ? `${width}px` : width } : undefined"
    >
      <DialogHeader>
        <DialogTitle>{{ title }}</DialogTitle>
        <DialogDescription v-if="description">{{ description }}</DialogDescription>
      </DialogHeader>
      <div class="max-h-[55vh] overflow-y-auto px-1 py-2">
        <DynamicForm
          ref="formRef"
          v-model="model"
          v-model:errors="errors"
          :schema="formSchema"
          :readonly="readonly"
        />
      </div>
      <DialogFooter v-if="showFooter">
        <Button type="button" variant="outline" :disabled="loading" @click="close">{{
          cancelText
        }}</Button>
        <Button
          v-if="showOk"
          type="button"
          class="text-white"
          :disabled="loading"
          @click="submit"
          >{{ loading ? '保存中...' : okText }}</Button
        >
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<style scoped lang="scss" src="./index.scss"></style>
