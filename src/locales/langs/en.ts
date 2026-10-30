/**
 * 英语语言包
 */
import en from '@/components/crud/langs/en'
import image from '@/assets/images/locale/en.png'

/** 语言下拉选项 */
export const option = {
  value: 'en',
  label: 'English',
  image,
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
