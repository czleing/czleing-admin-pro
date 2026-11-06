/**
 * 字典数据加载 hook
 * 用法：
 *   const { dict, errors } = useDict(['is_delete', 'audit_status'])
 *   dict['audit_status'] // 异步 reactive，加载完成后自动赋值
 *   errors['audit_status'] // 加载失败时的错误信息，加载成功则无该 key
 *
 *   useDict(['audit_status'], (dict, errors) => {
 *     console.log(dict['audit_status']) // 回调通知加载完成
 *   })
 */
import { reactive } from 'vue'
import { useDictStore } from '@/stores/dict-store'

interface DictConfig {
  [dictType: string]: { force?: boolean }
}

/** useDict 返回值 */
export interface UseDictResult {
  /** 字典数据，key 为字典类型 */
  dict: Record<string, unknown[]>
  /** 加载失败的错误信息，key 为字典类型，加载成功则无该 key */
  errors: Record<string, Error>
}

export function useDict(
  types: string | string[],
  callback?: (dict: Record<string, unknown[]>, errors: Record<string, Error>) => void,
  config: DictConfig = {}
): UseDictResult {
  const dictDataMap = reactive<Record<string, unknown[]>>({})
  const dictErrors = reactive<Record<string, Error>>({})
  const typeList = Array.isArray(types) ? types : [types]
  const dictStore = useDictStore()
  dictStore.initDictByTypes(typeList, config).then((dictMap) => {
    for (const type of typeList) {
      dictDataMap[type] = dictMap[type] as unknown[]
      const error = dictStore.errors[type]
      if (error) {
        dictErrors[type] = error
      }
    }
    if (typeof callback === 'function') {
      callback(dictDataMap, dictErrors)
    }
  })
  return { dict: dictDataMap, errors: dictErrors }
}

export default useDict
