/**
 * 路由入口（静态路由 + 路由拦截器）
 */
import { createRouter, createWebHashHistory } from 'vue-router'
import { beforeInterceptor, afterInterceptor, errorInterceptor } from './interceptors'
import type { RouteRecordRaw } from 'vue-router'

/**
 * 静态路由格式参考：
 * {
    path: '/xx',
    name: 'xx',
    component: () => import('@/views/xx/xx.vue'),
    meta: {
      title: 'xx',
      hidden: true,
      hiddenTab: true,
      needLogin: false,
      cache: true,
      icon: 'HomeOutlined',
      isFirst: true,
      isLeaf: true,
      matchedPaths: ['/xx', '/xx/zz'], // 路由链
      target: '_blank', // 新窗口打开
    },
    children: []
  }
 * 动态路由由后端接口返回后通过 menuStore.loadMenuToRoute() 动态注册
 */
const staticRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/login/login-page.vue'),
    meta: {
      title: '欢迎登录',
      hidden: true,
      hiddenTab: true,
      needLogin: false,
    },
  },
  {
    path: '/',
    redirect: { name: 'index' },
    component: () => import('@/layout/index.vue'),
    meta: { hidden: true },
    children: [
      {
        path: '/home',
        name: 'index',
        component: () => import('@/views/home/index.vue'),
        meta: {
          title: '首页',
          cache: true,
        },
      },
      {
        path: '/personal-center',
        name: 'personal-center',
        component: () => import('@/views/modules/personal-center/index.vue'),
        meta: {
          title: '个人中心',
          hidden: true,
          cache: true,
        },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: staticRoutes,
})

// 路由拦截器
router.beforeEach(beforeInterceptor)
router.afterEach(afterInterceptor)
router.onError(errorInterceptor)

export default router
