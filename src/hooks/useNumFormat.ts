/**
 * 数字格式化 hook（结合 settingStore 的地域设置自动选择千分位/万分位）
 */
import { useSettingStore } from '@/stores/setting-store'
import { numFormat as nf } from '@/utils'

interface NumFormatOptions {
  splitDigits?: number
  digit?: number | null
  fillZero?: boolean
}

export function useNumFormat(): { numFormat: (value: number | string | null | undefined, options?: NumFormatOptions) => string } {
  const settingStore = useSettingStore()
  function numFormat(value: number | string | null | undefined, options: NumFormatOptions = {}): string {
    return nf(value, {
      ...options,
      splitDigits: options?.splitDigits ?? (settingStore.isCn && settingStore.useWanSplit ? 4 : 3),
    })
  }
  return { numFormat }
}

export default useNumFormat
