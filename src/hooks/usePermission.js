import useAuthStore from "@/stores/auth-store"

/**
 * 使用权限相关
 */
export function usePermission () {
  const { roles, permissions } = useAuthStore()
  return {
    /** 当前用户角色字符串数组 */
    roles,
    /** 支持的权限字符串数组 ['system:user:add', 'xxx:xxx:xxx'] */
    permissions,
    /** 判断是否有权限 */
    hasPermission (permission) {
      if (!permission) return true
      return permissions.includes('*:*:*') || permissions.includes(permission)
    },
    /** 判断是否有某个角色 */
    hasRole (role) {
      if (!role) return true
      return roles.includes(role)
    }
  }
}
export default usePermission