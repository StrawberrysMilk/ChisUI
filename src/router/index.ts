import type { RouteRecordRaw } from 'vue-router';
import { createRouter, createWebHistory } from 'vue-router';
import BasicLayout from '@/layouts/BasicLayout/index.vue';
// 对外暴露配置路由（常量路由）
export const constantRoute: Array<RouteRecordRaw> = [
  {
    // 登录
    path: '/',
    component: BasicLayout,
    redirect: '/home',
    name: 'index',
    children: [
      {
        path: '/home',
        name: 'home',
        meta: {
          requiresAuth: true, // 标识该路由需要校验用户是否登录
          title: '首页',
        },
        component: () => import('@/views/Home.vue'),
      },
      {
        path: '/chronic/hypertension',
        name: 'hypertension',
        meta: { requiresAuth: true, title: '高血压管理' },
        component: () => import('@/views/chronic/hypertension/index.vue'),
      },
      {
        path: '/system/app', name: 'system-app', meta: { requiresAuth: true, title: '应用管理' },
        component: () => import('@/views/system/app/index.vue'),
      },
      {
        path: '/system/menu', name: 'system-menu', meta: { requiresAuth: true, title: '菜单管理' },
        component: () => import('@/views/system/menu/index.vue'),
      },
      {
        path: 'recover',
        name: 'recover',
        component: () => import('@/views/Recover.vue') // 替换为实际组件路径
      }
    ]
  },
  {
    // 登录成功以后展示数据的路由
    path: '/login',
    name: 'login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录界面' },
    children: [],
  },
  {
    // 404
    path: '/404',
    component: () => import('@/views/404/index.vue'),
    name: '404',
  },
  {
    // 任意路由
    path: '/:pathMatch(.*)*',
    component: () => import('@/views/404/index.vue'),
    name: 'NotFound',
  }
];

const base = '/';
const router = createRouter({
  history: createWebHistory(base),
  routes: constantRoute,
});

export default router
// export const constantRouterMap = []
