import { type ModalProps, Modal } from 'ant-design-vue';
import {
  type Component,
  h,
  ref,
  createApp,
  reactive,
  defineComponent,
} from 'vue';
// 避免重复创建空对象
const EMPTY_OBJ = Object.freeze({});
const renderDialog = (
  component: Component,
  props: Record<string, any> = EMPTY_OBJ,
  modalProps: ModalProps = EMPTY_OBJ
) => {
  // 调用方可以 renderDialog(Comp,{methodKey:'mySubmit' }) 组件内可以没有onSubmit方法，提交前就可以调这个methodKey方法了
  const { methodKey = 'submit', onSubmit } = props;
  const open = ref(false);
  const isLoading = ref(false);
  const instance = ref();
  const _modalProps = {
    onOk: async () => {
      isLoading.value = true;
      try {
        if (onSubmit) {
          await onSubmit(instance.value);
        } else if (instance.value?.[methodKey]) {
          await instance.value?.[methodKey]?.();
        }
        unMount();
      } finally {
        isLoading.value = false;
      }
      open.value = false;
    },
    onCancel() {
      open.value = false;
    },
    afterClose: () => {
      unMount();
    },
  };
  const _component = () => h(component, { ...props, ref: instance });
  // 使用reactive包一下  不需要title.value 相当于 外面可以传入一个title的ref 可以动态改title也可以响应式
  const reactiveModalProps = reactive(modalProps);
  const dialog = defineComponent({
    setup(_, { expose }) {
      return h(
        Modal,
        {
          ...reactiveModalProps,
          ..._modalProps,
          open: open.value,
          confirmLoading: isLoading.value,
        },
        _component
      );
    },
  });
  const app = createApp(dialog);
  const div = document.createElement('div');
  document.body.appendChild(div);
  app.mount(div);
  function unMount() {
    app.unmount();
    document.body.removeChild(div);
  }
};
