/**
 * 项目路由 meta 统一类型声明
 * 通过模块扩展为 vue-router 的 RouteMeta 注入项目自定义字段（全站唯一定义处），
 * 路由表、菜单树（NavRoute）、路由守卫中读取 meta 时均可直接获得类型提示，无需自定义接口或断言
 */
import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    /** 是否需要登录，默认 true */
    needLogin?: boolean
    /** 菜单标题 */
    title?: string
    /** 菜单图标 */
    icon?: string
    /** 是否在菜单中隐藏 */
    hidden?: boolean
    /** 是否在页签栏隐藏 */
    hiddenTab?: boolean
    /** 是否开启 keepalive 缓存 */
    cache?: boolean
    /** 菜单类型，M 目录, C 菜单, F 功能 */
    menuType?: string
    /** 父级路由链地址，从一级路由开始 */
    matchedPaths?: string[]
    /** 是否是一级路由 */
    isFirst?: boolean
    /** 是否是叶子节点 */
    isLeaf?: boolean
    /** 打开方式，如 _blank */
    target?: string
  }
}

export {}
