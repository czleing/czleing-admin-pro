/**
 * CRUD 通用基础类型
 * 被 api / tree / filter / tools / table / form / modal / page / component 等类型复用
 */
import type { TablePaginationConfig } from 'ant-design-vue'

/** CRUD 中的通用数据记录（表格行、详情、提交数据等） */
export type CrudRecord = Record<string, unknown>

/** 表单数据对象 */
export type CrudFormData = Record<string, unknown>

/** 查询参数对象 */
export type SearchParams = Record<string, unknown>

/**
 * 值或返回该值的函数
 * @example MaybeFn<string, [CrudFormData]> -> '文案' | (formData: CrudFormData) => string
 */
export type MaybeFn<T, Args extends unknown[] = []> = T | ((...args: Args) => T)

/**
 * 业务侧选项数据（系统内部统一格式）
 * 同时兼容 { id, name } 与 ant-design 的 { value, label } 两种写法
 */
export interface OptionItem {
  id?: string | number
  name?: string | number
  value?: string | number | null
  label?: string | number
  disabled?: boolean
  [key: string]: unknown
}

/** 转换后的 ant-design 选项 */
export interface CrudOption {
  value: string | number | null
  label: string | number
  disabled?: boolean
  [key: string]: unknown
}

/** 分页状态，继承 ant-design-vue 的分页配置 */
export interface CrudPagination extends TablePaginationConfig {
  current: number
  pageSize: number
  total: number
}

/** 排序状态 */
export interface CrudSorter {
  field?: string
  order?: 'ascend' | 'descend'
}

/** 列表接口返回结构（list 接口既支持返回该结构，也支持直接返回数组） */
export interface ListResult<Row = CrudRecord> {
  list: Row[]
  total?: number
}

/** 树形节点数据 */
export interface CrudTreeNode {
  [key: string]: unknown
  children?: CrudTreeNode[]
}

/** 字段名映射（树、树形选择等通用） */
export interface FieldNames {
  value?: string
  label?: string
  children?: string
}
