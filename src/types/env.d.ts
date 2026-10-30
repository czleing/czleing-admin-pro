/// <reference types="vite/client" />

/**
 * Vite import.meta.env 扩展
 * 以 VITE_APP_ 开头的环境变量会注入到前端，在此处声明类型后可获得智能提示
 * 新增环境变量时，请在 .env / .env.dev / .env.prod 中添加，并同步在此处补类型
 */
interface ImportMetaEnv {
  /** 应用上下文路径 / 根路径，例如 '/' 或 '/admin/' */
  readonly VITE_APP_CONTEXT_PATH: string
  /** 接口服务器地址 */
  readonly VITE_APP_BASE_API: string
  /** 静态资源服务器地址（有时和接口地址不同） */
  readonly VITE_APP_RESOURCE_API: string
  /** 开发环境代理服务地址（dev 模式生效） */
  readonly VITE_APP_DEV_PROXY: string
  /** 开发环境是否忽略权限校验 */
  readonly VITE_APP_IGNORE_PERMISSION: string
  /** 开发环境是否忽略登录校验 */
  readonly VITE_APP_IGNORE_LOGIN: string
  /** 开发环境是否开启调试模式 */
  readonly VITE_APP_DEBUG_MODE: string
  /** 高德地图 key */
  readonly VITE_APP_GD_MAP_KEY: string
  /** 高德地图密钥 */
  readonly VITE_APP_GD_MAP_SECRET: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
