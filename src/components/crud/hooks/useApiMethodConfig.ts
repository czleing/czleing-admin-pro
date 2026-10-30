/**
 * 生成接口请求方式配置
 */
import type { CrudApiMethodConfig, ResolvedApiMethodConfig } from '../types'

/**
 * 生成接口请求方式配置
 * @param apiMethodConfig 用户配置的接口请求方式
 * @returns apiMethod 最终使用的请求方式（未配置项默认 RESTful 规范）
 */
export function useApiMethodConfig(
  apiMethodConfig: CrudApiMethodConfig = {}
): { apiMethod: ResolvedApiMethodConfig } {
  const apiMethod: ResolvedApiMethodConfig = {
    add: apiMethodConfig.add ?? 'post',
    update: apiMethodConfig.update ?? 'put',
    detail: apiMethodConfig.detail ?? 'get',
    list: apiMethodConfig.list ?? 'get',
    delete: apiMethodConfig.delete ?? 'delete',
    toggle: apiMethodConfig.toggle ?? 'patch',
    import: apiMethodConfig.import ?? 'post',
    importTemplate: apiMethodConfig.importTemplate ?? 'get',
    export: apiMethodConfig.export ?? 'get'
  }
  return { apiMethod }
}
