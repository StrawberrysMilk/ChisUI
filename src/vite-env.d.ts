/// <reference types="vite/client" />
declare module '@/router/index' {
  import { Router } from 'vue-router'
  const router: Router
  export default router
}
// 或使用通配符声明
declare module '@router/*' {
  const value: any
  export default value
}
