declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

// 为所有 Vue 组件提供更通用的类型支持
declare module '@/components/*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

// 为相对路径的 Vue 文件添加声明
declare module './*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module '../*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}



declare module 'vue' {
  export interface GlobalComponents {
    Identify: typeof import('@/components/Identify/index.vue')['default'];
  }
}

export {};
