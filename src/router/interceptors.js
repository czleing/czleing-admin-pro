import settings from '@/config/setting.js'
import { useAuthStore } from '@/stores/auth-store'
import { useMenuStore } from '@/stores/menu-store'
import { useTabsStore } from '@/stores/tabs-store'
import { useSettingStore } from '@/stores/setting-store'

/**
 * 路由拦截器-前置守卫
 * @param {*} to 
 * @param {*} from 
 * @param {*} next 
 */
// 是否正在动态添加路由，防止重复跳转
let routeIniting = false
export async function beforeInterceptor (to, from) {
  const needLogin = to.meta.needLogin !== false
  const authStore = useAuthStore()
  const menuStore = useMenuStore()
  const settingStore = useSettingStore()
  if (needLogin) {
    if (import.meta.env.VITE_APP_IGNORE_LOGIN !== 'true' && !authStore.hasLogin) {
      return { name: 'login' }
    }
    if (!routeIniting) {
      routeIniting = true
      const promises = []
      // 菜单路由未加载，则加载菜单
      if (!menuStore.loaded) {
        promises.push(menuStore.loadMenuToRoute())
      }
      // 用户信息不存在，则获取用户信息
      if (authStore.userInfo === null) {
        promises.push(authStore.getUserInfo())
      }
      if (promises.length) {
        await Promise.all(promises)
      }
      // 动态添加路由后，需要重新发起路由跳转
      return to.fullPath
    }
  }
  // 路由变化后的菜单相关处理
  menuStore.handleRouteChange(from, to)
  return true
}

/**
 * 路由拦截器-后置守卫
 * @param {*} to 
 * @param {*} from 
 */
export function afterInterceptor (to, from) {
  const settingStore = useSettingStore()
  if (settingStore.useDynamicPageTitle) {
    window.document.title = to.meta.title + ' | ' + settings.websiteInfo.systemName
  } else {
    window.document.title = settings.websiteInfo.systemName
  }
  const tabsStore = useTabsStore()
  tabsStore.openTab(to)
}

/**
 * 路由拦截器-错误拦截
 * @param {Object} error 错误信息
 */
export function errorInterceptor (error) {
  console.error('路由跳转错误', error)
}
