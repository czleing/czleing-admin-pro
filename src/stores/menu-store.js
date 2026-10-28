import { defineStore } from 'pinia'
import { createNavRoute } from '@/router/nav.routes'
import routers from '@/router'
import axios from '@/api'
import { isEmpty, isNotEmpty } from '@/utils/index'
import { useSettingStore } from './setting-store'
import { RouterView } from 'vue-router'

/**
 * 菜单、路由相关 store
 */
export const useMenuStore = defineStore('menu', {
  state: () => ({
    isSidebarOpen: true,  // 左侧菜单栏是否打开，默认打开侧边栏
    openKeys: [],         // 打开的菜单，用于自动定位到菜单位置
    selectedKeys: [],     // 当前选中的菜单项 key 数组
    menuList: [],         // 当前登录用户能看的所有菜单(路由树)
    navRoutes: null,      // 导航页路由(所有动态路由)
    loaded: false,        // 是否已加载菜单，用于路由拦截器中判断是否需要加载路由
    firstRoutePath: null, // 当前选中的第一级路由，顶部菜单选中项
    latestChildPathMap: {}, // 保存每个一级菜单最后一次打开的子菜单，用于下次自动激活， key: firstMenuPath, value: childMenuPath
  }),
  actions: {
    /**
     * 加载菜单数据，生成路由
     */
    async loadMenuToRoute (force = false) {
      if (force || !this.loaded) {
        this.loaded = true
        try {
          const tree = await this.getMenuTree()
          const routes = this.menuToRoute(tree)
          this.menuList = routes
          const navRoute = createNavRoute(routes)
          this.navRoutes = navRoute.children
          const navRoute2d = this.to2DRoutes(navRoute)
          routers.addRoute(navRoute2d)
        } catch (e) {
          // 接口服务无效时，只加载本地路由
          const navRoute = createNavRoute([])
          this.navRoutes = navRoute.children
          const navRoute2d = this.to2DRoutes(navRoute)
          routers.addRoute(navRoute2d)
        }
      }
    },
    async getMenuTree () {
      const menuList = await axios.get('/getMenuTree')
      return menuList
    },
    /**
     * 将菜单树转成路由树
     * @param {*} menuTree 
     * @returns 
     */
    menuToRoute (menuTree) {
      if (!Array.isArray(menuTree)) {
        menuTree = [menuTree]
      }
      // const views = import.meta.glob('@/views/**/*.vue', { eager: true }) // eager = true 直接拿到组件，而不是拿到按需导入组件的方法
      const views = import.meta.glob('@/views/**/*.vue') // 拿到所有组件的按需加载函数，需要时执行
      const getComponent = component => {
        if (component === 'Layout') {
          return () => import('@/layout/index.vue')
        } else if (component === 'RouterView' || component === 'ParentView') {
          return RouterView
        } else if (typeof component === 'function') {
          return component
        } else if (component) {
          const path = `/src/views/${component}.vue`
          if (!views[path]) return ''
          // 返回按需加载函数
          return () => {
            const componentPromise = views[path]()
            return componentPromise.then(result => {
              // 修改组件名为 路径 + 文件名，保证组件名唯一，便于 keepalive 缓存
              result.default.name = result.default.__name = `/views/${component}`
              return result
            })
          }
        } else {
          return ''
        }
      }
      // const hasNameRoutes = []
      const transform = (list, parentPaths = []) => {
        return list.map(item => {
          // if (import.meta.env.VITE_APP_DEBUG_MODE === 'true' && item.name) {
          //   hasNameRoutes.push(item)
          // }
          let currPath = item.path
          if (currPath && currPath.indexOf(0) !== '/') {
            currPath = '/' + currPath
            currPath = (parentPaths.at(-1) ?? '') + currPath
          }
          return {
            path: currPath,
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
              matchedPaths: parentPaths.length > 0 ? parentPaths : [currPath],
              // 是否是一级路由
              isFirst: parentPaths.length === 0,
              // 是否是叶子节点
              isLeaf: isEmpty(item.children?.filter(c => !c.isHidden))
            },
            children: isNotEmpty(item.children) && transform(item.children, [...parentPaths, currPath]) || undefined
          }
        })
      }
      const routes = transform(menuTree)
      // if (import.meta.env.VITE_APP_DEBUG_MODE === 'true') {
      //   console.log('动态具名路由：', hasNameRoutes.map(item => `${item.name}: ${item.path}`).join(', '))
      // }
      return routes
    },
    /**
     * 将多级路由打成二级路由（只留首尾两级）
     * 让所有页面直接挂载在 Layout 下面，以解决 keepalive 无法缓存多级嵌套路由的问题
     * 打平之后，route.matched 原为匹配到的路由链，改为手动构建的 route.meta.mathedPaths
     * @param {Object} rootRoute nav根路由
     * @returns navRoute object, 导航页路由树(2层)
     */
    to2DRoutes (rootRoute) {
      const parent = { ...rootRoute, children: undefined }
      const children = []
      const appendLeaf = (routes) => {
        routes.forEach(route => {
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
    toggleSidebar () {
      this.isSidebarOpen = !this.isSidebarOpen
    },
    handleMenuClick (router, menu) {
      if (menu.meta?.target) {
        window.open(menu.path, menu.meta.target)
        return
      }
      if (menu.meta?.isLeaf || menu.meta?.menuType === EMenuType.eMenu) { // 是菜单，直接打开
        router.push(menu.path)
      }
      if (menu.meta?.isFirst) {
        this.firstRoutePath = menu.path
      }
    },
    handleRouteChange (routeFrom, routeTo) {
      const settingStore = useSettingStore()
      // 记录每个一级菜单最后一次打开的子菜单，用于下次切换一级菜单时，自动激活该子菜单
      const firstPathFrom = routeFrom?.meta?.matchedPaths?.[0]
      if (settingStore.menuLayout === 'top-left' && settingStore.autoOpenChildMenu && firstPathFrom) {
        this.latestChildPathMap[firstPathFrom] = routeFrom.fullPath
      }
    }
  },
  getters: {
    // 顶部一级路由(用于渲染顶部一级菜单)
    headerNavRoutes () {
      const settingStore = useSettingStore()
      switch (settingStore.menuLayout) {
        case 'top':
          return this.navRoutes ?? []
        case 'left':
          return []
        case 'top-left':
          return (this.navRoutes ?? []).map(item => ({ ...item, children: undefined }))
      }
    },
    // 左侧子路由（顶部一级路由的子路由，用于渲染左侧菜单）
    leftNavRoutes () {
      const settingStore = useSettingStore()
      switch (settingStore.menuLayout) {
        case 'top':
          return []
        case 'left':
          return this.navRoutes ?? []
        case 'top-left':
          if (this.firstRoutePath) {
            return this.navRoutes?.find(route => route.path === this.firstRoutePath)?.children ?? []
          }
          return []
      }
    }
  }
})
