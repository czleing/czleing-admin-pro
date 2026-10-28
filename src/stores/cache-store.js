import { decrypt, encrypt } from '@/utils/jsencrypt'
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/**
 * 缓存相关 store
 */
export const useCacheStore = defineStore('cache', () => {
  /** 搜索菜单历史 */
  const searchedMenus = ref([]) // [{ path, title, icon }]
  /** 记录登录用户 */
  const loginAccount = ref() // { account, password }

  function getLoginAccount () {
    if (loginAccount.value) {
      return {
        account: loginAccount.value.account,
        password: decrypt(loginAccount.value.password)
      }
    }
    return undefined
  }

  function setLoginAccount (accountInfo) {
    if (!accountInfo) {
      loginAccount.value = undefined
      return
    }
    loginAccount.value = {
      account: accountInfo.account,
      password: encrypt(accountInfo.password)
    }
  }

  /** 清除缓存 */
  function clearCache () {
    searchedMenus.value = []
    loginAccount.value = undefined
  }
  return {
    searchedMenus,
    loginAccount,
    getLoginAccount,
    setLoginAccount,
    clearCache
  }
},
{
  persist: {
    key: 'CZ_CACHE'
  }
})
