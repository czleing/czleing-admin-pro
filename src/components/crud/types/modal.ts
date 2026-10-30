/**
 * CRUD 新增/修改/详情弹窗（c-modal）配置类型
 */
import type { DrawerProps, ModalProps } from 'ant-design-vue'
import type { CrudFormData, CrudRecord, MaybeFn } from './common'
import type { FormConfig } from './form'

/** 弹窗上下文 */
export interface ModalContext {
  isAdd: boolean
  isEdit: boolean
  isView: boolean
}

/** 弹窗表单上下文 */
export interface ModalFormContext extends ModalContext {
  detail: CrudRecord
}

/** 弹窗按钮配置 */
export interface ModalButtonConfig {
  /** 确认按钮是否可见，默认可见 */
  showConfirm?: boolean
  /** 确认按钮文字，默认“确定” */
  confirmText?: string
  /**
   * 提交后是否继续：
   * - true：不关闭弹窗，只清空数据
   * - 函数：继续时对表单数据进行初始化
   */
  confirmContinue?: boolean | ((formData: CrudFormData, submitData: CrudRecord) => void | Promise<void>)
  /** 取消按钮是否可见，默认可见 */
  showCancel?: boolean
  /** 取消按钮文字，默认“关闭” */
  cancelText?: string
  /** 按钮对齐方式，默认 right */
  confirmAlign?: 'left' | 'center' | 'right'
}

/** 解析后的弹窗按钮配置 */
export interface NormalizedModalButtonConfig {
  showConfirm: boolean
  confirmText?: string
  confirmContinue?: boolean | ((formData: CrudFormData, submitData: CrudRecord) => void | Promise<void>)
  showCancel: boolean
  cancelText?: string
  confirmAlign: 'left' | 'center' | 'right'
}

/** 弹窗透传属性，兼容 a-modal 与 a-drawer */
export type ModalWrapperProps = Partial<ModalProps> & Partial<DrawerProps>

/** 弹窗配置 */
export interface ModalConfig {
  /** 弹窗标题，会自动拼上新增/编辑/详情关键字 */
  title?: string
  /** 全称，不会自动拼接其他字符串 */
  fullTitle?: string
  /** 弹窗宽度，默认 600 */
  width?: string | number
  /** 弹窗模式，默认 modal */
  mode?: 'modal' | 'drawer'
  /** 其他参数，直接绑定到 a-modal 或 a-drawer */
  props?: ModalWrapperProps
  /** 按钮配置，支持按上下文动态返回 */
  buttonConfig?: MaybeFn<ModalButtonConfig, [ModalContext]>
  /** 表单配置，支持按上下文动态返回 */
  formConfig?: MaybeFn<FormConfig, [ModalFormContext]>
}

/** 打开弹窗的选项 */
export interface ModalOpenOptions {
  title?: string
  mode?: 'modal' | 'drawer'
  width?: string | number
  showConfirm?: boolean
  confirmText?: string
  showCancel?: boolean
  cancelText?: string
  confirmAlign?: 'left' | 'center' | 'right'
  onConfirm?: (close: () => Promise<void>, extraData?: unknown) => void | Promise<void>
  onCancel?: (close: () => Promise<void>) => void | Promise<void>
}

/** 弹窗组件暴露的方法 */
export interface CrudModalExpose {
  open: (options: ModalOpenOptions) => void
  close: () => Promise<void>
  visible: import('vue').Ref<boolean>
}
