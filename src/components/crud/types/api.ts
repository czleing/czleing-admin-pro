/**
 * CRUD 接口、请求方式、权限配置类型
 */
import type { CrudRecord, ListResult, SearchParams } from './common'

/** 支持的请求方式 */
export type CrudRequestMethod = 'get' | 'post' | 'put' | 'delete' | 'patch'

/** CRUD 预设接口动作 */
export type CrudApiAction =
  | 'add'
  | 'update'
  | 'detail'
  | 'list'
  | 'delete'
  | 'toggle'
  | 'import'
  | 'importTemplate'
  | 'export'

/**
 * 列表接口配置
 * - 字符串：接口地址
 * - 函数：自定义查询，直接返回列表数据
 */
export type CrudListApi<Row = CrudRecord> =
  | string
  | ((params: SearchParams) => ListResult<Row> | Promise<ListResult<Row>>)

/**
 * 预设接口地址配置
 * 未配置的项会根据当前路由自动生成，例如 /system/user -> /system/user/add
 */
export interface CrudApiConfig<Row = CrudRecord> {
  add?: string
  update?: string
  detail?: string
  list?: CrudListApi<Row>
  delete?: string
  toggle?: string
  import?: string
  importTemplate?: string
  export?: string
}

/** 预设接口请求方式配置，默认全部 post */
export type CrudApiMethodConfig = Partial<Record<CrudApiAction, CrudRequestMethod>>

/** 单个接口的额外请求配置 */
export interface ApiOptionConfig {
  headers?: Record<string, string | number | boolean>
  responseType?: 'json' | 'text' | 'blob' | 'arraybuffer' | 'stream'
}

/** 预设接口额外请求配置，如 headers、responseType */
export type CrudApiOptionConfig = Partial<Record<CrudApiAction, ApiOptionConfig>>

/** 预设功能权限配置，未配置时根据当前路由生成，如 /system/user -> system:user:add */
export interface CrudPermissionConfig {
  add?: string
  update?: string
  detail?: string
  list?: string
  delete?: string
  toggle?: string
  import?: string
  export?: string
}

/** 解析后的接口地址配置（所有字段均有默认值） */
export interface ResolvedApiConfig<Row = CrudRecord> {
  add: string
  update: string
  detail: string
  list: CrudListApi<Row>
  delete: string
  toggle: string
  import: string
  importTemplate: string
  export: string
}

/** 解析后的请求方式配置 */
export type ResolvedApiMethodConfig = Record<CrudApiAction, CrudRequestMethod>

/** 解析后的权限配置 */
export interface ResolvedPermissionConfig {
  add: string
  update: string
  detail: string
  list: string
  delete: string
  toggle: string
  import: string
  export: string
}
