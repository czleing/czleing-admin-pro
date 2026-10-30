/**
 * 字典相关 store
 * 统一管理字典项数据，相同类型并发调用只请求一次接口
 */
import { defineStore } from 'pinia'
import { reactive } from 'vue'
import { isEmpty } from '@/utils'
import axios from '@/api'

/** 后端返回的原始字典项 */
export interface RawDictItem {
  dictValue: string | number
  dictLabel: string
  [key: string]: unknown
}

/** 转换后的字典项（editor 内通用结构） */
export interface DictItem extends RawDictItem {
  id: string | number
  name: string
  label: string
  value: string | number
}

/** 单个字典类型的加载配置 */
export interface DictTypeConfig {
  /** 是否强制获取远程数据而不使用缓存 */
  force?: boolean
}

/** 字典加载配置：key 为字典类型 */
export type DictConfig = Record<string, DictTypeConfig>

export const useDictStore = defineStore('dict', () => {
  /** key: 字典类型，value: 字典项列表 */
  const dictMap = reactive<Record<string, DictItem[]>>({})
  /** 请求缓存，避免相同类型重复请求 */
  const cache: Record<string, Promise<DictItem[]>> = {}

  /**
   * 批量初始化字典数据
   * @param types 字典类型，字符串或字符串数组
   * @param config 加载配置，如 { sys_status: { force: true } }
   * @returns 字典数据 map
   */
  async function initDictByTypes(types: string | string[], config: DictConfig = {}): Promise<Record<string, DictItem[]>> {
    if (isEmpty(types)) return dictMap
    let typeList: string[] = Array.isArray(types) ? types : [types]
    typeList = typeList.filter((type) => !dictMap[type] || config?.[type]?.force)
    for (const type of typeList) {
      dictMap[type] = await getDatasByType(type, config?.[type]?.force)
    }
    return dictMap
  }

  /**
   * 通过字典类型获取字典数据列表
   * 高并发调用时，相同类型只会请求一次接口，其余的调用则会直接复用同一个 Promise，防止重复请求
   * @param type 字典类型
   * @param force 是否强制获取远程数据
   */
  function getDatasByType(type: string, force = false): Promise<DictItem[]> {
    if (!force && type in cache) {
      return cache[type]
    }
    cache[type] = axios
      .post<RawDictItem[]>(`/system/dict/data/type/${type}`)
      .then((result) => {
        const dicts: DictItem[] = (result ?? []).map((item) => ({
          ...item,
          id: item.dictValue,
          name: item.dictLabel,
          label: item.dictLabel,
          value: item.dictValue,
        }))
        dictMap[type] = dicts
        return dicts
      })
      .catch((e) => {
        console.error('获取字典项数据失败', e)
        return []
      })
    return cache[type]
  }

  return {
    dictMap,
    initDictByTypes,
  }
})
