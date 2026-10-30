/**
 * ant-design-vue 主题 token hook
 */
import { theme } from 'ant-design-vue'

export function useThemeToken(): { token: ReturnType<typeof theme.useToken>['token'] } {
  const { useToken } = theme
  const { token } = useToken()
  return { token }
}

export default useThemeToken
