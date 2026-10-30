/**
 * CRUD 页面（c-page）配置与实例类型
 */
import type { Ref } from 'vue'
import type {
  CrudApiConfig,
  CrudApiMethodConfig,
  CrudApiOptionConfig,
  CrudPermissionConfig,
  ResolvedApiConfig,
  ResolvedApiMethodConfig,
  ResolvedPermissionConfig
} from './api'
import type { CrudRecord, SearchParams } from './common'
import type { CrudFormExpose, CrudImportExpose } from './component'
import type { FilterConfig } from './filter'
import type { CrudModalExpose, ModalConfig } from './modal'
import type { TableConfig } from './table'
import type { ToolsConfig } from './tools'
import type { TreeConfig } from './tree'

/** 页面事件 */
export interface CrudPageEmits {
  (e: 'added', data: CrudRecord): void
  (e: 'updated', data: CrudRecord): void
  (e: 'deleted', data?: CrudRecord): void
}

/** 提交前回调上下文 */
export interface BeforeSubmitContext {
  isAdd: boolean
  isEdit: boolean
  isView: boolean
  detail: CrudRecord
}

/** 提交后回调上下文 */
export interface AfterSubmitContext {
  isAdd: boolean
  isEdit: boolean
  formData: CrudRecord
  detail: CrudRecord
}

/** 打开弹窗后回调上下文 */
export interface AfterOpenModalContext {
  isAdd: boolean
  isEdit: boolean
  isView: boolean
  record?: CrudRecord
  detail: CrudRecord
  cForm: Ref<CrudFormExpose | undefined>
}

/** 详情转换回调上下文 */
export interface TransformDetailContext {
  isEdit: boolean
  isView: boolean
}

/** 操作回调上下文（表格操作列） */
export interface PageActionContext<Row = CrudRecord> {
  record?: Row
}

/** c-page 组件属性 */
export interface CrudPageProps<Row = CrudRecord> {
  /** 隐藏新增按钮 */
  noAdd?: boolean
  /** 隐藏删除按钮 */
  noDelete?: boolean
  /** 隐藏行选择 */
  noSelect?: boolean
  /** 隐藏工具栏 */
  noTools?: boolean
  /** 隐藏全屏按钮 */
  noFullscreen?: boolean
  /** 显示返回按钮 */
  hasGoBack?: boolean
  /** 显示导入按钮 */
  hasImport?: boolean
  /** 显示导出按钮 */
  hasExport?: boolean
  /** 主键字段名，默认 id */
  primaryKey?: string
  /** 工具栏配置 */
  toolsConfig?: ToolsConfig<Row>
  /** 预设接口地址配置 */
  apiConfig?: CrudApiConfig<Row>
  /** 预设接口请求方式配置 */
  apiMethodConfig?: CrudApiMethodConfig
  /** 预设接口额外请求配置 */
  apiOptionConfig?: CrudApiOptionConfig
  /** 预设功能权限配置 */
  permissionConfig?: CrudPermissionConfig
  /** 左侧树配置 */
  treeConfig?: TreeConfig
  /** 查询条件配置 */
  filterConfig?: FilterConfig
  /** 表格配置 */
  tableConfig?: TableConfig<Row>
  /** 新增/修改/详情弹窗配置 */
  modalConfig?: ModalConfig
  /** 查询前修改查询参数 */
  beforeSearch?: (params: SearchParams) => SearchParams
  /** 查询后修改查询结果 */
  afterSearch?: (list: Row[]) => Row[]
  /** 提交前修改提交数据 */
  beforeSubmit?: (submitData: CrudRecord, ctx: BeforeSubmitContext) => CrudRecord | void | Promise<CrudRecord | void>
  /** 提交成功后执行 */
  afterSubmit?: (ctx: AfterSubmitContext) => void | Promise<void>
  /** 打开弹窗后执行 */
  afterOpenModal?: (ctx: AfterOpenModalContext) => void | Promise<void>
  /** 编辑、详情时对详情数据修改 */
  transformDetail?: (detail: CrudRecord, ctx: TransformDetailContext) => CrudRecord
}

/** c-page 组件暴露的方法与状态 */
export interface CrudPageExpose<Row = CrudRecord> {
  cModal: Ref<CrudModalExpose | undefined>
  cForm: Ref<CrudFormExpose | undefined>
  detail: Ref<CrudRecord>
  selectedIds: Ref<(string | number)[]>
  selectedObjs: Ref<Row[]>
  refresh: (resetPage?: boolean) => Promise<void>
  reload: (resetPage?: boolean) => Promise<void>
  onAddHandle: (initData?: CrudRecord) => void
  onActionHandle: (params: PageActionParams<Row>) => void
  clearSelect: () => void
  dataSource: Row[]
}

/** 操作处理参数 */
export interface PageActionParams<Row = CrudRecord> {
  /** 操作类型：预设为 edit / detail / delete / toggle，也可为自定义标识 */
  action: string
  /** 当前行数据 */
  record: Row
  /** 批量删除时的 id 集合 */
  ids?: (string | number)[]
  [key: string]: unknown
}

/** useActionHandle 入参 */
export interface ActionHandleParams<Row = CrudRecord> {
  cModal: Ref<CrudModalExpose | undefined>
  cForm: Ref<CrudFormExpose | undefined>
  cTable: Ref<{ refresh?: (resetPage?: boolean) => Promise<void>; clearSelect?: () => void } | undefined>
  modalConfig: ModalConfig
  api: ResolvedApiConfig<Row>
  apiMethod: ResolvedApiMethodConfig
  apiOptionConfig?: CrudApiOptionConfig
  permissionConfig: ResolvedPermissionConfig
  primaryKey: string
  transformDetail?: (detail: CrudRecord, ctx: TransformDetailContext) => CrudRecord
  afterOpenModal?: (ctx: AfterOpenModalContext) => void | Promise<void>
  afterSubmit?: (ctx: AfterSubmitContext) => void | Promise<void>
  emit: CrudPageEmits
}

/** c-import 组件引用 */
export type CrudImportRef = Ref<CrudImportExpose | undefined>
