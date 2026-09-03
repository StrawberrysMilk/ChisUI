declare module '@/router' {
  import type { Router } from 'vue-router'
  import type { RouteRecordRaw } from 'vue-router'
  const router: Router
  export const constantRoute: RouteRecordRaw[]
  export const constantRouterMap: RouteRecordRaw[]
  export default router
}

// interface ImportMetaEnv {
//   readonly VITE_API_BASE_URL: string;
//   // 可以在这里定义其他环境变量
// }

// interface ImportMeta {
//   readonly env: ImportMetaEnv;
// }

declare interface ViteEnv {
  VITE_USER_NODE_ENV: 'development' | 'production' | 'test'
  VITE_GLOB_APP_TITLE: string
  VITE_GLOB_APP_ALL_TITLE: string
  VITE_PORT: number
  VITE_OPEN: boolean
  VITE_REPORT: boolean
  // 路由模式
  VITE_ROUTER_MODE: 'hash' | 'history'
  // 压缩方式
  VITE_BUILD_COMPRESS: 'gzip' | 'brotli' | 'gzip,brotli' | 'none'
  // 压缩删除原始文件
  VITE_BUILD_COMPRESS_DELETE_ORIGIN_FILE: boolean
  VITE_DROP_CONSOLE: boolean
  VITE_PWA: boolean
  VITE_PUBLIC_PATH: string
  VITE_ROUTER_BASE: string
  VITE_API_URL: string
  VITE_PROXY: [string, string][]
}

// 定义 ImportMetaEnv 让 vite 可以识别 .env.xxx 文件
interface ImportMetaEnv extends ViteEnv {
  __: unknown
}
