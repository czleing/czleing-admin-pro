/**
 * 字典数据加载 hook
 * 用法：
 *   const dict = useDict(['is_delete', 'audit_status'])
 *   dict['audit_status'] // 异步 reactive，加载完成后自动赋值
 *
 *   useDict(['audit_status'], (dict) => {
 *     console.log(dict['audit_status']) // 回调通知加载完成
 *   })
 */
import { reactive } from 'vue'
import { useDictStore } from '@/stores/dict-store'
import type { UnwrapNestedRefs } from 'vue'

interface DictConfig {
  [dictType: string]: { force?: boolean }
}

export function useDict(
  types: string | string[],
  callback?: (dictMap: Record<string, unknown[]>) => void,
  config: DictConfig = {}
): UnwrapNestedRefs<Record<string, unknown[]>> {
  const dictDataMap = reactive<Record<string, unknown[]>>({})
  const typeList = Array.isArray(types) ? types : [types]
  const { initDictByTypes } = useDictStore()
  initDictByTypes(typeList, config).then((dictMap) => {
    for (const type of typeList) {
      dictDataMap[type] = dictMap[type] as unknown[]
    }
    if (typeof callback === 'function') {
      callback(dictDataMap)
    }
  })
  return dictDataMap
}

export default useDict
