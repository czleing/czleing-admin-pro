/**
 * 导航路由构建工具
 * 将动态菜单路由 + 开发中心路由 + 错误页路由 合并成最终的路由表
 */
import type { RouteRecordRaw } from 'vue-router'

/** 错误页静态路由 */
const errorRoutes: RouteRecordRaw[] = [
  {
    path: '/403',
    component: () => import('@/views/exception/403-page.vue'),
    meta: {
      hidden: true,
      title: '403',
    },
  },
  {
    path: '/404',
    name: '404',
    component: () => import('@/views/exception/404-page.vue'),
    meta: {
      hidden: true,
      hiddenTab: true,
      title: '404',
    },
  },
  {
    path: '/:catchAll(.*)',
    redirect: '/404',
    meta: {
      hidden: true,
      hiddenTab: true,
    },
  },
]

/** 开发中心 / 工具 静态路由 */
const developerRoutes: RouteRecordRaw[] = [
  {
    path: '/developer',
    redirect: '/developer/demo',
    meta: {
      isFirst: true,
      icon: 'CodeOutlined',
      hidden: !import.meta.env.DEV,
      title: '开发中心',
    },
    children: [
      {
        path: '/developer/demo',
        component: () => import('@/views/demo/demo-page.vue'),
        meta: {
          title: 'Demo',
          icon: 'ExperimentOutlined',
          isLeaf: true,
          matchedPaths: ['/developer', '/developer/demo'],
          cache: true,
        },
      },
      {
        path: '/tool/gen',
        component: () => import('@/views/modules/tool/gen/index.vue'),
        meta: {
          title: '代码生成',
          icon: 'CodeOutlined',
          isLeaf: true,
          matchedPaths: ['/developer', '/tool/gen'],
          cache: true,
        },
      },
      {
        path: import.meta.env.VITE_APP_BASE_API + '/swagger-ui/index.html',
        component: () => import('@/views/exception/404-page.vue'),
        meta: {
          title: '接口文档',
          icon: 'ApiOutlined',
          target: '_blank',
        },
      },
      {
        path: '/developer/form',
        component: () => import('@/views/modules/example/form/index.vue'),
        meta: {
          title: '表单示例',
          icon: 'ExperimentOutlined',
          isLeaf: true,
          matchedPaths: ['/developer', '/developer/form'],
          cache: true,
        },
      },
      {
        path: '/developer/chart',
        component: () => import('@/views/modules/example/chart/index.vue'),
        meta: {
          title: '图表示例',
          icon: 'ExperimentOutlined',
          isLeaf: true,
          matchedPaths: ['/developer', '/developer/chart'],
          cache: true,
        },
      },
    ],
  },
  {
    path: '/test',
    redirect: '/test/demo',
    meta: {
      title: '测试目录',
      isFirst: true,
      icon: 'CodeOutlined',
      hidden: !import.meta.env.DEV,
    },
    children: [
      {
        path: '/test/demo',
        component: () => import('@/views/demo/demo-page.vue'),
        meta: {
          title: 'Demo',
          icon: 'ExperimentOutlined',
          isLeaf: true,
          matchedPaths: ['/test', '/test/demo'],
          cache: true,
        },
      },
    ],
  },
  {
    path: '/test2/demo2',
    component: () => import('@/views/demo/demo-page.vue'),
    meta: {
      title: '测试菜单',
      icon: 'ExperimentOutlined',
      hidden: !import.meta.env.DEV,
      isLeaf: true,
      matchedPaths: ['/test2', '/test2/demo2'],
      cache: true,
    },
  },
]

/**
 * 根据子菜单路由生成导航页路由信息
 * @param routes 后端接口返回的动态路由数组
 */
export function createNavRoute(routes: RouteRecordRaw[]): RouteRecordRaw {
  return {
    path: '/',
    redirect: { name: 'index' },
    component: () => import('@/layout/index.vue'),
    children: [...routes, ...developerRoutes, ...errorRoutes],
  }
}
