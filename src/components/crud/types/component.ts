/**
 * CRUD 内部组件（c-component / c-form / c-import）的公开类型
 */
import type { ColProps } from 'ant-design-vue'
import type { Ref } from 'vue'
import type { CrudFormData, CrudRecord } from './common'
import type { CrudControlProps, FormRule } from './form'

/** c-component 的字段配置（已解析动态属性） */
export interface CrudComponentField {
  fieldName: string
  type?: string
  label?: string
  props: CrudControlProps
  [key: string]: unknown
}

/** c-component 组件属性 */
export interface CrudComponentProps {
  value?: unknown
  field: CrudComponentField
  isView?: boolean
}

/** 表单提交前处理函数 */
export type CrudBeforeSubmit = (
  submitData: CrudRecord,
  ctx: { isAdd: boolean; isEdit: boolean; isView: boolean; detail: CrudRecord }
) => CrudRecord | void | Promise<CrudRecord | void>

/** 表单提交处理函数 */
export type CrudSubmitHandle = (submitData: CrudRecord) => void | Promise<void>

/** 表单组件暴露的方法 */
export interface CrudFormExpose {
  submit: () => void
  validate: () => Promise<CrudRecord>
  getSubmitData: () => Promise<CrudRecord>
  setFormData: (
    data?: CrudRecord,
    includeFieldNames?: string[],
    excludeFieldNames?: string[]
  ) => void
  reset: () => void
  remotes: () => FormRemotes
}

/** 表单表单项配置（内部使用） */
export interface CrudFormItemProps {
  label?: string
  labelCol?: ColProps
  wrapperCol?: ColProps
  required?: boolean
  rules?: FormRule[]
  extra?: string
  tooltip?: string
  [key: string]: unknown
}

/** 导入弹窗打开选项 */
export interface ImportOpenOptions {
  url?: string
  templateUrl?: string
  title?: string
}

/** 导入组件暴露的方法 */
export interface CrudImportExpose {
  open: (options?: ImportOpenOptions) => void
}

/** 表单内部数据源 */
export type FormDataSource = CrudFormData

/** 表单远程数据加载函数集 */
export type FormRemotes = Record<string, () => Promise<unknown>>

/** 表单数据 Ref */
export type FormDataRef = Ref<CrudFormData>
