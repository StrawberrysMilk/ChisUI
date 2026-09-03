import { createApp } from 'vue';
// Keep legacy application helpers in a lower-priority layer so they cannot
// override shadcn/Tailwind component utilities.
import '@/assets/css/global.less';
import './style.css';
import './core/lazy_use';
import App from './App.vue';
import router from './permission';
import pinia from '@/store';
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/reset.css';
import 'vue-sonner/style.css';
import 'vxe-table/lib/style.css';
import VxeUITable from 'vxe-table';
import { ConfigProvider } from 'ant-design-vue';
// 导入所有图标
import * as AntDesignIcons from '@ant-design/icons-vue';
import type { Component } from 'vue';
import { migrateLegacyAuthCache } from '@/utils/storage';
import ShadcnVue from '@/plugins/shadcn-vue';

const app = createApp(App);
migrateLegacyAuthCache();

// 全局注册所有图标
Object.keys(AntDesignIcons).forEach(key => {
  const component = (AntDesignIcons as any)[key];
  if (component && typeof component === 'object' && component.name) {
    app.component(key, component as Component);
  }
});

app.use(pinia);
app.use(router);
app.use(Antd);
app.use(VxeUITable);
app.use(ShadcnVue);
app.mount('#app');
