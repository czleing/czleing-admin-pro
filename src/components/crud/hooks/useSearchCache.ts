/**
 * 页面查询条件缓存
 * 数据格式：[{ id, name, data }, ...]
 */
import type { Ref } from 'vue'
import type { CrudFormData } from '../types'

/** 单条查询条件缓存 */
export interface SearchCacheItem {
  id: number
  name: string
  data: CrudFormData
}

/** useSearchCache 返回值 */
export interface UseSearchCacheReturn {
  cacheList: Ref<SearchCacheItem[]>
  getCondition: (id: number) => CrudFormData | undefined
  getConditionList: () => SearchCacheItem[]
  setCondition: (formData: CrudFormData, cacheName: string) => void
  delCondition: (id?: number) => void
}

/**
 * 查询条件缓存
 * @returns 缓存列表及增删查方法
 */
export function useSearchCache(): UseSearchCacheReturn {
  const route = useRoute()
  const storage = window.sessionStorage
  /** 每个页面最大缓存数量 */
  const maxCount = 10
  const key = `CZ_SEARCH_FORM_CHACHE_${route.path}`
  const cacheList = ref<SearchCacheItem[]>([])

  /**
   * 通过 id 获取当前页面缓存对象
   * @param id 缓存唯一标识
   * @returns 表单数据或 undefined
   */
  function getCondition(id: number): CrudFormData | undefined {
    if (cacheList.value.length > 0) {
      const cache = cacheList.value.find((item) => item.id === id)
      return cache?.data
    }
    return undefined
  }

  /**
   * 新增缓存
   * @param formData 表单数据
   * @param cacheName 缓存名称
   */
  function setCondition(formData: CrudFormData, cacheName: string): void {
    if (cacheList.value.length >= maxCount) {
      cacheList.value.splice(0, 1)
    }
    cacheList.value.push({
      id: Date.now(),
      name: cacheName,
      data: { ...formData }
    })
    storage.setItem(key, JSON.stringify(cacheList.value))
  }

  /**
   * 获取当前页面缓存列表
   * @returns 缓存列表
   */
  function getConditionList(): SearchCacheItem[] {
    const cacheStr = storage.getItem(key)
    if (cacheStr) {
      cacheList.value = JSON.parse(cacheStr) as SearchCacheItem[]
    } else {
      cacheList.value = []
    }
    return cacheList.value
  }

  /**
   * 删除缓存
   * @param id 缓存唯一标识，不传则删除全部
   */
  function delCondition(id?: number): void {
    if (id) {
      cacheList.value = cacheList.value.filter((item) => item.id !== id)
      storage.setItem(key, JSON.stringify(cacheList.value))
    } else {
      storage.removeItem(key)
    }
  }

  getConditionList()

  return {
    cacheList,
    getCondition,
    getConditionList,
    setCondition,
    delCondition
  }
}
