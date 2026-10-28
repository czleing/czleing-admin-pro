import en from '@/components/crud/langs/en'
import image from '@/assets/images/locale/en.png'
/**
 * 英语语言包
 */
// 用于自动扫描的下拉选择的 option
export const option = {
  value: 'en', // 用于设置当前语言，与语言包的文件名一致
  label: 'English', // 用于下拉选择时展示的名称
  image // 语言对应的图标，可选
}
export default {
  ...en,
  common: {
    add: 'Add',
    copy: 'Copy',
    cancel: 'Cancel',
    confirm: 'Confirm',
    save: 'Save',
    saveSuccess: 'Save successfully',
    delete: 'Delete',
    deleteSuccess: 'Delete successfully',
    disabled: 'Disabled',
    enabled: 'Enabled',
    confirmUpdate: 'Confirm update',
    confirmSubmit: 'Confirm submission',
    tips: 'Reminder',
    more: 'More',
    pleaseEnter: 'Please enter {text}',
    showLabel: 'Show Value',
    refresh: 'Refresh',
    total: 'Total',
    noData: 'No Data',
    clickTips: 'Click on the chart to view details',
  },
}