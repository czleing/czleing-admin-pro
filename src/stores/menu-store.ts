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
import { toRouteRecord } from '@/router/types'
import type { Router, RouteMeta } from 'vue-router'
import type { MenuNode, NavRoute } from '@/router/types'

/** 菜单类型：菜单项（枚举 init 后 eMenu 即为字符串字面量类型 'C'，无需断言即可与 meta.menuType 比较） */
const MENU_TYPE_MENU = EMenuType.eMenu

/**
 * 安全解析后端菜单的 queryParam（JSON 字符串）
 * 单个菜单配置错误时仅告警并忽略，避免整个菜单树转换抛错、被外层 catch 吞掉后静默降级成本地路由，难以排查
 * @param raw queryParam 原始 JSON 字符串
 * @param menuName 菜单名称，用于告警定位
 * @returns 解析出的查询参数对象，为空或格式非法时返回 undefined
 */
function parseQueryParam(raw: string | undefined, menuName = ''): Record<string, unknown> | undefined {
  if (!raw) {
    return undefined
  }
  try {
    const parsed: unknown = JSON.parse(raw)
    if (parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>
    }
  } catch {
    // 非法 JSON，走下方统一告警
  }
  console.warn(`[menu-store] 菜单「${menuName}」的 queryParam 不是合法的 JSON 对象，已忽略：${raw}`)
  return undefined
}

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
          const navRoute = createNavRoute(routes)
          this.navRoutes = navRoute.children ?? []
          const navRoute2d = this.to2DRoutes(navRoute)
          routers.addRoute(toRouteRecord(navRoute2d))
        } catch (e) {
          // 接口服务无效时，只加载本地路由；打印原始错误，避免菜单转换异常被吞掉后无从排查
          console.error('[menu-store] 动态菜单加载失败，已降级为仅本地路由：', e)
          const navRoute = createNavRoute([])
          this.navRoutes = navRoute.children ?? []
          const navRoute2d = this.to2DRoutes(navRoute)
          routers.addRoute(toRouteRecord(navRoute2d))
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
       * @param menuName 菜单名称，组件找不到时用于告警定位
       */
      const getComponent = (component: MenuNode['component'], menuName = ''): NavRoute['component'] => {
        if (component === 'Layout') {
          return () => import('@/layout/index.vue')
        } else if (component === 'RouterView' || component === 'ParentView') {
          return RouterView
        } else if (component) {
          const path = `/src/views/${component}.vue`
          const loader = views[path]
          if (!loader) {
            console.warn(`[menu-store] 菜单「${menuName}」配置的组件未找到：${path}，该页面将不渲染内容`)
            return undefined
          }
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
          return undefined
        }
      }

      const transform = (list: MenuNode[], parentPaths: string[] = []): NavRoute[] => {
        return list.map((item) => {
          const menuName = item.title || item.menuName || item.path || ''
          const currPath = item.path
            ? item.path.startsWith('/')
              ? item.path
              : `${parentPaths.at(-1) ?? ''}/${item.path}`
            : ''
          return {
            path: currPath,
            query: parseQueryParam(item.queryParam, menuName),
            component: getComponent(item.component, menuName),
            redirect: item.redirect,
            meta: {
              needLogin: item.needLogin ?? true,
              title: item.title || item.menuName,
              icon: item.icon,
              hidden: item.isHidden,
              cache: item.isCache || false,
              // 菜单类型，M 目录, C 菜单, F 功能
              menuType: item.menuType,
              // 保存父级路由链地址，从一级路由开始，用于根据当前路由，获取一级路由，设置顶部菜单选中
              matchedPaths: parentPaths.length > 0 ? parentPaths : [currPath],
              // 是否是一级路由
              isFirst: parentPaths.length === 0,
              // 是否是叶子节点
              isLeaf: isEmpty(item.children?.filter((c) => !c.isHidden)),
            },
            children: (isNotEmpty(item.children) && transform(item.children ?? [], [...parentPaths, currPath])) || undefined,
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
    handleRouteChange(routeFrom: { meta?: RouteMeta; fullPath: string }, routeTo: { meta?: RouteMeta }): void {
      const settingStore = useSettingStore()
      // 记录每个一级菜单最后一次打开的子菜单，用于下次切换一级菜单时，自动激活该子菜单
      const firstPathFrom = routeFrom.meta?.matchedPaths?.[0]
      const firstPathTo = routeTo.meta?.matchedPaths?.[0]
      if (firstPathFrom !== firstPathTo && settingStore.menuLayout === 'top-left' && settingStore.autoOpenChildMenu && firstPathFrom) {
        this.latestChildPathMap[firstPathFrom] = routeFrom.fullPath
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
