import { Router } from 'vue-router';

// 定义路由元信息类型，确保包含 isDynamic 属性
interface DynamicRouteMeta {
  isDynamic?: boolean;
  [key: string]: any; // 允许其他任意属性
}

// 定义带有 meta 属性的路由类型
interface DynamicRoute {
  name?: string | symbol;
  meta?: DynamicRouteMeta;
  [key: string]: any; // 允许其他路由属性
}

/**
 * 清除所有动态路由
 * @param router Vue Router 实例
 */
export const resetDynamicRoutes = (router: Router): void => {
  // 获取所有路由
  const routes = router.getRoutes();

  // 遍历并移除动态路由
  routes.forEach((route: DynamicRoute) => {
    // 检查路由是否有 meta 且 meta.isDynamic 为 true
    if (route.name && route.meta?.isDynamic) {
      router.removeRoute(route.name);
    }
  });
};
