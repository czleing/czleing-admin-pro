/**
 * 根据当前接口配置及默认配置 生成 接口配置
 * @param {Object} apiConfig 
 * @returns 接口配置对象
 */
export function useApiConfig (apiConfig = {}) {
  const route = useRoute()
  const apiPrex = route.path // 如：/system/user
  const api = {
    ...apiConfig,
    add: apiConfig?.add ?? (apiPrex + '/add'), // 如：/system/user/add
    update: apiConfig?.update ?? (apiPrex + '/update'),
    detail: apiConfig?.detail ?? (apiPrex + '/detail/:id'),
    list: apiConfig?.list ?? apiPrex + '/list',
    delete: apiConfig?.delete ?? `${apiPrex}/delete/:ids`,
    toggle: apiConfig?.toggle ?? (apiPrex + '/toggle'),
    import: apiConfig?.import ?? (apiPrex + '/import'),
    importTemplate: apiConfig?.importTemplate ?? (apiPrex + '/importTemplate'),
    export: apiConfig?.export ?? (apiPrex + '/export')
  }
  return {
    api
  }
}