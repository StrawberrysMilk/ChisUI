import { createApp, h, ref, shallowReactive, type Component } from 'vue'
import { DynamicFormDialog } from '@/components'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { DynamicFormField, DynamicFormModel } from '@/components'

type DialogProps = Record<string, any>
type FormConfig = {
  schema?: DynamicFormField[]
  formItems?: any[]
  rules?: Record<string, any>
  validators?: Record<string, any>
  modelValue?: DynamicFormModel
  componentInstance?: { submit?: (model: DynamicFormModel) => unknown | Promise<unknown> }
  title?: string | (() => string)
  description?: string
  readonly?: boolean
}

function normalizeField(item: any, rules: Record<string, any> = {}): DynamicFormField {
  const type = item.type === 'UploadFile' ? item.component ?? item.type : item.type
  const fieldRules = item.rules ?? rules[item.field] ?? []
  const normalizedRules = Array.isArray(fieldRules) ? fieldRules : [fieldRules]
  const required = item.required ?? Boolean(normalizedRules.some((rule: any) => rule?.required))
  const rule = normalizedRules.find((entry: any) => entry?.required || entry?.validator)
  const componentProps = {
    ...(item.componentProps ?? {}),
    ...(item.inputProps ?? {}),
  }
  // `props` is the legacy component-props container. Keep layout/custom keys in meta.
  if (item.props && typeof item.props === 'object') Object.assign(componentProps, item.props)
  return {
    ...item,
    field: item.field,
    type,
    label: item.label,
    placeholder: item.placeholder,
    required,
    requiredMessage: normalizedRules.find((entry: any) => entry?.required)?.message,
    hidden: item.hidden,
    disabled: item.disabled,
    componentProps,
    validate: item.validate ?? (rule?.validator ? (value: unknown) => rule.validator(value) : undefined),
    colSpan: item.colSpan ?? (Number(item.span) >= 24 ? 2 : 1),
    meta: {
      span: item.span,
      labelCol: item.labelCol,
      wrapperCol: item.wrapperCol,
      hasFeedback: item.hasFeedback,
      ...item.meta,
    },
    options: item.options,
  } as DynamicFormField
}

function resolveTitle(title: DialogProps['title']) {
  return typeof title === 'function' ? title() : title
}

export function renderDialog(component: Component, props: DialogProps = {}, dialogProps: DialogProps = {}) {
  const open = ref(true)
  const loading = ref(false)
  const instance = ref<any>()
  const host = {
    setup() {
      function close() {
        open.value = false
      }
      async function confirm() {
        loading.value = true
        try {
          const result = props.onSubmit
            ? await props.onSubmit(instance.value)
            : await instance.value?.[props.methodKey ?? 'submit']?.()
          if (result !== false) close()
          return result
        } finally {
          loading.value = false
        }
      }
      const content = component === DynamicFormDialog
        ? h(component, {
            ref: instance,
            open: open.value,
            'onUpdate:open': (value: boolean) => { open.value = value },
            title: resolveTitle(dialogProps.title),
            description: dialogProps.description,
            schema: props.schema ?? [],
            modelValue: props.modelValue ?? {},
            readonly: props.readonly,
            cancelText: dialogProps.cancelText ?? '取消',
            okText: dialogProps.okText ?? '确定',
            loading: loading.value || dialogProps.confirmLoading,
            onSubmit: props.componentInstance?.submit,
            onClose: () => { open.value = false },
          })
        : h(component, { ...props, ref: instance })
      return () => h(
        Dialog,
        { open: open.value, 'onUpdate:open': (value: boolean) => { open.value = value } },
        { default: () => h(DialogContent, { class: dialogProps.class ?? 'max-h-[80vh] overflow-y-auto sm:max-w-2xl' }, {
          default: () => [
            h(DialogHeader, {}, { default: () => [h(DialogTitle, {}, { default: () => resolveTitle(dialogProps.title) }), dialogProps.description ? h(DialogDescription, {}, { default: () => dialogProps.description }) : null] }),
            content,
            h(DialogFooter, {}, { default: () => [h(Button, { variant: 'outline', disabled: loading.value, onClick: close }, { default: () => dialogProps.cancelText ?? '取消' }), h(Button, { class: 'text-white', disabled: loading.value, onClick: confirm }, { default: () => dialogProps.okText ?? '确定' })] }),
          ],
        }) },
      )
    },
  }
  const mountPoint = document.createElement('div')
  document.body.appendChild(mountPoint)
  const app = createApp(host)
  app.mount(mountPoint)
  const dispose = () => { app.unmount(); mountPoint.remove() }
  const stop = window.setInterval(() => { if (!open.value) { window.clearInterval(stop); window.setTimeout(dispose, 200) } }, 100)
  return { close: () => { open.value = false }, instance }
}

export function renderDialogForm(config: FormConfig, props: DialogProps = {}, dialogProps: DialogProps = {}) {
  // The schema contains component constructors and callback functions. A deep
  // proxy here makes large third-party components such as vxe-table reactive
  // and causes noticeable stalls whenever a field changes.
  const formProps = shallowReactive(config)
  const schema = formProps.schema ?? formProps.formItems?.map((item: any) => normalizeField(item, formProps.rules ?? formProps.validators ?? {})) ?? []
  const open = ref(true)
  const mountPoint = document.createElement('div')
  document.body.appendChild(mountPoint)
  const app = createApp({
    setup() {
      return () => h(DynamicFormDialog, {
        open: open.value,
        'onUpdate:open': (value: boolean) => { open.value = value },
        title: resolveTitle(dialogProps.title),
        description: dialogProps.description,
        schema,
        modelValue: formProps.modelValue ?? {},
        readonly: formProps.readonly ?? dialogProps.okButtonProps?.style?.display === 'none',
        cancelText: dialogProps.cancelText ?? '取消',
        okText: dialogProps.okText ?? '确定',
        showOk: dialogProps.okButtonProps?.style?.display !== 'none',
        width: dialogProps.width,
        onSubmit: formProps.componentInstance?.submit,
        onClose: () => { open.value = false },
      })
    },
  })
  app.mount(mountPoint)
  let resolveClosed!: () => void
  const closed = new Promise<void>((resolve) => { resolveClosed = resolve })
  const dispose = () => {
    app.unmount()
    mountPoint.remove()
    // Resolve only after the dialog's teleported content and overlay are removed.
    resolveClosed()
  }
  const stop = window.setInterval(() => { if (!open.value) { window.clearInterval(stop); window.setTimeout(dispose, 200) } }, 100)
  return { close: () => { open.value = false; return closed } }
}
