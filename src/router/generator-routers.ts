const modules = import.meta.glob('@/views/**/*.vue');
const constantRouterComponents: Record<string, any> = {
  BasicLayout: () => import('@/layouts/BasicLayout/index.vue'),
  BlankLayout: () => import('@/layouts/BlankLayout/index.vue'),
  RouteView: () => import('@/layouts/RouteView/index.vue'),
  PageView: () => import('@/layouts/PageView/index.vue'),
  Iframe: () => import('@/layouts/Iframe/index.vue'),
  '404': () => import('@/views/404/index.vue'),
};

export const notFoundRouter = {
  path: '/:pathMatch(.*)*', // Vue3写法
  redirect: '/welcome',
  hidden: true,
};

const userAccount: any[] = [];

export const rootRouter = {
  key: '',
  name: 'MenuIndex.vue',
  path: '/',
  component: 'BasicLayout',
  redirect: '/welcome',
  meta: { title: '首页' },
  children: [] as any[],
};

export const generatorDynamicRouter = (data: any): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    try {
      const resNav = data;
      const menuNav: any[] = [];
      const childrenNav: any[] = [];
      listToTree(resNav, childrenNav, 0);
      listToTree(userAccount, childrenNav, 0);
      rootRouter.children = childrenNav;
      menuNav.push(rootRouter);
      const routers = generator(menuNav);
      routers.push(notFoundRouter);
      resolve(routers);
    } catch (err) {
      reject(err);
    }
  });
};

// 字符串转组件对象的统一方法
function resolveComponent(component: string) {
  // 先查常量组件
  if (constantRouterComponents[component]) {
    return constantRouterComponents[component];
  }
  // 再查 views 目录下的页面组件
  const viewPath = `/src/views/${component}.vue`;
  if (modules[viewPath]) {
    return modules[viewPath];
  }
  // 未找到时返回 404 组件
  return constantRouterComponents['404'];
}

export const generator = (routerMap: any[], parent?: any): any[] => {
  return routerMap.map((item) => {
    const { title, show, hideChildren, target, icon, link } = item.meta || {};
    const currentRouter: any = {
      id: item.id,
      pid: item.pid,
      path: item.path || `${(parent && parent.path) || ''}/${item.key}`,
      name: item.name || item.key || '',
      component: item.component ? resolveComponent(item.component) : undefined,
      meta: {
        id: item.id,
        pid: item.pid,
        title: title,
        icon: icon || undefined,
        target: target,
        link: link,
      },
    };
    if (show === false) currentRouter.hidden = true;
    if (hideChildren) currentRouter.hideChildrenInMenu = true;
    if (!currentRouter.path.startsWith('http')) {
      currentRouter.path = currentRouter.path.replace('//', '/');
    }
    if (item.redirect) currentRouter.redirect = item.redirect;
    if (item.children && item.children.length > 0) {
      currentRouter.children = generator(item.children, currentRouter);
    }
    return currentRouter;
  });
};

export const listToTree = (list: any[], tree: any[], parentId: number) => {
  list.forEach((item) => {
    if (item.pid == parentId) {
      const child = {
        ...item,
        key: item.key || item.name,
        children: [],
      };
      listToTree(list, child.children, item.id);
      if (child.children.length <= 0) {
        delete child.children;
      }
      tree.push(child);
    }
  });
};
