import { Modal } from 'ant-design-vue';
import Antd from 'ant-design-vue';
import { type Component, h, createApp, ref, defineComponent } from 'vue';

export const renderDialog = (
  component: Component,
  props?: any,
  modalProps?: any
) => {
  console.log(modalProps, 'modalProps');
  const componentInstance = ref();
  const ModalWrapper = defineComponent({
    setup() {
      return () =>
        h(
          Modal,
          {
            ...modalProps,
            open: modalProps.open.value,
            mask: modalProps.mask.value,
            async onOk(e: any) {
              await componentInstance.value?.validate?.();
              modalProps.onOk?.(e);
              if (modalProps.open) modalProps.open.value = false;
              if (modalProps.mask) modalProps.mask.value = false;
            },
            onCancel() {
              modalProps.onCancel?.();
              if (modalProps.open) modalProps.open.value = false;
              if (modalProps.mask) modalProps.mask.value = false;
            },
            afterClose() {
              unMount();
            }
          },
          {
            default: () => h(component, { ...props, ref: componentInstance }),
          }
        );
    },
  });
  const app = createApp(ModalWrapper);
  const div = document.createElement('div');
  document.body.appendChild(div);
  app.use(Antd);
  app.mount(div);

  function unMount() {
    app.unmount();
    document.body.removeChild(div);
  }
};
