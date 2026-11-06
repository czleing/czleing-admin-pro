/**
 * 字典相关 store
 * 统一管理字典项数据，相同类型并发调用只请求一次接口；
 * 加载失败的类型不写入缓存，下次调用可自动重试，失败信息通过 errors 暴露给页面做提示
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
  /** 请求缓存，避免相同类型重复请求；失败时立即移除条目，保证下次调用可重试 */
  const cache = new Map<string, Promise<DictItem[]>>()
  /** 正在请求中的字典类型，强制刷新时据此复用已有请求 */
  const loadingTypes = new Set<string>()
  /** 每种字典类型的最新请求序号，用于判定响应是否过期 */
  const requestSeq = new Map<string, number>()
  /** 最近一次加载失败的错误信息，key 为字典类型，加载成功后自动清除 */
  const errors = reactive<Record<string, Error>>({})
  /** 已输出过错误日志的字典类型，避免失败重试时日志刷屏 */
  const loggedTypes = new Set<string>()

  /**
   * 批量初始化字典数据
   * @param types 字典类型，字符串或字符串数组
   * @param config 加载配置，如 { sys_status: { force: true } }
   * @returns 字典数据 map
   */
  async function initDictByTypes(types: string | string[], config: DictConfig = {}): Promise<Record<string, DictItem[]>> {
    if (isEmpty(types)) return dictMap
    let typeList: string[] = Array.isArray(types) ? types : [types]
    // 已加载过且有数据的类型跳过；空结果同样允许重试，避免加载失败后被永久跳过
    typeList = typeList.filter((type) => !dictMap[type]?.length || config?.[type]?.force)
    if (!typeList.length) return dictMap
    // 单个字典加载失败不阻塞其它字典，失败信息已记录在 errors 中
    await Promise.allSettled(typeList.map((type) => getDatasByType(type, config?.[type]?.force)))
    return dictMap
  }

  /**
   * 通过字典类型获取字典数据列表
   * 高并发调用时，相同类型只会请求一次接口，其余的调用则会直接复用同一个 Promise，防止重复请求
   * 请求失败时不写入缓存，直接抛出异常，由调用方或 initDictByTypes 统一兜底
   * @param type 字典类型
   * @param force 是否强制获取远程数据
   */
  function getDatasByType(type: string, force = false): Promise<DictItem[]> {
    const cached = cache.get(type)
    // 非强制请求命中缓存直接复用；强制刷新时若已有请求在飞，同样复用，避免并发重复请求
    if (cached && (!force || loadingTypes.has(type))) {
      return cached
    }
    // 递增请求序号，仅最新请求的结果可写入状态，避免被淘汰的旧响应覆盖新数据
    const seq = (requestSeq.get(type) ?? 0) + 1
    requestSeq.set(type, seq)
    const isLatest = (): boolean => requestSeq.get(type) === seq
    loadingTypes.add(type)
    const request = axios
      .post<RawDictItem[]>(`/system/dict/data/type/${type}`)
      .then(
        (result) => {
          const dicts: DictItem[] = (result ?? []).map((item) => ({
            ...item,
            id: item.dictValue,
            name: item.dictLabel,
            label: item.dictLabel,
            value: item.dictValue,
          }))
          if (isLatest()) {
            dictMap[type] = dicts
            delete errors[type]
            loggedTypes.delete(type)
          }
          return dicts
        },
        (e: unknown) => {
          const error = e instanceof Error ? e : new Error(String(e))
          // 仅最新请求失败时才清理缓存与记录错误；不覆盖 dictMap，保留上一次成功加载的数据
          if (isLatest()) {
            cache.delete(type)
            errors[type] = error
            if (!loggedTypes.has(type)) {
              loggedTypes.add(type)
              console.error(`获取字典项数据失败：${type}`, error)
            }
          }
          throw error
        }
      )
      .finally(() => {
        if (isLatest()) {
          loadingTypes.delete(type)
        }
      })
    cache.set(type, request)
    return request
  }

  return {
    dictMap,
    errors,
    initDictByTypes,
  }
})
