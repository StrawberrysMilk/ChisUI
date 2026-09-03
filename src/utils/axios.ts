import type { App } from 'vue';
import type { AxiosInstance } from 'axios';

const VueAxios = {
  vm: {},
  installed: false,

  /**
   * Vue3 插件安装方法
   * @param {Object} app - Vue3 应用实例
   * @param {Object} instance - axios 实例
   */
  install(app: App, instance: AxiosInstance) {
    // 如果已经安装过，直接返回
    if (this.installed) {
      return;
    }
    this.installed = true;

    // 如果没有传入 axios 实例，输出警告
    if (!instance) {
      console.log('您需要传入 axios 实例', instance);
      return;
    }

    // 将 axios 实例添加到全局属性
    app.config.globalProperties.$axios = instance;
    app.config.globalProperties.$http = instance;

    // 同时添加到 app 本身，以便在 setup 外使用
    (app as any).axios = instance;

    // 提供方式，以便在组合式 API 中使用
    app.provide('axios', instance);
  }
};

export { VueAxios };
