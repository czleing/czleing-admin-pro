/**
 * v-noPermi 自定义指令：控制元素的"无此权限时可见"
 * 用法：
 *   v-noPermi="'xxx:xxx:xxx'"
 *   v-noPermi="['xxx:xxx:xxx', 'aaa:bbb:ccc']"
 * 多个时为并且关系，全部没有才算没有权限
 * 用户拥有 '*:*:*' 表示拥有所有权限（视为"有权限"，因此隐藏元素）
 */
import { useAuthStore } from '@/stores/auth-store'
import type { DirectiveModule } from './copy'

type PermissionValue = string | string[]

const noPermi: DirectiveModule = {
  name: 'noPermi',
  directive: {
    mounted(el, binding) {
      let permissions: PermissionValue = binding.value
      if (!permissions) return
      const authStore = useAuthStore()
      if (typeof permissions === 'string') {
        permissions = [permissions]
      }
      const noPermission = (permissions as string[]).every((permission) => {
        return !authStore.permissions.includes(permission)
      })
      if (!noPermission || authStore.permissions.includes('*:*:*')) {
        el.parentNode?.removeChild(el)
      }
    },
  },
}

export default noPermi
