/**
 * CRUD 动态请求方式的统一出口
 * 根据配置中的 method 调用对应的 axios 方法，避免在业务中使用动态索引签名
 */
import axiosService from '@/api/index'
import type { ApiOptionConfig, CrudRequestMethod } from '../types'

/**
 * 按请求方式调用接口
 * @param method 请求方式
 * @param url 接口地址
 * @param data 请求数据（get 时为 query 参数，其余为 body）
 * @param config 额外请求配置
 * @returns 接口返回值
 */
export function crudRequest<T = unknown>(
  method: CrudRequestMethod,
  url: string,
  data: Record<string, unknown> = {},
  config?: ApiOptionConfig
): Promise<T> {
  switch (method) {
    case 'get':
      return axiosService.get<T>(url, data, config)
    case 'put':
      return axiosService.put<T>(url, data)
    case 'delete':
      return axiosService.delete<T>(url, data)
    default:
      return axiosService.post<T>(url, data, config)
  }
}
