import type { ThemeConfig } from 'ant-design-vue/es/config-provider/context';

export const themeConfig: ThemeConfig = {
  token: {
    // 主色调
    colorPrimary: '#00badf',
    colorPrimaryHover: '#33c8e8',
    colorPrimaryActive: '#0099c7',
    colorPrimaryBorder: '#00badf',
    colorPrimaryBorderHover: '#33c8e8',

    // 文字颜色
    colorPrimaryText: '#ffffff',
    colorPrimaryTextHover: '#ffffff',
    colorPrimaryTextActive: '#ffffff',

    // 其他相关颜色
    colorLink: '#00badf',
    colorLinkHover: '#33c8e8',
    colorLinkActive: '#0099c7',

    // 边框圆角
    borderRadius: 6,

    // 阴影
    boxShadow: '0 2px 8px rgba(0, 186, 223, 0.15)',
    boxShadowSecondary: '0 2px 8px rgba(0, 186, 223, 0.12)',
  },
  components: {
    Button: {
      // 按钮特定配置
      colorPrimary: '#00badf',
      colorPrimaryHover: '#33c8e8',
      colorPrimaryActive: '#0099c7',
      borderRadius: 6,
    },
  },
};
