/**
 * 缓存相关 store
 * 管理：菜单搜索历史、记住的登录账号（密码加密存储）
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { decrypt, encrypt } from '@/utils/jsencrypt'

/** 搜索菜单历史项 */
export interface SearchedMenu {
  path: string
  title?: string
  icon?: string
  target?: string
}

/** 登录账号（password 为加密后的密文） */
export interface LoginAccount {
  account: string
  password: string
}

export const useCacheStore = defineStore('cache', () => {
  /** 搜索菜单历史 */
  const searchedMenus = ref<SearchedMenu[]>([])
  /** 记录登录用户 */
  const loginAccount = ref<LoginAccount>()

  /** 获取记住的登录账号（密码已解密） */
  function getLoginAccount(): LoginAccount | undefined {
    if (loginAccount.value) {
      return {
        account: loginAccount.value.account,
        password: decrypt(loginAccount.value.password) as string,
      }
    }
    return undefined
  }

  /** 设置记住的登录账号（密码加密后存储），不传则清除 */
  function setLoginAccount(accountInfo?: LoginAccount): void {
    if (!accountInfo) {
      loginAccount.value = undefined
      return
    }
    loginAccount.value = {
      account: accountInfo.account,
      password: encrypt(accountInfo.password) as string,
    }
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
