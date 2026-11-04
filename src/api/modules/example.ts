import { SearchParams } from '@/components/crud/types'
import api from '../index'

interface Entity {
  id: number
  name: string
}
/**
 * 测试接口
 * @param params 查询参数
 * @returns 测试接口返回结果
 */
export function test(params: SearchParams) {
  return api.get<Entity[]>('/example/xxx/xx', { params })
}
