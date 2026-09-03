declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module '@/components/*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

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

declare module '@/components/Identify/identify.vue' {
  import type { DefineComponent } from 'vue';

  interface IdentifyProps {
    identifyCode?: string;
    fontSizeMin?: number;
    fontSizeMax?: number;
    backgroundColorMin?: number;
    backgroundColorMax?: number;
    colorMin?: number;
    colorMax?: number;
    lineColorMin?: number;
    lineColorMax?: number;
    dotColorMin?: number;
    dotColorMax?: number;
    contentWidth?: number;
    contentHeight?: number;
  }

  interface IdentifyEmits {
    click: (event: MouseEvent) => void;
  }

  const component: DefineComponent<IdentifyProps, {}, any, {}, {}, {}, {}, IdentifyEmits>;
  export default component;
}
