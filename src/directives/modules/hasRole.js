import { useAuthStore } from '@/stores/auth-store'
/**
 * 是否有角色
 * v-hasRole="'admin'"
 */
export default {
  name: 'hasRole',
  directive: {
    mounted (el, binding) {
      let role = binding.value
      if (!role) {
        return
      }
      const authStore = useAuthStore()
      const hasPermission = authStore.roles?.includes(role)
      if (!hasPermission) {
        el.parentNode?.removeChild(el)
      }
    }
  }
}