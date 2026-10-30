/**
 * 根据权限配置及默认配置生成最终预设操作的权限标识
 */
import type { CrudPermissionConfig, ResolvedPermissionConfig } from '../types'

/**
 * 生成权限配置
 * @param permissionConfig 用户配置的权限标识
 * @returns permission 最终使用的权限标识（未配置项根据当前路由生成，如 system:user:add）
 */
export function usePermissionConfig(
  permissionConfig: CrudPermissionConfig = {}
): { permission: ResolvedPermissionConfig } {
  const route = useRoute()
  /** 当前路由转换的权限前缀，如 /system/user -> system:user */
  const permissionPrefix = route.path.split('/').slice(1).join(':')
  const permission: ResolvedPermissionConfig = {
    add: permissionConfig.add ?? `${permissionPrefix}:add`,
    edit: permissionConfig.update ?? `${permissionPrefix}:update`,
    update: permissionConfig.update ?? `${permissionPrefix}:update`,
    detail: permissionConfig.detail ?? `${permissionPrefix}:detail`,
    list: permissionConfig.list ?? `${permissionPrefix}:list`,
    delete: permissionConfig.delete ?? `${permissionPrefix}:delete`,
    toggle: permissionConfig.toggle ?? `${permissionPrefix}:toggle`,
    import: permissionConfig.import ?? `${permissionPrefix}:import`,
    export: permissionConfig.export ?? `${permissionPrefix}:export`
  }
  return { permission }
}
