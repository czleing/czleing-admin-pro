import { defineStore } from 'pinia'
import { isEmpty } from '@/utils/index.js'
import axios from '@/api'
/**
 * 字典相关 store
 */
export const useDictStore = defineStore('dict', () => {
  const dictMap = reactive({}) // key: 字典类型，value: 字典项列表
  const cache = {}
  async function initDictByTypes (types, config) { // config: { xxx_status: { force: true } } // 比如设置某个类型，不使用缓存，强制获取远程数据
    if (isEmpty(types)) return
    if (!Array.isArray(types)) {
      types = [types]
    }
    types = types.filter(type => !dictMap[type] || config?.[type]?.force)
    for (const type of types) {
      dictMap[type] = await getDatasByType(type, config?.[type]?.force)
    }
    return dictMap
  }

  /**
   * 通过字典类型获取字典数据列表
   * 高并发调用时，相同类型只会请求一次接口，其余的调用则会直接返回 Promise，防止重复请求
   * @param {String} type 字典类型
   * @param {Boolean} force 是否强制获取远程数据
   * @returns 字典数据 或 获取字典数据的 Promise
   */
  function getDatasByType (type, force) {
    if (!force && cache[type]) {
      return cache[type]
    }
    cache[type] = axios.post(`/system/dict/data/type/${type}`).then(result => {
      const dicts = result?.map(item => ({
        ...item,
        id: item.dictValue,
        name: item.dictLabel,
        label: item.dictLabel,
        value: item.dictValue
      }))
      cache[type] = dicts
      dictMap[type] = dicts
      return dicts
    }).catch(e => {
      console.error('获取字典项数据失败', e)
      return []
    })
    return cache[type]
  }

  return {
    dictMap,
    initDictByTypes
  }
})