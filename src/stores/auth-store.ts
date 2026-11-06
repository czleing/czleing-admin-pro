/**
 * 登录、授权、用户信息相关 store
 */
import { defineStore } from 'pinia'
import { createVNode } from 'vue'
import { Modal } from 'ant-design-vue'
import { ExclamationCircleOutlined } from '@ant-design/icons-vue'
import router from '@/router'
import axios from '@/api'
import { useMenuStore } from '@/stores/menu-store'
import { useTabsStore } from '@/stores/tabs-store'
import { useCacheStore } from '@/stores/cache-store'

/** 部门信息 */
export interface DeptInfo {
  deptId?: string
  deptName?: string
  [key: string]: unknown
}

/** 登录用户信息 */
export interface UserInfo {
  userId?: string
  userName?: string
  nickName?: string
  avatar?: string
  email?: string
  phonenumber?: string
  userType?: string | number
  dept?: DeptInfo
  [key: string]: unknown
}

/** 授权信息接口返回 */
export interface AuthInfoResponse {
  user?: UserInfo
  roles?: string[]
  permissions?: string[]
}

/** 登录参数 */
export interface LoginParams {
  account?: string
  password?: string
  code?: string
  uuid?: string
  remember?: boolean
}

/** 验证码接口返回 */
export interface CaptchaResult {
  img?: string
  uuid?: string
}

/** 登录接口返回 */
export interface LoginResult {
  token: string
}

/** 是否为外部绝对地址（http(s):// 开头或协议相对地址 // 开头） */
function isAbsoluteUrl(url: string): boolean {
  return /^(https?:)?\/\//i.test(url)
}

/**
 * 校验外部绝对地址是否与当前系统同域名（防开放重定向）
 * 仅允许跳转到与当前系统完全相同的域名，子域名、主域名一致的地址一律不允许
 * @param url 待校验的跳转地址
 * @returns true 同域名可信，false 跨域名不可信
 */
function isSameDomainUrl(url: string): boolean {
  let target: URL
  try {
    target = new URL(url, window.location.origin)
  } catch {
    return false
  }
  if (target.protocol !== 'http:' && target.protocol !== 'https:') return false
  const currentHost = window.location.hostname.toLowerCase()
  const targetHost = target.hostname.toLowerCase()
  return !!targetHost && targetHost === currentHost
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null as string | null,
    userInfo: null as UserInfo | null,
    /** 当前角色字符串数组 ['xxx', 'xxxx'] */
    roles: null as string[] | null,
    /** 支持的权限字符串数组 ['system:user:add', 'xxx:xxx:xxx'] */
    permissions: [] as string[],
  }),
  actions: {
    /** 获取图形验证码 */
    getCode(): Promise<CaptchaResult> {
      return axios.get<CaptchaResult>('/captchaImage', {}, { headers: { isToken: false } })
    },
    /**
     * 登录统一入口
     * @param data 登录参数
     */
    async login(data: LoginParams): Promise<void> {
      if (data.account && data.password) {
        await this.loginByAccount(data)
      } else {
        console.error('未找到匹配的登录方式')
      }
    },
    /**
     * 1、账号密码登录
     * @param param 账号、密码、验证码、uuid、是否记住账号
     */
    async loginByAccount({ account, password, code, uuid, remember }: LoginParams): Promise<void> {
      const data = {
        username: account, // : window.btoa(window.btoa(account)),
        password, // : window.btoa(window.btoa(password)),
        code,
        uuid,
      }
      const result = await axios.post<LoginResult>('/login', data)
      // 保存登录令牌，会自动持久化
      this.token = result.token
      // 加密持久化需要记住的账号
      const cacheStore = useCacheStore()
      if (remember) {
        cacheStore.setLoginAccount({ account: account as string, password: password as string })
      } else {
        cacheStore.setLoginAccount()
      }
      // 登录成功后处理
      await this.loginSuccessHandle()
    },
    /**
     * 退出登录
     */
    logout(): Promise<void> {
      const that = this
      const tabStore = useTabsStore()
      return new Promise((resolve, reject) => {
        Modal.confirm({
          title: '退出提示',
          icon: createVNode(ExclamationCircleOutlined),
          content: '确认退出登录吗？',
          async onOk() {
            await axios.post('/logout')
            that.clearAuthInfo()
            tabStore.clearAllTabs()
            router.replace({ name: 'login' })
            resolve()
          },
          onCancel() {
            reject()
          },
        })
      })
    },
    /** 清除登录授权信息 */
    clearAuthInfo(): void {
      this.token = null
      this.userInfo = null
      this.permissions = []
    },
    /** 登录成功后处理 */
    async loginSuccessHandle(): Promise<void> {
      const menuStore = useMenuStore()
      // 获取菜单生成动态路由
      // 获取最新的登录用户信息
      await Promise.all([menuStore.loadMenuToRoute(true), this.getUserInfo(true)])
      // 跳转
      const redirect = router.currentRoute.value.query.redirect as string | undefined
      if (!redirect) {
        // 跳转到首页
        router.replace('/')
      } else if (!isAbsoluteUrl(redirect)) {
        router.replace(redirect) // 本系统登录跳回（相对路径走内部路由）
      } else if (isSameDomainUrl(redirect)) {
        window.location.href = new URL(redirect, window.location.origin).href // 同域名地址才允许跳回
      } else {
        // 外部不可信地址，禁止跳转，防止开放重定向攻击
        router.replace('/')
      }
    },
    /** 登录失效处理，跳转到登录页 或者 弹出登录窗体 */
    authExpiredHandle(): void {
      if (import.meta.env.VITE_APP_IGNORE_LOGIN === 'true') {
        return
      }
      const currentPath = router.currentRoute.value.fullPath
      if (router.currentRoute.value.name !== 'login') {
        const tabStore = useTabsStore()
        tabStore.clearAllTabs()
        this.clearAuthInfo()
        router.replace({
          name: 'login',
          query: { redirect: currentPath },
        })
      }
    },
    /**
     * 获取当前登录用户信息
     * @param force 是否强制获取而不使用缓存
     */
    async getUserInfo(force?: boolean): Promise<UserInfo | undefined> {
      if (!force && this.userInfo) {
        return this.userInfo
      } else {
        let authInfo: AuthInfoResponse = {}
        try {
          authInfo = await axios.get<AuthInfoResponse>('/authInfo')
        } catch (e) {
          if (import.meta.env.VITE_APP_IGNORE_LOGIN !== 'true') {
            throw e
          }
        }
        this.userInfo = authInfo?.user ?? null
        this.roles = authInfo?.roles ?? null
        this.permissions = authInfo?.permissions ?? []
        if (import.meta.env.DEV && import.meta.env.VITE_APP_IGNORE_PERMISSION === 'true') {
          this.permissions.unshift('*:*:*') // 具有所有权限
        }
      }
    },
  },
  getters: {
    /**
     * 判断是否已登录
     * @returns boolean 是否已登录
     */
    hasLogin(): boolean {
      return !!this.token
    },
  },
  // 使用插件实现持久化
  persist: {
    // storage: window.sessionStorage, // 使用的持久化方案，默认 localStorage
    // !!! 不能将 userInfo 加入缓存，userInfo 与 permissions 来自同一个接口，只缓存 userInfo 刷新时会导致 permissions 为空，从而页面权限校验错误，必须与 permissions 一起加入缓存
    // !!! permissions 为敏感信息，有手动修改的可能，最好不要加入缓存，所以 userInfo 和 permissoins 每次刷新时重新获取为好
    pick: ['token'], // 需要持久化的属性，不设置则默认所有属性
  },
})

export default useAuthStore
