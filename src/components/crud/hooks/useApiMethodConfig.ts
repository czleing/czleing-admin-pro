/**
 * 生成接口请求方式配置
 */
import type { CrudApiMethodConfig, ResolvedApiMethodConfig } from '../types'

/**
 * 生成接口请求方式配置
 * @param apiMethodConfig 用户配置的接口请求方式
 * @returns apiMethod 最终使用的请求方式（未配置默认post）
 */
export function useApiMethodConfig(
  apiMethodConfig: CrudApiMethodConfig = {}
): { apiMethod: ResolvedApiMethodConfig } {
  const apiMethod: ResolvedApiMethodConfig = {
    add: apiMethodConfig.add ?? 'post',
    update: apiMethodConfig.update ?? 'post',
    detail: apiMethodConfig.detail ?? 'post',
    list: apiMethodConfig.list ?? 'post',
    delete: apiMethodConfig.delete ?? 'post',
    toggle: apiMethodConfig.toggle ?? 'post',
    import: apiMethodConfig.import ?? 'post',
    importTemplate: apiMethodConfig.importTemplate ?? 'post',
    export: apiMethodConfig.export ?? 'post'
  }
  return { apiMethod }
}
