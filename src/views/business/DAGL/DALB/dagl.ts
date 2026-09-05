import type { Component } from 'vue';
import { renderDialog as renderShadcnDialog } from '@/utils/CommonMethod/DynamicallyCreateForms';

export const renderDialog = (
  component: Component,
  props?: any,
  modalProps?: any
) => {
  return renderShadcnDialog(component, props ?? {}, modalProps ?? {});
};
