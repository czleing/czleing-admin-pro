/**
 * 页面查询条件缓存相关
 * 数据格式：[{id, name, data}, ...]
 */
export function useSearchCache () {
  const route = useRoute()
  const storage = window.sessionStorage
  const maxCount = 10 // 每个页面最大缓存几个
  const key = 'CZ_SEARCH_FORM_CHACHE_' + route.path
  const cacheList = ref([])
  /**
   * 通过ID获取当前页面缓存对象
   * @param {Number} id 
   * @returns formData or undefined
   */
  function getCondition (id) {
    if (cacheList.value.length > 0) {
      const cache = cacheList.value.find(item => item.id === id)
      return cache?.data
    } else {
      return undefined
    }
  }
  
  /**
   * 新增缓存
   * @param {Object} formData 表单数据
   * @param {String} cacheName 缓存名称
   */
  function setCondition (formData, cacheName) {
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
  function getConditionList () {
    const cacheStr = storage.getItem(key)
    if (cacheStr) {
      cacheList.value = JSON.parse(cacheStr)
    } else {
      cacheList.value = []
    }
    return cacheList.value
  }

  /**
   * 删除缓存
   * @param {Number} id 缓存唯一标识，不传则删除所有
   * @returns 
   */
  function delCondition (id) {
    if (id) {
      cacheList.value = cacheList.value.filter(item => item.id !== id)
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