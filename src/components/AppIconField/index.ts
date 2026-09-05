import { computed } from 'vue'

import type { SetupContext } from 'vue'

import type { AppIconFieldProps, AppIconFieldEmits } from './type'

export function useAppIconField(
  props: Readonly<AppIconFieldProps>,
  emit: SetupContext<AppIconFieldEmits>['emit'],
) {
  const preview = computed(() => props.modelValue || '')

  function chooseFile(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => emit('update:modelValue', String(reader.result || ''))
    reader.readAsDataURL(file)
  }

  return { preview, chooseFile }
}
