/**
 * 项目统一路由类型定义
 * NavRoute 是菜单路由的唯一数据源类型（由后端菜单树转换而来）；
 * vue-router 的 RouteRecordRaw 是按 component / redirect / children 必填性判别的联合类型，
 * 与结构宽松的菜单路由天然互不可赋值，因此全站只在 toRouteRecord 这一个注册边界做结构转换，
 * 其余代码一律直接使用 NavRoute，不得再出现 as unknown as 断言链
 */
import type { RouteMeta, RouteRecordRaw, RouteRecordRedirectOption } from 'vue-router'

/** 路由可用的组件类型，与 vue-router 实际接受的范围保持一致 */
export type NavRouteComponent = NonNullable<RouteRecordRaw['component']>

/** 后端返回的菜单节点 */
export interface MenuNode {
  path?: string
  queryParam?: string
  component?: string
  redirect?: string
  name?: string
  needLogin?: boolean
  title?: string
  menuName?: string
  icon?: string
  isHidden?: boolean
  isCache?: boolean
  menuType?: string
  children?: MenuNode[]
}

/** 动态菜单路由 */
export interface NavRoute {
  path: string
  name?: string
  /** 菜单附加查询参数，仅随菜单树保留（vue-router 路由记录无此概念，注册时会被剥离） */
  query?: Record<string, unknown>
  /** 页面组件；目录/跳转类节点可以没有 component，仅有 redirect */
  component?: NavRouteComponent
  redirect?: RouteRecordRedirectOption
  meta: RouteMeta
  children?: NavRoute[]
}

/**
 * NavRoute → vue-router RouteRecordRaw 结构桥接（全站唯一转换点）
 * 按 RouteRecordRaw 联合成员的判别约束重建对象：有子路由走 WithChildren 形态，
 * 纯页面走 SingleView 形态，纯跳转走 Redirect 形态，全程无需类型断言
 * @param route 动态菜单路由（可嵌套，递归转换）
 * @returns routers.addRoute 可直接接受的路由记录
 */
export function toRouteRecord(route: NavRoute): RouteRecordRaw {
  const { path, name, meta, component, redirect, children } = route
  const childRecords = children?.length ? children.map(toRouteRecord) : undefined
  if (component) {
    // 组件节点若还带子路由或 redirect，统一用 WithChildren 形态承载，避免丢失字段
    return childRecords || redirect
      ? { path, name, component, redirect, meta, children: childRecords ?? [] }
      : { path, name, component, meta }
  }
  if (redirect) {
    return childRecords ? { path, name, redirect, meta, children: childRecords } : { path, name, redirect, meta }
  }
  console.warn(`[router] 路由「${path}」既无 component 也无 redirect，已按空节点注册`)
  return { path, name, meta, children: [] }
}
