/**
 * 路由拦截器（前置守卫 / 后置守卫 / 错误拦截）
 */
import settings from '@/config/setting'
import { useAuthStore } from '@/stores/auth-store'
import { useMenuStore } from '@/stores/menu-store'
import { useTabsStore } from '@/stores/tabs-store'
import { useSettingStore } from '@/stores/setting-store'
import type { NavigationGuard, NavigationFailure, RouteLocationNormalized } from 'vue-router'

// 是否正在动态添加路由，防止重复跳转
let routeIniting = false

/**
 * 路由拦截器-前置守卫
 */
export const beforeInterceptor: NavigationGuard = async (to, _from) => {
  const needLogin = to.meta.needLogin !== false
  const authStore = useAuthStore()
  const menuStore = useMenuStore()
  const settingStore = useSettingStore()
  void settingStore
  if (needLogin) {
    if (import.meta.env.VITE_APP_IGNORE_LOGIN !== 'true' && !authStore.hasLogin) {
      return { name: 'login' }
    }
    if (!routeIniting) {
      routeIniting = true
      const promises: Promise<unknown>[] = []
      if (!menuStore.loaded) {
        promises.push(menuStore.loadMenuToRoute())
      }
      if (authStore.userInfo === null) {
        promises.push(authStore.getUserInfo(true) as unknown as Promise<void>)
      }
      if (promises.length) {
        await Promise.all(promises)
      }
      return to.fullPath
    }
  }
  const from = _from as RouteLocationNormalized
  menuStore.handleRouteChange(from, to)
  return true
}

/**
 * 路由拦截器-后置守卫
 */
export const afterInterceptor: (to: RouteLocationNormalized, from: RouteLocationNormalized, failure?: NavigationFailure | void) => void = (to) => {
  const settingStore = useSettingStore()
  if (settingStore.useDynamicPageTitle) {
    window.document.title = (to.meta.title as string) + ' | ' + settings.websiteInfo.systemName
  } else {
    window.document.title = settings.websiteInfo.systemName
  }
  const tabsStore = useTabsStore()
  tabsStore.openTab(to)
}

/**
 * 路由拦截器-错误拦截
 */
export function errorInterceptor(error: unknown): void {
  console.error('路由跳转错误', error)
}
