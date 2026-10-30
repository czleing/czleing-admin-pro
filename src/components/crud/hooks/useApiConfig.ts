/**
 * 根据接口配置及默认配置生成最终的接口地址配置
 */
import type { CrudApiConfig, CrudRecord, ResolvedApiConfig } from '../types'

/**
 * 生成接口地址配置
 * @param apiConfig 用户配置的接口地址
 * @returns api 最终使用的接口地址配置（未配置项根据当前路由生成）
 */
export function useApiConfig<Row = CrudRecord>(
  apiConfig: CrudApiConfig<Row> = {}
): { api: ResolvedApiConfig<Row> } {
  const route = useRoute()
  /** 当前路由地址，如 /system/user */
  const apiPrefix = route.path
  const api: ResolvedApiConfig<Row> = {
    add: apiConfig.add ?? `${apiPrefix}/add`,
    update: apiConfig.update ?? `${apiPrefix}/update`,
    detail: apiConfig.detail ?? `${apiPrefix}/detail/:id`,
    list: apiConfig.list ?? `${apiPrefix}/list`,
    delete: apiConfig.delete ?? `${apiPrefix}/delete/:ids`,
    toggle: apiConfig.toggle ?? `${apiPrefix}/toggle`,
    import: apiConfig.import ?? `${apiPrefix}/import`,
    importTemplate: apiConfig.importTemplate ?? `${apiPrefix}/importTemplate`,
    export: apiConfig.export ?? `${apiPrefix}/export`
  }
  return { api }
}
