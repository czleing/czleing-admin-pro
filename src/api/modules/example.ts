import { SearchParams } from '@/components/crud/types'
import api from '../index'

/**
 * 测试接口
 * @param params 查询参数
 * @returns 测试接口返回结果
 */
export function test(params: SearchParams) {
  return api.get<Record<string, unknown>[]>('/example/xxx/xx', { params })
}
