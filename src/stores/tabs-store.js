import { defineStore } from 'pinia'
import router from '@/router'

/**
 * Tabs 栏相关 store
 */
export const useTabsStore = defineStore('tabs', {
  state: () => ({
    tabList: [], // 当前已打开过的路由数组，用于渲染 Tab 栏
    refreshing: false, // 当前页是否正在刷新
    favoriteTabs: [], // 收藏的Tabs
  }),
  actions: {
    // 打开 Tab，新增并选中 或 已存在则选中，遵循幂等性原则
    openTab (route) {
      if (!route || (!route.fullPath && !route.path)) return
      if (route.meta?.hiddenTab === true) return
      const exist = this.tabList.find(item => item.fullPath === route.fullPath)
      if (!exist) {
        // 对象瘦身，把不需要用到的属性剔除，只留下需要的属性
        // Tab 对象保留了大部分路由属性
        this.tabList.push({
          path: route.path,
          name: route.name,
          fullPath: route.fullPath,
          query: route.query,
          params: route.params,
          hash: route.hash,
          meta: route.meta,
          matched: route.matched.map(match => {
            return {
              path: match.path,
              name: match.name,
              redirect: match.redirect,
              meta: match.meta,
              components: match.components,
              componentName: match.components?.default?.name
            }
          })
        })
      }
    },
    // 删除 Tab
    removeTab (index) {
      // 没有找到则忽略
      if (index < 0 || index >= this.tabList.length) return
      // 如果删除的是当前选中的索引
      let newIndex = this.currentIndex
      if (index === newIndex) {
        if (this.tabList?.[newIndex + 1]) { // 如果后面有，选中后面一个
          newIndex = newIndex + 1
        } else if (newIndex > 0 && this.tabList?.[newIndex - 1]) { // 否则选中前面一个
          newIndex = newIndex - 1
        }
        if (newIndex !== this.currentIndex) {
          router.push(this.tabList[newIndex].fullPath)
        }
      }
      this.tabList.splice(index, 1)
      if (this.tabList.length === 0) {
        router.push({ name: 'index' })
      }
    },
    // 关闭 Tab
    closeTab (tabIndex) {
      this.removeTab(tabIndex)
    },
    // 清除其他 Tab
    clearOtherTabs (tabIndex) {
      const tab = this.tabList[tabIndex]
      const includeThis = tabIndex !== this.currentIndex
      this.tabList = this.tabList.filter((item, index) => index === tabIndex)
      if (includeThis) {
        router.push(tab.fullPath)
      }
    },
    // 清除左边 Tab
    clearLeftTabs (tabIndex) {
      const tab = this.tabList[tabIndex]
      const includeThis = this.currentIndex < tabIndex
      this.tabList = this.tabList.filter((item, index) => index >= tabIndex)
      if (includeThis) {
        router.push(tab.fullPath)
      }
    },
    // 清除右边 Tab
    clearRightTabs (tabIndex) {
      const tab = this.tabList[tabIndex]
      const includeThis = this.currentIndex > tabIndex
      this.tabList = this.tabList.filter((item, index) => index <= tabIndex)
      if (includeThis) {
        router.push(tab.fullPath)
      }
    },
    // 清除所有 Tab
    clearAllTabs () {
      this.tabList = []
      router.push({ name: 'index' })
    },
    // 刷新当前 Tab
    refreshTab () {
      this.refreshing = true
      setTimeout(() => {
        this.refreshing = false
      }, 300)
    },
    // 设置tab名称
    setTabName (title, fullPath) {
      const idx = fullPath ? this.tabList.findIndex(item => item.fullPath === fullPath) : this.currentIndex
      this.tabList[idx].meta.title = title
    },
    // 收藏/取消收藏
    toogleFavorite (tabIndex = this.currentIndex) {
      const tab = this.tabList[tabIndex]
      if (!tab?.fullPath) return
      if (this.favoriteKeys.includes(tab.fullPath)) {
        this.favoriteTabs = this.favoriteTabs.filter(item => item.fullPath !== tab.fullPath)
      } else {
        this.favoriteTabs.push({ ...tab, matched: undefined, meta: { ...tab.meta, matchedPaths: undefined } })
      }
    },
    // 删除收藏
    removeFavorite (index) {
      this.favoriteTabs.splice(index, 1)
    },
    // 删除收藏
    removeFavoriteByFullPath (fullPath) {
      if (!fullPath) return
      this.favoriteTabs = this.favoriteTabs.filter(item => item.fullPath !== fullPath)
    }
  },
  getters: {
    // 当前 Tab 激活项的索引
    currentIndex () {
      return this.tabList.findIndex(item => item.fullPath === router.currentRoute?.value?.fullPath)
    },
    currTab () {
      return this.tabList[this.currentIndex]
    },
    favoriteKeys () {
      return this.favoriteTabs.map(item => item.fullPath)
    },
    // 当前 tabList 中支持缓存的路由组件名称数组，用于 Tab 缓存
    // 从 tabList 中筛选出需要缓存的页面组件名数组，用于 keepalive 缓存
    cachedViews () {
      if (this.tabList.length === 0) {
        return []
      }
      const currComName = this.currTab?.matched?.at(-1)?.componentName
      const cachedViews = this.tabList.map(tab => {
        const componentName = tab.matched.at(-1)?.componentName
        const useCache = tab.meta?.cache
        if (useCache && componentName) {
          return componentName
        } else if (useCache && !componentName) {
          console.error('当前 Tab 页开启了缓存，但是未获取到组件名称，缓存失败')
          return null
        } else {
          return null
        }
      }).filter(name => {
        // 刷新中的 Tab 暂时移除缓存
        const noRefreshFilter = !this.refreshing && !!name
        const refreshFilter = this.refreshing && name && name !== currComName
        return noRefreshFilter || refreshFilter
      })
      return cachedViews
    }
  },
  persist: [
    {
      key: 'CZ_USER_TABS',
      storage: window.sessionStorage,
      pick: ['tabList']
    },
    {
      key: 'CZ_USER_TABS',
      pick: ['favoriteTabs']
    }
  ]
})
