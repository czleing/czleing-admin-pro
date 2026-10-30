/**
 * CRUD 左侧树（c-tree）配置类型
 */
import type { CrudRequestMethod } from './api'
import type { SearchParams } from './common'

/** 树节点字段映射 */
export interface TreeReplaceField {
  key?: string
  title?: string
  children?: string
}

/** 左侧树配置 */
export interface TreeConfig {
  /** 树数据接口地址 */
  url: string
  /** 请求方式，默认 post */
  method?: CrudRequestMethod
  /** 查询参数 */
  params?: SearchParams
  /** 节点字段映射，默认 { key: 'id', title: 'label', children: 'children' } */
  replaceField?: TreeReplaceField
  /** 选中节点的 id 作为列表查询参数的参数名，默认 orgId */
  searchField?: string
}
