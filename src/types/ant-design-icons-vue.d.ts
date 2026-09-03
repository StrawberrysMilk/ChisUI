declare module '@ant-design/icons-vue' {
  import { Component } from 'vue';

  const icons: Record<string, Component>;
  export = icons;
  export default icons;

  // 导出一些常用的图标类型
  export const UserOutlined: Component;
  export const HomeOutlined: Component;
  export const SettingOutlined: Component;
  export const MenuOutlined: Component;
  export const SearchOutlined: Component;
  export const PlusOutlined: Component;
  export const EditOutlined: Component;
  export const DeleteOutlined: Component;
  export const CheckOutlined: Component;
  export const CloseOutlined: Component;
  export const DownOutlined: Component;
  export const UpOutlined: Component;
  export const LeftOutlined: Component;
  export const RightOutlined: Component;
  export const LoadingOutlined: Component;
  export const EyeOutlined: Component;
  export const EyeInvisibleOutlined: Component;
  // 可以根据需要添加更多图标
}
