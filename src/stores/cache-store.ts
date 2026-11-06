/**
 * 缓存相关 store
 * 管理：菜单搜索历史、记住的登录账号（仅记住账号，不保存密码）
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'

/** 搜索菜单历史项 */
export interface SearchedMenu {
  path: string
  title?: string
  icon?: string
  target?: string
}

export const useCacheStore = defineStore('cache', () => {
  /** 搜索菜单历史 */
  const searchedMenus = ref<SearchedMenu[]>([])
  /** 记住的登录账号 */
  const loginAccount = ref<string>()

  /** 获取记住的登录账号，未记住时返回空字符串 */
  function getLoginAccount(): string {
    // 兼容历史版本持久化的 { account, password } 结构，直接丢弃，避免密码残留在本地存储
    if (typeof loginAccount.value !== 'string') {
      loginAccount.value = undefined
      return ''
    }
    return loginAccount.value
  }

  /** 设置记住的登录账号，不传则清除 */
  function setLoginAccount(account?: string): void {
    loginAccount.value = account || undefined
  }

  /** 清除缓存 */
  function clearCache(): void {
    searchedMenus.value = []
    loginAccount.value = undefined
  }
  return {
    searchedMenus,
    loginAccount,
    getLoginAccount,
    setLoginAccount,
    clearCache,
  }
},
{
  persist: true,
})
