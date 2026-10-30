/**
 * CRUD 工具栏（c-tools）配置类型
 */
import type { ButtonProps } from 'ant-design-vue'
import type { Component } from 'vue'
import type { CrudPagination, CrudRecord, MaybeFn } from './common'

/** 工具栏按钮/自定义组件的上下文数据 */
export interface ToolsContext<Row = CrudRecord> {
  selectedIds: (string | number)[]
  selectedObjs: Row[]
  pagination: CrudPagination
}

/** 工具栏按钮属性，继承 a-button 属性，并对 icon / disabled / onClick 做业务扩展 */
export interface ToolButtonProps<Row = CrudRecord> extends Omit<ButtonProps, 'icon' | 'disabled' | 'onClick'> {
  /** 已注册的 ant-design 图标名 */
  icon?: string
  /** 是否禁用，支持函数动态计算 */
  disabled?: MaybeFn<boolean, [ToolsContext<Row>]>
  /** 点击事件 */
  onClick?: (ctx: ToolsContext<Row>) => void
}

/** 事件监听集合 */
export type ToolEvents = Record<string, (...args: unknown[]) => void>

/** 工具栏单项配置 */
export interface ToolItem<Row = CrudRecord> {
  /** 按钮名称，支持函数动态计算 */
  name?: MaybeFn<string, [ToolsContext<Row>]>
  /** 自定义组件：全局组件名或组件对象 */
  component?: string | Component
  /** 权限标识 */
  permission?: string
  /** 按钮/组件属性 */
  props?: ToolButtonProps<Row>
  /** 事件监听：对象或按上下文返回对象的函数 */
  on?: ToolEvents | ((ctx: ToolsContext<Row>) => ToolEvents)
}

/** 工具栏配置 */
export interface ToolsConfig<Row = CrudRecord> {
  /** 新增按钮文字，默认“新增” */
  addBtnText?: string
  /** 新增时初始化表单的数据 */
  addInitData?: CrudRecord
  /** 返回按钮文字，默认“返回” */
  backBtnText?: string
  /** 自定义工具栏项 */
  otherTools?: ToolItem<Row>[]
}

/** 工具栏组件暴露的方法 */
export interface CrudToolsExpose {
  columns: CrudRecord[]
  pagination: CrudPagination
}
