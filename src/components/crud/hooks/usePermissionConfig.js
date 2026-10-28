/**
 * 根据当前权限配置及默认配置 生成 最终预设操作的权限配置
 * @param {Object} permissionConfig 
 * @returns 权限配置对象
 */
export function usePermissionConfig (permissionConfig = {}) {
  const route = useRoute()
  const path = route.path // /system/user
  const permissionPrex = path.split('/').slice(1).join(':') // system:user
  const permission = {
    ...permissionConfig,
    add: permissionConfig?.add ?? (permissionPrex + ':add'), // system:user:add
    edit: permissionConfig?.update ?? (permissionPrex + ':update'),
    update: permissionConfig?.update ?? (permissionPrex + ':update'),
    detail: permissionConfig?.detail ?? (permissionPrex + ':detail'),
    list: permissionConfig?.list ?? (permissionPrex + ':list'),
    delete: permissionConfig?.delete ?? (permissionPrex + ':delete'),
    toggle: permissionConfig?.toggle ?? (permissionPrex + ':toggle'),
    import: permissionConfig?.import ?? (permissionPrex + ':import'),
    export: permissionConfig?.export ?? (permissionPrex + ':export')
  }
  return {
    permission
  }
}