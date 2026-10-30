/**
 * CRUD 表格（c-table / c-table-action）配置类型
 */
import type { TableColumnType, TableProps } from 'ant-design-vue'
import type { TableRowSelection } from 'ant-design-vue/es/table/interface'
import type { Ref, VNodeChild } from 'vue'
import type { CrudRecord, MaybeFn } from './common'

/** 预设操作（自动绑定权限与系统弹窗） */
export type PresetTableAction = 'edit' | 'detail' | 'delete' | 'toggle'

/** 操作回调参数 */
export interface TableActionContext<Row = CrudRecord> {
  record: Row
}

/** 操作列按钮配置 */
export interface TableActionConfig<Row = CrudRecord> {
  /** 按钮名称，与 icon 至少设置一个 */
  name?: string
  /** 图标（已注册的 ant-design 图标名） */
  icon?: string
  /** 按钮样式类名 */
  class?: string
  /** 权限标识，预设操作会自动绑定，无需手动设置 */
  permission?: string
  /** 是否需要确认框 */
  confirm?: boolean
  /** 确认框提示内容，不填则使用默认模板 */
  confirmContent?: string
  /** 点击回调：预设字符串或自定义函数 */
  callback?: PresetTableAction | ((ctx: TableActionContext<Row>) => void | Promise<void>)
  /** 自定义按钮外观 */
  customRender?: (ctx: TableActionContext<Row>) => VNodeChild
}

/** 解析后的操作按钮（框架内部使用） */
export interface NormalizedTableAction<Row = CrudRecord> {
  name?: string
  icon?: string
  class: string
  permission?: string
  confirm: boolean
  confirmContent?: string
  callback: (ctx: TableActionContext<Row>) => void | Promise<void>
  customRender?: (ctx: TableActionContext<Row>) => VNodeChild
}

/** 表格列的预处理类型 */
export type TableColumnPresetType = 'isEnabled' | 'Boolean' | (string & {})

/** 表格自定义渲染参数 */
export interface TableCustomRenderContext<Row = CrudRecord> {
  text: unknown
  value: unknown
  record: Row
  index: number
  renderIndex: number
  column: TableColumnType<CrudRecord>
}

/**
 * 表格列配置
 * 继承 ant-design-vue 的 ColumnType，并扩展 CRUD 业务属性
 * 说明：title、dataIndex、customRender 之外的标准列属性均沿用 ant-design-vue 的定义，保证与 a-table 完全兼容
 */
export interface CrudTableColumn<Row = CrudRecord> extends TableColumnType<CrudRecord> {
  /** 自定义渲染函数 */
  customRender?: (ctx: TableCustomRenderContext) => VNodeChild
  /** 表头 Tooltip */
  tooltip?: string
  /** 单位，拼接在单元格内容后面 */
  unit?: string
  /** 是否参与合计行 */
  useTotal?: boolean
  /** 是否隐藏，可通过列筛选勾选显示 */
  hidden?: boolean
  /** 字典类型，自动解析中文 */
  dictType?: string
  /** 插槽名 */
  slot?: string
  /** 列宽拖拽 */
  resizable?: boolean
  /** 最小宽度（拖拽） */
  minWidth?: number
  /** 最大宽度（拖拽） */
  maxWidth?: number
  /** 字符串脱敏：[左保留位数, 右保留位数, 替换字符, 替换字符显示长度] */
  hideChar?: [number, number, string?, number?]
  /** 默认值，支持 HTML */
  default?: string
  /** 格式化为金额 */
  isAmount?: boolean
  /** 格式化为头像 */
  isAvatar?: boolean
  /** 格式化为图片 */
  isImage?: boolean
  /** 格式化为日期 YYYY-MM-DD */
  isDate?: boolean
  /** 格式化为日期时间 YYYY-MM-DD HH:mm */
  isDateTime?: boolean
  /** 自定义日期格式 */
  dateFormat?: string
  /** 预处理类型 */
  type?: TableColumnPresetType
  /** 操作列配置：数组或按行动态返回 */
  action?: TableActionConfig<Row>[] | ((ctx: TableActionContext<Row>) => TableActionConfig<Row>[])
  /** 展示的操作按钮数量，剩余收入“更多” */
  actionShowNum?: number
  /** “更多”按钮名称 */
  actionMoreText?: string
}

/** 行点击事件参数 */
export interface RowClickContext<Row = CrudRecord> {
  key: unknown
  index: number
  record: Row
  selected: boolean
  selectedIds: Ref<(string | number)[]>
  selectedObjs: Ref<Row[]>
}

/**
 * 表格属性
 * 继承 ant-design-vue 的 TableProps，并扩展 CRUD 业务属性
 */
export interface CrudTableProps<Row = CrudRecord>
  extends Omit<TableProps<Row>, 'columns' | 'dataSource' | 'pagination' | 'rowKey' | 'rowSelection'> {
  /** 分页大小，默认 10 */
  pageSize?: number
  /** 是否使用分页，默认 true（也可通过 showSorterTooltip 等原生属性扩展） */
  usePage?: boolean
  /** 数据行点击事件 */
  rowClick?: (ctx: RowClickContext<Row>) => void
  /** 行选择配置 */
  rowSelection?: Omit<TableRowSelection<Row>, 'selectedRowKeys' | 'onChange' | 'getCheckboxProps'>
}

/** 表格配置 */
export interface TableConfig<Row = CrudRecord> {
  /** 透传给 a-table 的属性 */
  props?: CrudTableProps<Row>
  /** 是否初始化时查询，默认 true（查询条件有默认值时默认关闭） */
  initSearch?: boolean
  /** 列配置 */
  columns: CrudTableColumn<Row>[]
}

/** 列宽拖拽的尺寸缓存 */
export type ColumnSizeMap = Record<string, { width: number; realWidth: number }>

/** 表格组件暴露的方法（用于 ref 类型提示） */
export interface CrudTableExpose<Row = CrudRecord> {
  /** 查询，分页重置 */
  search: () => Promise<void>
  /** 查询，分页不重置 */
  refresh: () => Promise<void>
  /** 查询，分页重置 */
  reload: () => Promise<void>
  clearSelect: () => void
  dataSource: Row[]
}

/** 排序状态（内部） */
export interface CrudSorterLike {
  field?: string
  order?: 'ascend' | 'descend'
}
