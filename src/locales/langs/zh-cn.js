import zhCn from '@/components/crud/langs/zh-cn'
import image from '@/assets/images/locale/zh-cn.png'

/**
 * 汉语简体语言包
 */
// 用于自动扫描的下拉选择的 option
export const option = {
  value: 'zh-cn', // 用于设置当前语言，与语言包的文件名一致
  label: '中文简体', // 用于下拉选择时展示的名称
  image // 语言对应的图标，可选
}
export default {
  ...zhCn,
  common: {
    add: '新增',
    copy: '复制',
    cancel: '取消',
    confirm: '确认',
    save: '保存',
    saveSuccess: '保存成功',
    delete: '删除',
    deleteSuccess: '删除成功',
    disabled: '禁用',
    enabled: '启用',
    confirmUpdate: '确认修改',
    confirmSubmit: '确认提交',
    tips: '温馨提示',
    more: '更多',
    pleaseEnter: '请输入{text}',
    showLabel: '显示数值',
    refresh: '刷新',
    total: '总计',
    noData: '暂无数据',
    clickTips: '点击图表可查看明细',
  }
}