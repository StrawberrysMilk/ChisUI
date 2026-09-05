<script setup lang="ts">
import { computed, toValue } from 'vue'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import type { DynamicFormContext, DynamicFormErrors, DynamicFormField, DynamicFormModel, DynamicFormValue } from './types'

const props = defineProps<{ schema: DynamicFormField[]; readonly?: boolean }>()
const model = defineModel<DynamicFormModel>({ required: true })
const errors = defineModel<DynamicFormErrors>('errors', { default: () => ({}) })
const context = computed<DynamicFormContext>(() => ({ model: model.value }))

function resolve<T>(source: DynamicFormValue<T> | undefined, fallback: T): T {
  if (source === undefined) return fallback
  if (typeof source === 'function') return (source as (context: DynamicFormContext) => T)(context.value)
  return toValue(source)
}

function isHidden(item: DynamicFormField) { return resolve(item.hidden, false) }
function isDisabled(item: DynamicFormField) { return props.readonly || resolve(item.disabled, false) }
function isRequired(item: DynamicFormField) { return resolve(item.required, false) }
function fieldStyle(item: DynamicFormField) {
  const labelSpan = Number((item.labelCol as any)?.span ?? 6)
  const wrapperSpan = Number((item.wrapperCol as any)?.span ?? Math.max(24 - labelSpan, 1))
  return { '--dynamic-label-width': `${(labelSpan / (labelSpan + wrapperSpan)) * 100}%` }
}
function options(item: DynamicFormField) { return resolve(item.options, []) }
function inputType(item: DynamicFormField) { return item.type === 'number' ? 'number' : 'text' }
function update(field: string, value: unknown) {
  model.value[field] = value
  if (errors.value[field]) errors.value[field] = undefined
}

async function validate() {
  const nextErrors: DynamicFormErrors = {}
  for (const item of props.schema) {
    if (isHidden(item) || item.type === 'separator') continue
    const value = model.value[item.field]
    if (isRequired(item) && (value === undefined || value === null || String(value).trim() === '')) {
      nextErrors[item.field] = item.requiredMessage ?? `请${item.type === 'select' || item.type === 'radioGroup' ? '选择' : '填写'}${item.label ?? '该字段'}`
      continue
    }
    const message = await item.validate?.(value, context.value)
    if (message) nextErrors[item.field] = message
  }
  errors.value = nextErrors
  return Object.keys(nextErrors).length === 0
}

function resetValidation() { errors.value = {} }
defineExpose({ validate, resetValidation })
</script>

<template>
  <FieldGroup class="dynamic-form-grid">
    <template v-for="item in schema" :key="item.field">
      <Separator v-if="item.type === 'separator' && !isHidden(item)" class="md:col-span-2" />
      <Field
        v-else-if="!isHidden(item)"
        orientation="horizontal"
        :style="fieldStyle(item)"
        :class="item.colSpan === 2 ? 'md:col-span-2' : undefined"
        :data-invalid="Boolean(errors[item.field]) || undefined"
        :data-disabled="isDisabled(item) || undefined"
      >
        <FieldLabel v-if="item.label" :for="item.field" class="dynamic-field-label shrink-0 pt-2">
          {{ item.label }}<span v-if="isRequired(item)" class="text-destructive"> *</span>
        </FieldLabel>

        <Input
          v-if="item.type === 'input' || item.type === 'number'"
          :id="item.field"
          :model-value="model[item.field]"
          :type="inputType(item)"
          :placeholder="item.placeholder"
          :disabled="isDisabled(item)"
          :aria-invalid="Boolean(errors[item.field]) || undefined"
          v-bind="item.componentProps"
          @update:model-value="update(item.field, $event)"
        />
        <Textarea
          v-else-if="item.type === 'textarea'"
          :id="item.field"
          :model-value="model[item.field]"
          :placeholder="item.placeholder"
          :disabled="isDisabled(item)"
          :aria-invalid="Boolean(errors[item.field]) || undefined"
          v-bind="item.componentProps"
          @update:model-value="update(item.field, $event)"
        />
        <Select
          v-else-if="item.type === 'select'"
          :model-value="model[item.field]"
          :disabled="isDisabled(item)"
          @update:model-value="update(item.field, $event)"
        >
          <SelectTrigger :id="item.field" :aria-invalid="Boolean(errors[item.field]) || undefined">
            <SelectValue :placeholder="item.placeholder ?? `请选择${item.label ?? ''}`" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem v-for="option in options(item)" :key="String(option.value)" :value="option.value as any" :disabled="option.disabled">
                {{ option.label }}
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <RadioGroup
          v-else-if="item.type === 'radioGroup'"
          :model-value="model[item.field]"
          :disabled="isDisabled(item)"
          class="flex min-h-9 flex-wrap items-center gap-5"
          @update:model-value="update(item.field, $event)"
        >
          <label v-for="option in options(item)" :key="String(option.value)" class="flex items-center gap-2 text-sm">
            <RadioGroupItem :value="option.value as any" :disabled="option.disabled" />
            {{ option.label }}
          </label>
        </RadioGroup>
        <div v-else-if="item.type === 'switch'" class="flex min-h-9 items-center gap-3">
          <Switch :model-value="Boolean(model[item.field])" :disabled="isDisabled(item)" @update:model-value="update(item.field, $event)" />
          <span class="text-sm text-muted-foreground">{{ model[item.field] ? '是' : '否' }}</span>
        </div>
        <component
          :is="item.type"
          v-else
          :model-value="model[item.field]"
          :disabled="isDisabled(item)"
          :aria-invalid="Boolean(errors[item.field]) || undefined"
          v-bind="item.componentProps"
          @update:model-value="update(item.field, $event)"
        />

        <FieldDescription v-if="item.description">{{ item.description }}</FieldDescription>
        <FieldError :errors="errors[item.field] ? [errors[item.field]] : []" />
      </Field>
    </template>
  </FieldGroup>
</template>

<style scoped>
.dynamic-form-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1rem;
}
.dynamic-form-grid [data-slot="field"] > :not([data-slot="field-label"]):not([data-slot="field-error"]) {
  min-width: 0;
  flex: 1;
}
.dynamic-field-label {
  flex: 0 0 var(--dynamic-label-width);
  justify-content: flex-end;
  text-align: right;
  padding-right: 0.75rem;
}
@media (min-width: 768px) {
  .dynamic-form-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
</style>
