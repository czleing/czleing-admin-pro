/**
 * 菜单、路由相关 store
 * 管理：侧边栏状态、菜单选中、动态菜单路由、一级菜单定位
 */
import { defineStore } from 'pinia'
import { RouterView } from 'vue-router'
import { createNavRoute } from '@/router/nav.routes'
import routers from '@/router'
import axios from '@/api'
import { isEmpty, isNotEmpty } from '@/utils'
import { EMenuType } from '@/enum'
import { useSettingStore } from './setting-store'
import type { Router, RouteRecordRaw, RouteMeta } from 'vue-router'

/** 后端返回的菜单节点 */
export interface MenuNode {
  path?: string
  queryParam?: string
  component?: string | ((...args: unknown[]) => unknown)
  redirect?: string
  name?: string
  needLogin?: boolean
  title?: string
  menuName?: string
  icon?: string
  isHidden?: boolean
  isCache?: boolean
  menuType?: string
  children?: MenuNode[]
}

/** 菜单路由 meta（项目在 router meta 上扩展的字段） */
export interface NavRouteMeta extends RouteMeta {
  /** 是否需要登录，默认 true */
  needLogin?: boolean
  /** 菜单标题 */
  title?: string
  /** 菜单图标 */
  icon?: string
  /** 是否在菜单中隐藏 */
  hidden?: boolean
  /** 是否开启 keepalive 缓存 */
  cache?: boolean
  /** 菜单类型，M 目录, C 菜单, F 功能 */
  menuType?: string
  /** 父级路由链地址，从一级路由开始 */
  matchedPaths?: string[]
  /** 是否是一级路由 */
  isFirst?: boolean
  /** 是否是叶子节点 */
  isLeaf?: boolean
  /** 打开方式，如 _blank */
  target?: string
}

/** 动态菜单路由 */
export interface NavRoute {
  path: string
  name?: string
  query?: Record<string, string>
  component?: RouteRecordRaw['component'] | ''
  redirect?: string
  meta: NavRouteMeta
  children?: NavRoute[]
}

/** 菜单类型：菜单项（枚举 init 后 eMenu 运行时值为 'C'，此处取枚举 id 以便与 menuType 做类型一致的比较） */
const MENU_TYPE_MENU = EMenuType.eMenu as unknown as string

/** 视图模块（用于懒加载后改写组件名） */
interface ViewModule {
  default: {
    name?: string
    __name?: string
  }
}

export const useMenuStore = defineStore('menu', {
  state: () => ({
    /** 左侧菜单栏是否打开，默认打开侧边栏 */
    isSidebarOpen: true,
    /** 打开的菜单，用于自动定位到菜单位置 */
    openKeys: [] as string[],
    /** 当前选中的菜单项 key 数组 */
    selectedKeys: [] as string[],
    /** 当前登录用户能看的所有菜单(路由树) */
    menuList: [] as NavRoute[],
    /** 导航页路由(所有动态路由) */
    navRoutes: null as NavRoute[] | null,
    /** 是否已加载菜单，用于路由拦截器中判断是否需要加载路由 */
    loaded: false,
    /** 当前选中的第一级路由，顶部菜单选中项 */
    firstRoutePath: null as string | null,
    /** 保存每个一级菜单最后一次打开的子菜单，用于下次自动激活， key: firstMenuPath, value: childMenuPath */
    latestChildPathMap: {} as Record<string, string>,
  }),
  actions: {
    /** 加载菜单数据，生成路由 */
    async loadMenuToRoute(force = false): Promise<void> {
      if (force || !this.loaded) {
        this.loaded = true
        try {
          const tree = await this.getMenuTree()
          const routes = this.menuToRoute(tree)
          this.menuList = routes
          const navRoute = createNavRoute(routes as unknown as RouteRecordRaw[])
          this.navRoutes = navRoute.children as unknown as NavRoute[]
          const navRoute2d = this.to2DRoutes(navRoute as unknown as NavRoute)
          routers.addRoute(navRoute2d as unknown as RouteRecordRaw)
        } catch (e) {
          // 接口服务无效时，只加载本地路由
          const navRoute = createNavRoute([])
          this.navRoutes = navRoute.children as unknown as NavRoute[]
          const navRoute2d = this.to2DRoutes(navRoute as unknown as NavRoute)
          routers.addRoute(navRoute2d as unknown as RouteRecordRaw)
        }
      }
    },
    /** 获取当前用户的菜单树 */
    async getMenuTree(): Promise<MenuNode[]> {
      const menuList = await axios.get<MenuNode[]>('/getMenuTree')
      return menuList
    },
    /**
     * 将菜单树转成路由树
     * @param menuTree 后端返回的菜单树
     */
    menuToRoute(menuTree: MenuNode | MenuNode[]): NavRoute[] {
      const tree: MenuNode[] = Array.isArray(menuTree) ? menuTree : [menuTree]
      // 拿到所有组件的按需加载函数，需要时执行
      const views = import.meta.glob('@/views/**/*.vue') as Record<string, () => Promise<ViewModule>>

      /**
       * 获取菜单对应组件
       * @param component 后端配置的组件标识
       */
      const getComponent = (component: MenuNode['component']): NavRoute['component'] => {
        if (component === 'Layout') {
          return () => import('@/layout/index.vue')
        } else if (component === 'RouterView' || component === 'ParentView') {
          return RouterView as unknown as RouteRecordRaw['component']
        } else if (typeof component === 'function') {
          return component as unknown as RouteRecordRaw['component']
        } else if (component) {
          const path = `/src/views/${component}.vue`
          const loader = views[path]
          if (!loader) return ''
          // 返回按需加载函数
          return () => {
            const componentPromise = loader()
            return componentPromise.then((result) => {
              // 修改组件名为 路径 + 文件名，保证组件名唯一，便于 keepalive 缓存
              result.default.name = result.default.__name = `/views/${component}`
              return result
            })
          }
        } else {
          return ''
        }
      }

      const transform = (list: MenuNode[], parentPaths: string[] = []): NavRoute[] => {
        return list.map((item) => {
          let currPath = item.path
          if (currPath && currPath.charAt(0) !== '/') {
            currPath = '/' + currPath
            currPath = (parentPaths.at(-1) ?? '') + currPath
          }
          return {
            path: currPath as string,
            query: item.queryParam ? JSON.parse(item.queryParam) : undefined,
            component: getComponent(item.component),
            redirect: item.redirect,
            // name: item.name,
            meta: {
              needLogin: item.needLogin || true,
              title: item.title || item.menuName,
              icon: item.icon,
              hidden: item.isHidden,
              cache: item.isCache || false,
              // 菜单类型，M 目录, C 菜单, F 功能
              menuType: item.menuType,
              // 保存父级路由链地址，从一级路由开始，用于根据当前路由，获取一级路由，设置顶部菜单选中
              matchedPaths: parentPaths.length > 0 ? parentPaths : [currPath as string],
              // 是否是一级路由
              isFirst: parentPaths.length === 0,
              // 是否是叶子节点
              isLeaf: isEmpty(item.children?.filter((c) => !c.isHidden)),
            },
            children: (isNotEmpty(item.children) && transform(item.children as MenuNode[], [...parentPaths, currPath as string])) || undefined,
          }
        })
      }
      const routes = transform(tree)
      return routes
    },
    /**
     * 将多级路由打成二级路由（只留首尾两级）
     * 让所有页面直接挂载在 Layout 下面，以解决 keepalive 无法缓存多级嵌套路由的问题
     * 打平之后，route.matched 原为匹配到的路由链，改为手动构建的 route.meta.mathedPaths
     * @param rootRoute nav 根路由
     * @returns 导航页路由树(2层)
     */
    to2DRoutes(rootRoute: NavRoute): NavRoute {
      const parent: NavRoute = { ...rootRoute, children: undefined }
      const children: NavRoute[] = []
      const appendLeaf = (routes?: NavRoute[]): void => {
        if (!routes) return
        routes.forEach((route) => {
          if (route.children && route.children.length > 0) {
            if (route.redirect) {
              children.push(route)
            }
            appendLeaf(route.children)
          } else if (route.path) {
            children.push({ ...route })
          }
        })
      }
      appendLeaf(rootRoute.children)
      parent.children = children
      return parent
    },
    /** 切换侧边栏展开状态 */
    toggleSidebar(): void {
      this.isSidebarOpen = !this.isSidebarOpen
    },
    /** 菜单点击 */
    handleMenuClick(router: Router, menu: NavRoute): void {
      if (menu.meta?.target) {
        window.open(menu.path, menu.meta.target)
        return
      }
      // 是菜单，直接打开
      if (menu.meta?.isLeaf || menu.meta?.menuType === MENU_TYPE_MENU) {
        router.push(menu.path)
      }
      if (menu.meta?.isFirst) {
        this.firstRoutePath = menu.path
      }
    },
    /** 路由变化处理 */
    handleRouteChange(routeFrom: { meta?: RouteMeta; fullPath?: string }, routeTo: { meta?: RouteMeta; fullPath?: string }): void {
      const settingStore = useSettingStore()
      // 记录每个一级菜单最后一次打开的子菜单，用于下次切换一级菜单时，自动激活该子菜单
      const firstPathFrom = (routeFrom?.meta as NavRouteMeta | undefined)?.matchedPaths?.[0]
      const firstPathTo = (routeTo?.meta as NavRouteMeta | undefined)?.matchedPaths?.[0]
      if (firstPathFrom !== firstPathTo && settingStore.menuLayout === 'top-left' && settingStore.autoOpenChildMenu && firstPathFrom) {
        this.latestChildPathMap[firstPathFrom] = routeFrom.fullPath as string
      }
    },
  },
  getters: {
    /** 顶部一级路由(用于渲染顶部一级菜单) */
    headerNavRoutes(): NavRoute[] | undefined {
      const settingStore = useSettingStore()
      switch (settingStore.menuLayout) {
        case 'top':
          return this.navRoutes ?? []
        case 'left':
          return []
        case 'top-left':
          return (this.navRoutes ?? []).map((item) => ({ ...item, children: undefined }))
      }
    },
    /** 左侧子路由（顶部一级路由的子路由，用于渲染左侧菜单） */
    leftNavRoutes(): NavRoute[] | undefined {
      const settingStore = useSettingStore()
      switch (settingStore.menuLayout) {
        case 'top':
          return []
        case 'left':
          return this.navRoutes ?? []
        case 'top-left':
          if (this.firstRoutePath) {
            return this.navRoutes?.find((route) => route.path === this.firstRoutePath)?.children ?? []
          }
          return []
      }
    },
  },
})
