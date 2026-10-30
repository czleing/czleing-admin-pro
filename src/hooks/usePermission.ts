/**
 * 权限相关 hook：暴露 roles / permissions / hasPermission / hasRole
 */
import { useAuthStore } from '@/stores/auth-store'

export function usePermission() {
  const { roles, permissions } = useAuthStore()
  return {
    /** 当前用户角色字符串数组 */
    roles,
    /** 当前用户权限字符串数组 ['system:user:add', 'xxx:xxx:xxx'] */
    permissions,
    /** 判断是否有权限（空权限视为有权限；支持 '*:*:*' 通配） */
    hasPermission(permission?: string): boolean {
      if (!permission) return true
      return permissions.includes('*:*:*') || permissions.includes(permission)
    },
    /** 判断是否有某个角色（空角色视为有角色） */
    hasRole(role?: string): boolean {
      if (!role) return true
      return (roles ?? []).includes(role)
    },
  }
}

export default usePermission
