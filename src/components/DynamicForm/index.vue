<script setup lang="ts">
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import type { DynamicFormErrors, DynamicFormModel } from './type'

import type { DynamicFormProps } from './type'

import { useDynamicForm } from './index'

defineOptions({ name: 'DynamicForm' })

const props = defineProps<DynamicFormProps>()

const model = defineModel<DynamicFormModel>({ required: true })

const errors = defineModel<DynamicFormErrors>('errors', { default: () => ({}) })

const {
  isHidden,
  isDisabled,
  isRequired,
  fieldStyle,
  options,
  inputType,
  update,
  validate,
  resetValidation,
} = useDynamicForm(props, model, errors)

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
              <SelectItem
                v-for="option in options(item)"
                :key="String(option.value)"
                :value="option.value as any"
                :disabled="option.disabled"
              >
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
          <label
            v-for="option in options(item)"
            :key="String(option.value)"
            class="flex items-center gap-2 text-sm"
          >
            <RadioGroupItem :value="option.value as any" :disabled="option.disabled" />
            {{ option.label }}
          </label>
        </RadioGroup>
        <div v-else-if="item.type === 'switch'" class="flex min-h-9 items-center gap-3">
          <Switch
            :model-value="Boolean(model[item.field])"
            :disabled="isDisabled(item)"
            @update:model-value="update(item.field, $event)"
          />
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

<style scoped lang="scss" src="./index.scss"></style>
