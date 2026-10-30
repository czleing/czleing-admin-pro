/**
 * CRUD 表单（c-form / c-filter）配置类型
 *
 * 设计说明：
 * 1. 字段配置按控件类型拆分为独立接口，通过 `type` 字段做可辨识联合（Discriminated Union），
 *    编写配置时能获得对应 ant-design-vue 组件的属性提示；
 * 2. `props` 支持对象或 `(formData) => object` 的函数形式；
 * 3. 框架内部会把动态属性解析为静态值，使用 `NormalizedFormField` 承载解析后的结构。
 */
import type {
  AutoCompleteProps,
  CheckboxGroupProps,
  ColProps,
  DatePickerProps,
  InputNumberProps,
  InputProps,
  RadioGroupProps,
  SelectProps,
  SwitchProps,
  TextAreaProps,
  TreeSelectProps,
  UploadProps
} from 'ant-design-vue'
import type { Rule } from 'ant-design-vue/es/form/interface'
import type { Component, VNodeChild } from 'vue'
import type { Dayjs } from 'dayjs'
import type { CrudFormData, CrudRecord, FieldNames, MaybeFn, OptionItem } from './common'
import type { CrudRequestMethod } from './api'
import { EControlType } from '@/enum'

/** 表单校验规则，与 a-form-item 的 rules 一致 */
export type FormRule = Rule

/** 远程数据源配置 */
export interface RemoteConfig {
  /** 接口地址 */
  url: string
  /** 请求方式，默认 post */
  method?: CrudRequestMethod
  /** 额外请求参数，值支持 '{formData.xxx:required}' 形式的动态参数 */
  params?: Record<string, string | number | boolean | null | undefined>
  /** 每次弹窗后自动刷新数据源 */
  autoRefresh?: boolean
  /** 对接口返回数据进行转换，转成 [{ id, name }] 结构 */
  converter?: (result: unknown) => OptionItem[]
}

/** 表单字段公有属性 */
export interface FormFieldBase {
  /** 字段描述 */
  label?: MaybeFn<string, [CrudFormData]>
  /** 字段名（提交数据的 key） */
  fieldName: string
  /** 当前表单项（文本 + 控件）栅格设置 */
  col?: ColProps
  /** 当前表单项文本部分栅格设置 */
  labelCol?: ColProps
  /** 当前表单项控件部分栅格设置 */
  wrapperCol?: ColProps
  /** 单独占一行，优先级高于 col */
  singleLine?: boolean
  /** 默认值 */
  defaultValue?: unknown
  /** 校验规则 */
  rules?: MaybeFn<FormRule | FormRule[], [CrudFormData]>
  /** 是否必填 */
  required?: MaybeFn<boolean, [CrudFormData]>
  /** 是否禁用 */
  disabled?: MaybeFn<boolean, [CrudFormData]>
  /** 是否隐藏（数据仍在表单中） */
  hidden?: MaybeFn<boolean, [CrudFormData]>
  /** 是否不需要该字段（数据不在表单中） */
  none?: MaybeFn<boolean, [CrudFormData]>
  /** 字段(?)提示 */
  tooltip?: MaybeFn<string, [CrudFormData]>
  /** 字段额外说明 */
  extra?: MaybeFn<string, [CrudFormData]>
  /** 详情（查看）模式下的覆盖配置 */
  detailConfig?: Partial<FormFieldBase> & {
    type?: string
    props?: CrudControlProps
  }
}

/** 各控件通用扩展属性 */
export interface SharedFieldProps {
  /** 字典类型，自动查询字典项作为数据源 */
  dictType?: string
  /** 远程数据源 */
  remote?: RemoteConfig
  /** 是否在前面添加“全部”选项 */
  useAll?: boolean
  /** 是否显示手动刷新按钮，默认 true */
  useRefresh?: boolean
  /** 静态选项数据源 */
  options?: OptionItem[]
}

/** 文本框属性 */
export interface InputFieldProps
  extends Omit<InputProps, 'value' | 'onChange' | 'placeholder' | 'disabled'>,
    SharedFieldProps {
  placeholder?: MaybeFn<string, [CrudFormData]>
  disabled?: MaybeFn<boolean, [CrudFormData]>
  onChange?: (value: string, formData: CrudFormData) => void
}

/** 文本域属性 */
export interface TextareaFieldProps
  extends Omit<TextAreaProps, 'value' | 'onChange' | 'placeholder' | 'disabled'>,
    SharedFieldProps {
  placeholder?: MaybeFn<string, [CrudFormData]>
  disabled?: MaybeFn<boolean, [CrudFormData]>
  onChange?: (value: string, formData: CrudFormData) => void
}

/** 自动补全属性 */
export interface AutoCompleteFieldProps
  extends Omit<AutoCompleteProps, 'value' | 'onChange' | 'options' | 'disabled'>,
    SharedFieldProps {
  disabled?: MaybeFn<boolean, [CrudFormData]>
  onChange?: (value: string, formData: CrudFormData) => void
}

/** 数字框属性 */
export interface NumberFieldProps
  extends Omit<InputNumberProps, 'value' | 'onChange' | 'placeholder' | 'disabled'>,
    SharedFieldProps {
  /** 后缀文案 */
  addonAfter?: string
  placeholder?: MaybeFn<string, [CrudFormData]>
  disabled?: MaybeFn<boolean, [CrudFormData]>
  onChange?: (value: number, formData: CrudFormData) => void
}

/**
 * 数字范围框属性
 * 其余属性在 a-input-number 属性名后追加 s，并以数组形式设置，如：maxs、mins
 */
export interface NumberRangeFieldProps extends SharedFieldProps {
  placeholders?: string[]
  addonAfters?: string[]
  maxs?: [number, number]
  mins?: [number, number]
  precision?: number
  [key: string]: unknown
}

/** 单选框属性 */
export interface RadioFieldProps
  extends Omit<RadioGroupProps, 'value' | 'onChange' | 'options'>,
    SharedFieldProps {
  /** 选项类型 */
  optionType?: 'default' | 'button'
  /** 选项类型为 button 时的风格 */
  buttonStyle?: 'outline' | 'solid'
  onChange?: (value: string | number, option: OptionItem | undefined, formData: CrudFormData) => void
}

/** 多选框属性 */
export interface CheckboxFieldProps
  extends Omit<CheckboxGroupProps, 'value' | 'onChange' | 'options'>,
    SharedFieldProps {
  onChange?: (value: (string | number)[], formData: CrudFormData) => void
}

/** 下拉框属性 */
export interface SelectFieldProps
  extends Omit<SelectProps, 'value' | 'onChange' | 'options' | 'placeholder' | 'disabled'>,
    SharedFieldProps {
  placeholder?: MaybeFn<string, [CrudFormData]>
  disabled?: MaybeFn<boolean, [CrudFormData]>
  onChange?: (
    value: string | number | (string | number)[],
    option: OptionItem | OptionItem[] | undefined,
    formData: CrudFormData
  ) => void
}

/** 日期属性 */
export interface DateFieldProps
  extends Omit<DatePickerProps, 'value' | 'onChange' | 'placeholder' | 'disabled'>,
    SharedFieldProps {
  placeholder?: MaybeFn<string, [CrudFormData]>
  disabled?: MaybeFn<boolean, [CrudFormData]>
  onChange?: (value: Dayjs, dateString: string | string[], formData: CrudFormData) => void
}

/** 日期范围属性 */
export interface DateRangeFieldProps
  extends Omit<DatePickerProps, 'value' | 'onChange' | 'placeholder' | 'disabled'>,
    SharedFieldProps {
  placeholder?: string | string[]
  disabled?: MaybeFn<boolean, [CrudFormData]>
  /** 提交时拆分的起止字段名，默认 [fieldName + 'Begin', fieldName + 'End'] */
  fieldNames?: [string, string]
  onChange?: (value: [Dayjs, Dayjs], dateString: [string, string], formData: CrudFormData) => void
}

/** 开关属性 */
export interface SwitchFieldProps
  extends Omit<SwitchProps, 'checked' | 'onChange' | 'disabled'>,
    SharedFieldProps {
  disabled?: MaybeFn<boolean, [CrudFormData]>
  onChange?: (checked: boolean, formData: CrudFormData) => void
}

/** 树形选择属性 */
export interface TreeSelectFieldProps
  extends Omit<TreeSelectProps, 'value' | 'onChange' | 'fieldNames' | 'treeData' | 'disabled'>,
    SharedFieldProps {
  /** 树节点字段映射 */
  fieldNames?: FieldNames
  /** 树数据源 */
  treeData?: CrudRecord[]
  disabled?: MaybeFn<boolean, [CrudFormData]>
  onChange?: (value: unknown, formData: CrudFormData) => void
}

/** 文件上传/图片上传属性 */
export interface UploadFieldProps
  extends Omit<UploadProps, 'fileList' | 'onChange' | 'disabled'>,
    SharedFieldProps {
  /** 值类型：文件对象数组或逗号分隔的地址字符串 */
  valueType?: 'String' | 'Array'
  /** 上传按钮文字 */
  btnText?: string
  /** 文件大小限制，单位 KB */
  fileSize?: number
  /** 文件服务根目录下的子文件夹名 */
  data?: Record<string, unknown>
  /** 上传字段名，默认 file */
  name?: string
  disabled?: MaybeFn<boolean, [CrudFormData]>
  onChange?: (value: unknown, formData: CrudFormData) => void
}

/** 富文本属性 */
export interface EditorFieldProps extends SharedFieldProps {
  height?: string
  disabled?: MaybeFn<boolean, [CrudFormData]>
  [key: string]: unknown
}

/** 用户选择属性 */
export interface UserSelectFieldProps extends SharedFieldProps {
  maxCount?: number
  disabled?: MaybeFn<boolean, [CrudFormData]>
  [key: string]: unknown
}

/** 自定义组件属性 */
export interface CustomFieldProps extends SharedFieldProps {
  /** 组件：全局组件名、组件对象或返回组件对象的函数 */
  component?: Component | string | ((formData: CrudFormData) => Component | string)
  /** 自定义 v-model 字段，默认 value */
  modelProps?: string
  /** 自定义 v-model 事件字段，默认 'onUpdate:value' */
  modelEvent?: string
  /** 自定义数据源字段，默认 dataSource */
  modelData?: string
  /** 需要有数据源才渲染 */
  renderNeedDataSource?: boolean
  disabled?: MaybeFn<boolean, [CrudFormData]>
  onChange?: (...args: unknown[]) => void
  [key: string]: unknown
}

/** 动态表格单元格配置 */
export interface DynamicTableColumn {
  title?: string
  tooltip?: string
  dataIndex: string
  /** 单元格控件类型 */
  type?: string
  width?: number
  align?: 'left' | 'center' | 'right'
  hidden?: boolean
  /** OCR 识别时忽略该列 */
  ocrIgnore?: boolean
  isView?: boolean
  defaultValue?: unknown
  /** 是否禁用 */
  disabled?: MaybeFn<boolean, [CrudRecord, CrudRecord[]]>
  /** 是否必填 */
  required?: MaybeFn<boolean, [CrudRecord, CrudRecord[]]>
  /** 单元格校验，返回错误信息即校验失败 */
  validator?: (index: number, value: string, record: CrudRecord, records: CrudRecord[]) => string | void
  /** 单元格控件属性 */
  props?: DynamicTableColumnProps | ((record: CrudRecord, records: CrudRecord[]) => DynamicTableColumnProps)
  [key: string]: unknown
}

/** 动态表格单元格控件属性 */
export interface DynamicTableColumnProps extends Omit<CrudControlProps, 'onChange' | 'component'> {
  /** 单元格组件 */
  component?:
    | Component
    | string
    | {
        render: (ctx: { $attrs: Record<string, unknown> }) => VNodeChild
      }
  /** 单元格值变化 */
  onChange?: (value: unknown, record: CrudRecord, records: CrudRecord[]) => void
}

/** 动态表格属性 */
export interface DynamicTableFieldProps extends SharedFieldProps {
  primaryKey?: string
  maxCount?: number
  /** 是否初始化时默认新增一行 */
  useAddDefault?: boolean
  /** 是否使用文本识别 */
  useTextOCR?: boolean
  columns: DynamicTableColumn[]
  [key: string]: unknown
}

/** 框架内部解析后的控件属性（所有动态属性已解析为静态值） */
export interface CrudControlProps {
  [key: string]: unknown
  type?: string
  placeholder?: string | string[]
  disabled?: boolean
  options?: OptionItem[]
  useAll?: boolean
  useRefresh?: boolean
  dictType?: string
  remote?: RemoteConfig
  addonAfter?: string
  addonAfters?: string[]
  placeholders?: string[]
  showTime?: boolean
  fieldNames?: FieldNames | string[]
  treeData?: CrudTreeNodeLike[]
  component?:
    | Component
    | string
    | ((formData: CrudFormData) => Component | string)
    | { render: (ctx: { $attrs: Record<string, unknown> }) => VNodeChild }
  modelProps?: string
  modelEvent?: string
  modelData?: string
  renderNeedDataSource?: boolean
  columns?: DynamicTableColumn[]
  onChange?: (...args: unknown[]) => void
  onClick?: (ctx: unknown) => void
}

/** 内部树数据源（宽松结构，便于按配置字段名取值） */
export type CrudTreeNodeLike = Record<string, unknown>

/** 文本框字段 */
export interface InputFormField extends FormFieldBase {
  type?: typeof EControlType.eInput | 'a-input'
  props?: MaybeFn<InputFieldProps, [CrudFormData]>
}

/** 隐藏域字段 */
export interface HiddenFormField extends FormFieldBase {
  type?: typeof EControlType.eHidden
  props?: MaybeFn<SharedFieldProps, [CrudFormData]>
}

/** 自动补全字段 */
export interface AutoCompleteFormField extends FormFieldBase {
  type?: typeof EControlType.eAutoComplete
  props?: MaybeFn<AutoCompleteFieldProps, [CrudFormData]>
}

/** 文本域字段 */
export interface TextareaFormField extends FormFieldBase {
  type?: typeof EControlType.eTextarea
  props?: MaybeFn<TextareaFieldProps, [CrudFormData]>
}

/** 数字字段 */
export interface NumberFormField extends FormFieldBase {
  type?: typeof EControlType.eNumber
  props?: MaybeFn<NumberFieldProps, [CrudFormData]>
}

/** 数字范围字段 */
export interface NumberRangeFormField extends FormFieldBase {
  type?: typeof EControlType.eNumberRange
  props?: MaybeFn<NumberRangeFieldProps, [CrudFormData]>
}

/** 单选字段 */
export interface RadioFormField extends FormFieldBase {
  type?: typeof EControlType.eRadio
  props?: MaybeFn<RadioFieldProps, [CrudFormData]>
}

/** 多选字段 */
export interface CheckboxFormField extends FormFieldBase {
  type?: typeof EControlType.eCheckbox
  props?: MaybeFn<CheckboxFieldProps, [CrudFormData]>
}

/** 下拉字段 */
export interface SelectFormField extends FormFieldBase {
  type?: typeof EControlType.eSelect
  props?: MaybeFn<SelectFieldProps, [CrudFormData]>
}

/** 日期字段 */
export interface DateFormField extends FormFieldBase {
  type?: typeof EControlType.eDate
  props?: MaybeFn<DateFieldProps, [CrudFormData]>
}

/** 日期范围字段 */
export interface DateRangeFormField extends FormFieldBase {
  type?: typeof EControlType.eDateRange
  props?: MaybeFn<DateRangeFieldProps, [CrudFormData]>
}

/** 开关字段 */
export interface SwitchFormField extends FormFieldBase {
  type?: typeof EControlType.eSwitch
  props?: MaybeFn<SwitchFieldProps, [CrudFormData]>
}

/** 富文本字段 */
export interface EditorFormField extends FormFieldBase {
  type?: typeof EControlType.eEditor
  props?: MaybeFn<EditorFieldProps, [CrudFormData]>
}

/** 树形选择字段 */
export interface TreeSelectFormField extends FormFieldBase {
  type?: typeof EControlType.eTreeSelect
  props?: MaybeFn<TreeSelectFieldProps, [CrudFormData]>
}

/** 文件上传字段 */
export interface FileUploadFormField extends FormFieldBase {
  type?: typeof EControlType.eFileUpload
  props?: MaybeFn<UploadFieldProps, [CrudFormData]>
}

/** 图片上传字段 */
export interface ImageUploadFormField extends FormFieldBase {
  type?: typeof EControlType.eImageUpload
  props?: MaybeFn<UploadFieldProps, [CrudFormData]>
}

/** 用户选择字段 */
export interface UserSelectFormField extends FormFieldBase {
  type?: typeof EControlType.eUserSelect
  props?: MaybeFn<UserSelectFieldProps, [CrudFormData]>
}

/** 动态表格字段 */
export interface DynamicTableFormField extends FormFieldBase {
  type?: typeof EControlType.eTable
  props?: MaybeFn<DynamicTableFieldProps, [CrudFormData]>
}

/** 自定义组件字段 */
export interface CustomFormField extends FormFieldBase {
  type?: typeof EControlType.eCustom
  props?: MaybeFn<CustomFieldProps, [CrudFormData]>
}

/** 表单字段配置（可辨识联合） */
export type CrudFormField =
  | InputFormField
  | HiddenFormField
  | AutoCompleteFormField
  | TextareaFormField
  | NumberFormField
  | NumberRangeFormField
  | RadioFormField
  | CheckboxFormField
  | SelectFormField
  | DateFormField
  | DateRangeFormField
  | SwitchFormField
  | EditorFormField
  | TreeSelectFormField
  | FileUploadFormField
  | ImageUploadFormField
  | UserSelectFormField
  | DynamicTableFormField
  | CustomFormField
  | FormFieldGroup

/** 字段分组 */
export interface FormFieldGroup {
  title?: MaybeFn<string, [CrudFormData]>
  subTitle?: MaybeFn<string, [CrudFormData]>
  hidden?: MaybeFn<boolean, [CrudFormData]>
  none?: MaybeFn<boolean, [CrudFormData]>
  fields: CrudFormField[]
}

/** 表单配置 */
export interface FormConfig {
  /** 表单布局，默认 horizontal */
  layout?: 'horizontal' | 'vertical' | 'inline'
  /** 一行显示几列，默认 2 */
  cols?: number
  /** 文本部分栅格设置，默认 { flex: '0 0 100px' } */
  labelCol?: ColProps
  /** 控件部分栅格设置，默认 { flex: '1 1 0' } */
  wrapperCol?: ColProps
  /** 打开弹窗时是否重置表单（默认重置） */
  autoReset?: boolean
  /** 提交成功后是否自动关闭弹窗（默认关闭） */
  autoClose?: boolean
  /** 提交时是否移除 none 字段 */
  removeNoneFields?: boolean
  fields: CrudFormField[]
}

/** 解析后的字段（框架内部使用） */
export interface NormalizedFormField {
  fieldName: string
  type?: string
  label?: string
  col?: ColProps
  labelCol?: ColProps
  wrapperCol?: ColProps
  singleLine?: boolean
  defaultValue?: unknown
  rules?: FormRule[]
  required?: boolean
  disabled?: boolean
  hidden?: boolean
  none?: boolean
  tooltip?: string
  extra?: string
  props: CrudControlProps
  detailConfig?: Partial<NormalizedFormField>
  fields?: NormalizedFormField[]
  title?: string
  subTitle?: string
}
