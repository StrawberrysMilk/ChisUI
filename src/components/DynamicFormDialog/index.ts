import type { DynamicFormDialogResolvedProps } from './type'
import { computed, ref } from 'vue'
import DynamicForm from '../DynamicForm/index.vue'
import type { DynamicFormErrors, DynamicFormModel } from '../DynamicForm/type'

import type { Ref, SetupContext } from 'vue'

import type { DynamicFormDialogEmits } from './type'

export function useDynamicFormDialog(
  props: DynamicFormDialogResolvedProps,
  emit: SetupContext<DynamicFormDialogEmits>['emit'],
  open: Ref<boolean>,
  model: Ref<DynamicFormModel>,
) {
  const errors = ref<DynamicFormErrors>({})

  const formRef = ref<InstanceType<typeof DynamicForm> | null>(null)

  const formSchema = computed(() => props.schema)
  const submitting = ref(false)
  const busy = computed(() => submitting.value || props.loading)

  async function submit() {
    if (busy.value) return false
    submitting.value = true
    try {
      await formRef.value?.flushCustomFields()
      if (!(await formRef.value?.validate())) return false
      const value = { ...model.value }
      // Vue's submit listener and onSubmit prop reference the same callback.
      const result = props.onSubmit ? await props.onSubmit(value) : true
      if (result !== false) open.value = false
      return result !== false
    } finally {
      submitting.value = false
    }
  }

  function close() {
    open.value = false
    emit('close')
  }

  return { errors, formRef, formSchema, busy, submit, close }
}
