import { theme } from 'ant-design-vue'

/**
 * 使用主题动态属性，如当前主题色，当前边框色等
 * @returns 返回当前的主题属性
 */
export function useThemeToken () {
  const { useToken } = theme
  const { token } = useToken()

  return { token }
}
export default useThemeToken
