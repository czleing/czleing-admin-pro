import zhHk from '@/components/crud/langs/zh-hk'
import image from '@/assets/images/locale/zh-hk.png'
/**
 * 汉语繁体语言包
 */
// 用于自动扫描的下拉选择的 option
export const option = {
  value: 'zh-hk', // 用于设置当前语言，与语言包的文件名一致
  label: '中文繁体', // 用于下拉选择时展示的名称
  image // 语言对应的图标，可选
}
export default {
  ...zhHk,
  common: {
    add: '新增',
    copy: '複製',
    cancel: '取消',
    confirm: '確認',
    save: '保存',
    saveSuccess: '保存成功',
    delete: '刪除',
    deleteSuccess: '刪除成功',
    disabled: '禁用',
    enabled: '啟用',
    tips: '溫馨提示',
    more: '更多',
    pleaseEnter: '請輸入{text}',
    showLabel: '顯示數值',
    refresh: '刷新',
    total: '總計',
    noData: '暫無數據',
    clickTips: '點擊圖表可查看明細',
  },
}