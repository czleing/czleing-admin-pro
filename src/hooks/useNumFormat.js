import { useSettingStore } from "@/stores/setting-store"
import { numFormat as nf } from "@/utils"

/**
 * 数字格式化
 */
export function useNumFormat () {
  const settingStore = useSettingStore()
  /**
   * 数值格式化（千分位/万分位）
   * @param {number|string} value - 原始数值
   * @param {Object} options 配置项
   * @param {number} [options.splitDigits=3] 分隔位数：3=千分位，4=万分位
   * @param {number|null} [options.digit=null] 保留小数位数，默认：null=保留原始小数不截断
   * @param {boolean} [options.fillZero=true] 小数不足时是否补0，默认true
   * @returns 
   */
  function numFormat (value, options = {}) {
    return nf(value, {
      ...options,
      splitDigits: options?.splitDigits ?? (settingStore.isCn && settingStore.useWanSplit ? 4 : 3)
    })
  }
  return {
    numFormat
  }
}

export default useNumFormat
