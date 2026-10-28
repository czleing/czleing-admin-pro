/**
 * 生成接口请求方式配置
 * @param {Object} apiMethodConfig 用户配置的接口请求方式
 * @returns 最终使用的请求方式
 */
export function useApiMethodConfig (apiMethodConfig = {}) {
  const apiMethod = {
    ...apiMethodConfig,
    add: apiMethodConfig?.add ?? 'post',
    update: apiMethodConfig?.update ?? 'post',
    detail: apiMethodConfig?.detail ?? 'post',
    list: apiMethodConfig?.list ?? 'post',
    delete: apiMethodConfig?.delete ?? 'post',
    toggle: apiMethodConfig?.toggle ?? 'post',
    import: apiMethodConfig?.import ?? 'post',
    importTemplate: apiMethodConfig?.importTemplate ?? 'post',
    export: apiMethodConfig?.export ?? 'post'
  }
  return { apiMethod }
}