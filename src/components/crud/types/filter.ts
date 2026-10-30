/**
 * CRUD 查询条件（c-filter）配置类型
 */
import type { ColProps } from 'ant-design-vue'
import type { CrudFormField, CrudControlProps, FormFieldGroup } from './form'

/** 查询条件字段配置（复用表单字段配置，但不允许分组） */
export type FilterFieldConfig = Exclude<CrudFormField, FormFieldGroup>

/** 解析后的查询条件字段（框架内部使用，动态属性已解析为静态值） */
export interface ResolvedFilterField {
  fieldName: string
  type?: string
  label?: string
  col?: ColProps
  labelCol?: ColProps
  wrapperCol?: ColProps
  defaultValue?: unknown
  props: CrudControlProps
  [key: string]: unknown
}

/** 查询条件配置 */
export interface FilterConfig {
  /** 是否启用查询条件暂存 */
  useCache?: boolean
  /** 暂存按钮文字，默认“记住查询” */
  cacheBtnText?: string
  /** 所有表单项栅格设置，默认 { sm: 8, lg: 6, xxl: 4 } */
  col?: ColProps
  /** 所有表单项文本部分栅格设置 */
  labelCol?: ColProps
  /** 所有表单项控件部分栅格设置 */
  wrapperCol?: ColProps
  /** 查询/重置等按钮栅格设置 */
  buttonsCol?: ColProps
  /** 查询/重置等按钮水平对齐方式，默认 left */
  buttonsAlign?: 'left' | 'center' | 'right'
  /** 字段配置 */
  fields?: FilterFieldConfig[]
}

/** 查询条件组件暴露的方法 */
export interface CrudFilterExpose {
  /** 获取转换后的查询参数 */
  getTransformedFormData: () => Record<string, unknown>
  /** 触发查询 */
  onSearchHandle: () => void
  /** 重置查询条件 */
  onResetHandle: () => void
}
