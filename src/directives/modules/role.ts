/**
 * v-role 自定义指令：控制元素的角色可见性
 * 用法：v-role="'admin'"
 */
import { useAuthStore } from '@/stores/auth-store'
import type { DirectiveModule } from './copy'

const vRole: DirectiveModule = {
  name: 'role',
  directive: {
    mounted(el, binding) {
      const role: string = binding.value
      if (!role) return
      const authStore = useAuthStore()
      const hasPermission = authStore.roles?.includes(role)
      if (!hasPermission) {
        el.parentNode?.removeChild(el)
      }
    },
  },
}

export default vRole
