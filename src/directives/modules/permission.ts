/**
 * v-permission 自定义指令：控制元素的权限可见性
 * 用法：
 *   v-permission="'xxx:xxx:xxx'"
 *   v-permission="['xxx:xxx:xxx', 'aaa:bbb:ccc']"
 * 多个时为或者关系，只要匹配一个即表示有权限
 * 用户拥有 '*:*:*' 表示拥有所有权限
 */
import { useAuthStore } from '@/stores/auth-store'
import type { DirectiveModule } from './copy'

type PermissionValue = string | string[]

const vPermission: DirectiveModule = {
  name: 'permission',
  directive: {
    mounted(el, binding) {
      let permissions: PermissionValue = binding.value
      if (!permissions) return
      const authStore = useAuthStore()
      if (typeof permissions === 'string') {
        permissions = [permissions]
      }
      const hasPermission = (permissions as string[]).some((permission) => {
        return authStore.permissions.includes(permission)
      })
      if (!hasPermission && !authStore.permissions.includes('*:*:*')) {
        el.parentNode?.removeChild(el)
      }
    },
  },
}

export default vPermission
