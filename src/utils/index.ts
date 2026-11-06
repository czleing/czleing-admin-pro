/**
 * 通用工具函数
 */
import { Modal, message as Message } from 'ant-design-vue'
import { ExclamationCircleOutlined } from '@ant-design/icons-vue'
import { createVNode, type Ref } from 'vue'

/** 可空值（null / undefined 统称为 nullish） */
type Nullable<T> = T | null | undefined

/** 可用的判断类型 */
export type IsEmptyValue = string | number | boolean | null | undefined | Record<string, unknown> | unknown[]

/**
 * 是否为空
 * 适用参数：对象、数组、字符串
 * @param value 待检测值
 * @returns true 表示空
 */
export function isEmpty(value: IsEmptyValue): boolean {
  if (value === true || value === false || value === 0) return false
  if (!value) return true
  if (typeof value === 'string') {
    return value.trim().length === 0
  } else if (Array.isArray(value)) {
    return value.length === 0
  } else if (typeof value === 'object') {
    return Object.keys(value).length === 0
  }
  return false
}

/**
 * 是否不为空
 */
export function isNotEmpty(value: IsEmptyValue): boolean {
  return !isEmpty(value)
}

/**
 * 检测对象是否所有属性都为空
 * @param obj 对象
 * @param excludeFields 排除字段，字符串或字符串数组
 * @returns true: 对象为空或者对象所有属性为空，false: 至少有一个属性不为空
 */
export function isAllFieldEmpty(obj: Nullable<Record<string, unknown>>, excludeFields: string | string[] = []): boolean {
  if (!obj) return true
  if (typeof obj !== 'object') return false
  const keys = Object.keys(obj)
  let excludes = excludeFields
  if (typeof excludes === 'string') {
    excludes = [excludes]
  }
  const existValue = keys.some((key) => {
    if ((excludes as string[]).includes(key)) return false
    return obj[key] === 0 || obj[key]
  })
  return !existValue
}

/**
 * 判断是否为 dayjs 对象
 */
export function isDayjs(val: unknown): boolean {
  return !!val && typeof val === 'object' && Boolean((val as { $isDayjsObject?: boolean }).$isDayjsObject)
}

/**
 * 字节格式化，字节数转为常用单位
 */
export function byteFormat(byte: number): string | number {
  if (!byte) return 0
  if (byte > 1024 << 20) {
    return (byte / (1024 << 20)).toFixed(2) + 'GB'
  } else if (byte > 1024 << 10) {
    return (byte / (1024 << 10)).toFixed(2) + 'MB'
  } else if (byte > 1024) {
    return (byte / 1024).toFixed(2) + 'KB'
  }
  return byte + 'B'
}

/** loadingRequest 函数参数类型 */
type LoadingTarget = ((bol: boolean) => void) | { value: boolean } | Ref<boolean>
type AsyncFunc = () => Promise<unknown> | unknown

/**
 * 使用 loading 执行异步函数
 * @param loading loading 状态：可以是 setter 函数、ref 或 { value: boolean }
 * @param func 要执行的异步函数
 * @param message 成功后提示的消息（可选）
 */
export async function loadingRequest(loading: LoadingTarget, func: AsyncFunc, message?: string): Promise<void> {
  function setLoading(bol: boolean): void {
    if (typeof loading === 'function') {
      ;(loading as (bol: boolean) => void)(bol)
    } else if (loading && typeof loading === 'object' && 'value' in loading) {
      ;(loading as { value: boolean }).value = bol
    }
  }
  try {
    setLoading(true)
    await func()
    if (message) {
      Message.success(message)
    }
  } finally {
    setLoading(false)
  }
}

/** Modal 配置项（简化版） */
interface ConfirmOption {
  showConfirmButton?: boolean
  showCancelButton?: boolean
  confirmButtonText?: string
  cancelButtonText?: string
  [key: string]: unknown
}

/**
 * 对话框提示确认后执行异步函数
 */
export function confirmRequest(
  content: string,
  title: string,
  loading: LoadingTarget,
  func: AsyncFunc,
  message?: string,
  option: ConfirmOption = {}
): ReturnType<typeof Modal.confirm> {
  return Modal.confirm({
    title,
    content,
    icon: createVNode(ExclamationCircleOutlined),
    ...option,
    async onOk() {
      return await loadingRequest(loading, func, message)
    },
  })
}

/** 等待 duration 毫秒 */
export function sleep(duration = 0): Promise<void> {
  return new Promise((r) => setTimeout(r, duration))
}

/** 时长对象 */
export interface DurationResult {
  hour: number
  minute: number
  second: number
}

/**
 * 把秒转为 xx时xx分xx秒
 * @param seconds 秒
 * @param needSecond 是否精确到秒
 */
export function toDuration(seconds = 0, needSecond = true): DurationResult {
  const h = 3600
  const m = 60
  const hour = parseInt(String(seconds / h), 10)
  const minute = parseInt(String((seconds % h) / m), 10)
  const second = needSecond ? seconds % m : 0
  return { hour, minute, second }
}

/** 大数值转换结果 */
export interface TransformResult {
  value: number
  unit: string
}

/**
 * 将数值转为 xx万 或 xx亿
 * @param num 数值
 * @param digit 小数位数
 * @param isForceTransform 是否强制转换，默认：false 大于 9999 才会转
 */
export function transformNum(num: number | string, digit = 2, isForceTransform = false): TransformResult {
  let n = Number(num)
  let unit = ''
  if ((isForceTransform && n > 0) || (!isForceTransform && n > 9999)) {
    n = n / 10000
    unit = '万'
    if (n > 9999) {
      n = n / 10000
      unit = '亿'
    }
  }
  return {
    value: Number(n.toFixed(digit)),
    unit,
  }
}

/** 通过分子/分母计算商 */
export function divide(numerator: number | string, denominator: number | string, digit = 2): number {
  const n = Number(numerator)
  const d = Number(denominator)
  return d === 0 ? 0 : Number((n / d).toFixed(digit))
}

/** 通过分子*100/分母计算百分比 */
export function calcPercent(numerator: number | string, denominator: number | string, digit = 2): number {
  return Number((divide(numerator, denominator, digit + 2) * 100).toFixed(digit))
}

/** numFormat 配置项 */
interface NumFormatOptions {
  /** 分隔位数：3=千分位，4=万分位 */
  splitDigits?: number
  /** 保留小数位数，null=保留原始小数不截断 */
  digit?: number | null
  /** 小数不足时是否补0 */
  fillZero?: boolean
}

/**
 * 数值格式化（千分位/万分位）
 */
export function numFormat(value: number | string | null | undefined, options: NumFormatOptions = {}): string {
  const { splitDigits = 3, digit = null, fillZero = true } = options
  // 1. 异常值兜底
  if (value === null || value === undefined || value === '') {
    return ''
  }
  // 转为数字
  let num = Number(value)
  if (isNaN(num)) {
    return ''
  }
  // 处理正负
  const isNegative = num < 0
  num = Math.abs(num)
  // 2. 处理小数位
  let integerStr = ''
  let decimalStr = ''
  if (digit !== null && typeof digit === 'number') {
    // 指定小数位数
    const fixed = num.toFixed(digit)
    ;[integerStr, decimalStr = ''] = fixed.split('.')
    if (fillZero && decimalStr.length < digit) {
      decimalStr = decimalStr.padEnd(digit, '0')
    }
  } else {
    // 保留原始小数
    const str = num.toString()
    ;[integerStr, decimalStr = ''] = str.split('.')
  }
  // 3. 整数部分 千分位 / 万分位 分隔
  integerStr = integerStr.split('').reverse().join('')
  const chunks: string[] = []
  for (let i = 0; i < integerStr.length; i += splitDigits) {
    chunks.push(integerStr.slice(i, i + splitDigits))
  }
  integerStr = chunks.join(',').split('').reverse().join('')
  // 4. 拼接结果
  let result = integerStr
  if (decimalStr) {
    result += `.${decimalStr}`
  }
  if (isNegative) {
    result = `-${result}`
  }
  return result
}

/**
 * 字符串脱敏处理
 * stringStar('13412341234', 3, 4) => '134****1234'
 * @param value 需要处理的字符串或数字
 * @param startLen 左边保留字符长度
 * @param endLen 右边保留字符长度
 * @param mark 替换字符
 * @param markLen 被替换成的字符数量，默认根据 startLen+endLen 自动计算
 */
export function stringStar(
  value: string | number,
  startLen: number,
  endLen: number,
  mark = '*',
  markLen?: number
): string | number {
  const str: string = typeof value === 'number' ? value.toString() : value
  if (typeof str !== 'string') return value
  if (str.length < startLen + endLen) return str
  const len = markLen ?? str.length - startLen - endLen
  const star = new Array(len).fill(mark).join('')
  const startStr = str.slice(0, startLen)
  const endStr = str.slice(-Math.abs(endLen))
  return startStr + star + endStr
}

/** 可能是函数，也可能是值 */
type MaybeFn<T, A extends unknown[] = []> = T | ((...args: A) => T)

/**
 * 获得一个值，可能来源于一个函数的结果
 */
export function getFnValue<T, A extends unknown[] = []>(value: MaybeFn<T, A>, ...args: A): T {
  if (typeof value === 'function') {
    return (value as (...args: A) => T)(...args)
  }
  return value as T
}

/**
 * 处理图片资源，自动补全 base64 前缀，兼容 url / 相对路径 / base64 字符串
 */
export function getImageSrcData(text: Nullable<string>): string {
  if (!text) return ''
  if (typeof text !== 'string') return text as unknown as string
  const str = String(text).trim()
  if (!str) return ''
  if (str.startsWith('data:image/')) {
    return str
  }
  const isPureBase64 = /^[A-Za-z0-9+/=]+$/.test(str)
  if (isPureBase64) {
    return `data:image/png;base64,${str}`
  }
  return getFullUrl(str)
}

/** 获取资源全地址 */
export function getFullUrl(path: Nullable<string>): string {
  if (!path) return ''
  const resourceApi = import.meta.env.VITE_APP_RESOURCE_API
  if (/http.*/.test(path) || path.indexOf(resourceApi) === 0) {
    return path
  }
  return resourceApi + path
}

/** 列表转树的节点类型（会就地添加 children 字段） */
interface TreeNode extends Record<string, unknown> {
  children?: TreeNode[]
}

/**
 * 列表转树
 * @param list 列表数据
 * @param rootParentId 根级节点 ID
 * @param idField id 字段名
 * @param parentIdField parentId 字段名
 * @param childrenField children 字段名
 */
export function listToTree(
  list: Nullable<TreeNode[]>,
  rootParentId: string | number = 0,
  idField = 'id',
  parentIdField = 'parentId',
  childrenField = 'children'
): TreeNode[] {
  const tree: TreeNode[] = []
  const idMap: Record<string | number, TreeNode> = {}
  if (isEmpty(list as unknown as unknown[])) return tree
  const arr = list as TreeNode[]
  arr.forEach((item) => {
    const id = item[idField] as string | number
    const parentId = item[parentIdField] as string | number
    item.children = undefined
    if (!parentId || parentId === rootParentId) {
      tree.push(item)
    }
    idMap[id] = item
  })
  arr.forEach((item) => {
    const parentId2 = item[parentIdField] as string | number
    if (parentId2) {
      const parent = idMap[parentId2]
      if (parent && isEmpty(parent[childrenField] as unknown as unknown[])) {
        ;(parent[childrenField] as TreeNode[]) = [item]
      } else if (parent) {
        ;(parent[childrenField] as TreeNode[]).push(item)
      } else if (import.meta.env.VITE_APP_DEBUG_MODE === 'true') {
        console.error(`id 为 ${parentId2} 的节点不存在`)
      }
    }
  })
  return tree
}

/** setRootCssVars 参数 */
interface CssVars {
  [key: string]: string | number
}

/**
 * 给 :root 设置 CSS 变量（动态注入 <style> 标签，不污染 html 行内 style）
 * @param prex 变量前缀，默认 '--ant-'
 * @param vars 键值对 { 'color': '#fff', 'size': '16px' }
 * @param id style 元素 id，默认 'dynamic-root-vars'
 */
export function setRootCssVars(prex = '--ant-', vars: Nullable<CssVars>, id = 'dynamic-root-vars'): void {
  if (!vars) return
  let styleEl = document.getElementById(id) as HTMLStyleElement | null
  if (!styleEl) {
    styleEl = document.createElement('style')
    styleEl.id = id
    document.head.appendChild(styleEl)
  }
  // 拼接 css 文本
  const cssText = Object.entries(vars).map(([key, val]) => `${prex}${key}: ${val};`).join('\n')
  styleEl.textContent = `:root { ${cssText} }`
}

// 导出 ModalStatic 方便其他模块引用（仅类型，不产生运行时依赖）

