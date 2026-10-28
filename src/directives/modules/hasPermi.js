import { useAuthStore } from '@/stores/auth-store'
/**
 * 是否有权限
 * v-hasPermi="'xxx:xxx:xxx'"
 * v-hasPermi="['xxx:xxx:xxx', 'aaa:bbb:ccc']"
 * 多个时为或者，只要匹配一个即表示有权限
 * 用户拥有 '*:*:*' 表示拥有所有权限
 */
export default {
  name: 'hasPermi',
  directive: {
    mounted (el, binding) {
      let permissions = binding.value
      if (!permissions) {
        return
      }
      const authStore = useAuthStore()
      if (typeof permissions === 'string') {
        permissions = [permissions]
      }
      const hasPermission = permissions.some(permission => {
        return authStore.permissions.includes(permission)
      })
      if (!hasPermission && !authStore.permissions.includes('*:*:*')) {
        el.parentNode?.removeChild(el)
      }
    }
  }
}