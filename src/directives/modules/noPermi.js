import { useAuthStore } from '@/stores/auth-store'
/**
 * 是否没有权限
 * v-noPermi="'xxx:xxx:xxx'"
 * v-noPermi="['xxx:xxx:xxx', 'aaa:bbb:ccc']"
 * 多个时为并且，全部没有才算没有权限
 * 用户拥有 '*:*:*' 表示拥有所有权限
 */
export default {
  name: 'noPermi',
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
      const noPermission = permissions.every(permission => {
        return !authStore.permissions.includes(permission)
      })
      if (!noPermission || authStore.permissions.includes('*:*:*')) {
        el.parentNode.removeChild(el)
      }
    }
  }
}