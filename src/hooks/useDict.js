import { useDictStore } from '@/stores/dict-store.js'

/**
 * 使用字典功能
 * 
 * 用法：
 * import { useDict } from '@/hooks/useDict.js'
 * 一：
 * const dict = useDict(['is_delete', 'audit_status'])
 * dict['audit_status'] // 异步赋值 reactive 响应式对象 dict，dict['audit_status'] 将等于 [{id, name, ...}, {...}]
 * 二：
 * useDict(['audit_status'], dict => {
 *   console.log(dict['audit_status']) // 通过回调函数通知 dict 已加载好 => [{id, name, ...}, {...}]
 * })
 * 
 * @param {String | Array} types: 字典类型 或 字典类型数组
 * @param {Function} callback: 字典加载好了的回调函数
 * @param {Object} config: 字典加载配置，{[dictType]: { force: true }}
 */
export function useDict (types, callback, config = {}) {
  const dictDataMap = reactive({}) // key: dictType, value: 字典项数组
  if (!Array.isArray(types)) {
    types = [types]
  }
  const { initDictByTypes } = useDictStore()
  // 根据指定的 types 初始化字典库(字典库包含所有字典)
  initDictByTypes(types, config).then(dictMap => {
    // 只取出指定 types 的字典
    for (const type of types) {
      dictDataMap[type] = dictMap[type]
    }
    if (typeof callback === 'function') {
      callback(dictDataMap)
    }
  })
  return dictDataMap
}
export default useDict
