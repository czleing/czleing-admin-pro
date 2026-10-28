import { Enum, init } from '@/utils/enum.util'

/**
 * 用户类型
 */
export const EUserType = {
  eSys: Enum('sys_user', '系统用户'),
  eOther: Enum('other', '其他用户')
}
init(EUserType)

/**
 * 控件类型
 * htmlType 用于代码生成时获取枚举key
 * 如果需要增加控件类型：
 * 1、EControlType 增加对应类型
 * 2、增加的组件建议是全局组件 (src/components/index.js中注册)
 * 3.1、如果是第三方全局组件，且需要适配新增、编辑、详情模式，在 src/components/crud/hooks/useRender.js 增加对应自定义渲染函数(可选,为第三方组件实现多模式)
 * 3.2、如果是自己写的全局组件：接收和实现 value, disabled, isView 属性即可适配新增、修改、详情场景
 * 
 * 非全局组件无需增加类型，通过自定义类型 EControlType.eCustom 使用即可
 */
export const EControlType = {
  eInput: Enum('a-input', '文本框', { htmlType: 'eInput', defaultProps: { maxlength: 50 } }),
  eHidden: Enum('a-hidden', '隐藏域', { htmlType: 'eHidden' }),
  eAutoComplete: Enum('a-auto-complete', '自动补全文本框', { htmlType: 'eAutoComplete', defaultProps: { dropdownMatchSelectWidth: false } }),
  eNumber: Enum('a-input-number', '数字框', { htmlType: 'eNumber', defaultProps: { style: 'width: 100%;' } }),
  eNumberRange: Enum('a-input-number-range', '数字范围框', { htmlType: 'eNumberRange', defaultProps: { style: 'width: 100%;' } }),
  eTextarea: Enum('a-textarea', '文本域', { htmlType: 'eTextarea', defaultProps: { maxlength: 200, showCount: true, rows: 4 } }),
  eRadio: Enum('a-radio-group', '单选框', { htmlType: 'eRadio' }),
  eCheckbox: Enum('a-checkbox-group', '多选框', { htmlType: 'eCheckbox' }),
  eSelect: Enum('a-select', '下拉选择', { htmlType: 'eSelect' }),
  eDate: Enum('a-date-picker', '日期', { htmlType: 'eDate' }),
  eDateRange: Enum('a-range-picker', '日期范围', { htmlType: 'eDateRange' }),
  eSwitch: Enum('a-switch', '开关', { htmlType: 'eSwitch' }),
  eFileUpload: Enum('FileUpload', '文件上传', { htmlType: 'eFileUpload' }),
  eImageUpload: Enum('ImageUpload', '图片上传', { htmlType: 'eImageUpload' }),
  eEditor: Enum('WangEditor', '富文本', { htmlType: 'eEditor' }),
  eTreeSelect: Enum('a-tree-select', '树形选择', { htmlType: 'eTreeSelect', defaultProps: { treeDefaultExpandAll: true, dropdownMatchSelectWidth: false } }),
  eUserSelect: Enum('UserSelect', '用户选择', { htmlType: 'eUserSelect' }),
  eTable: Enum('DynamicTable', '动态表格', { htmlType: 'eTable', defaultProps: { bordered: true, size: 'small' } }),
  eCustom: Enum('Custom', '自定义', { htmlType: 'eCustom' })
}
init(EControlType)

/**
 * 是否启用
 */
export const EIsEnabled = {
  eEnabled: Enum(1, 'crud.enabled', 'text-success'),
  eDisabled: Enum(0, 'crud.disabled', 'text-danger')
}
init(EIsEnabled)

/**
 * 是否
 */
export const EYesNo = {
  eYes: Enum(1, 'crud.yes', 'text-success'),
  eNo: Enum(0, 'crud.no', 'text-danger')
}
init(EYesNo)

/**
 * 菜单类型
 */
export const EMenuType = {
  eDir: Enum('M', '目录'),
  eMenu: Enum('C', '菜单'),
  eBtn: Enum('F', '按钮')
}
init(EMenuType)

/** 任务计划漏执行补救策略 */
export const EMisfirePolicy = {
  eDefault: Enum('0', '默认，立即补执行一次'),
  eOneNow: Enum('1', '立即补执行一次'),
  eDoNothing: Enum('2', '忽略且不补执行'),
  eIgnore: Enum('-1', '忽略不补执行且不留痕'),
}
init(EMisfirePolicy)
