import type { Component } from 'vue'
import { renderDialog as renderShadcnDialog } from '@/utils/CommonMethod/DynamicallyCreateForms'

export function renderDialog(component: Component, props: Record<string, any> = {}, modalProps: Record<string, any> = {}) {
  return renderShadcnDialog(component, props, modalProps)
}
