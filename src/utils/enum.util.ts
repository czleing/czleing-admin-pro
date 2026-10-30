/**
 * 枚举工具
 * 用法：
 * const EStatus = init({
 *   eEnabled: Enum(1, '启用', 'text-success'),
 *   eDisabled: Enum(0, '禁用', 'text-danger')
 * });
 * 之后
 * EStatus.eEnabled === 1
 * EStatus._of(1) === '启用'
 * EStatus._list === [{ id: 1, name: '启用' }, { id: 0, name: '禁用' }]
 * EStatus._classOf(1) === 'text-success'
 */

/** 枚举条目 extra 参数：boolean 表示 disabled，string 表示 class，object 表示 data */
type EnumExtra = boolean | string | Record<string, unknown>

/** 枚举条目对象，Id 泛型用于保留字面量类型，便于做可辨识联合 */
export interface EnumItem<Id extends string | number = string | number> {
  id: Id
  name: string | number
  disabled: boolean
  class?: string
  data: Record<string, unknown>
  key: Id
  value: Id
  label: string | number
  title: string | number
  text: string | number
  isEnum: true
  toString(): string
  /** 允许携带额外业务字段（如 options 直接使用 _list 时） */
  [key: string]: unknown
}

/** 枚举初始化后的增强对象（init 之后会被 Object.freeze） */
export interface EnumObject<T extends Record<string, EnumItem>> {
  /** 枚举条目列表 */
  _list: EnumItem[]
  /** 根据 id 获取 name，找不到时返回默认值或 '-' */
  _of: (id: string | number, defaultValue?: string) => string
  /** 根据 id 获取完整枚举条目，找不到时返回默认 Enum() 或 undefined */
  _objectOf: (id: string | number, useDefault?: boolean) => EnumItem | undefined
  /** 根据 id 获取 class 字段 */
  _classOf: (id: string | number) => string | undefined
  /** 原始枚举对象的所有 key 值（init 后会被 id 覆盖） */
  [key: string]: unknown
}

/**
 * 创建一个枚举条目
 * @param id 枚举值（保存后会被用作 key）
 * @param name 枚举标签/显示名，不传则用 id
 * @param extra 额外字段：boolean=disabled, string=class, object=data
 * @param data 扩展属性（当 extra 为 object 时此参数无效）
 */
export function Enum<Id extends string | number>(id: Id, name?: string, extra?: EnumExtra, data: Record<string, unknown> = {}): EnumItem<Id> {
  const disabled = typeof extra === 'boolean' ? extra : ((data.disabled as boolean) ?? false)
  const _class = typeof extra === 'string' ? extra : (data.class as string | undefined)
  const _data: Record<string, unknown> = typeof extra === 'object' ? extra : data
  const displayName = name ?? id
  return {
    id,
    name: displayName,
    disabled,
    class: _class,
    data: _data,
    key: id,
    value: id,
    label: displayName,
    title: displayName,
    text: displayName,
    isEnum: true,
    toString() {
      return String(this.id)
    },
  }
}

/** 枚举 id 映射：把枚举对象的每个 key 映射为对应条目的 id 字面量类型 */
export type EnumIdMap<T extends Record<string, EnumItem>> = {
  [K in keyof T]: T[K] extends EnumItem<infer Id> ? Id : never
}

/**
 * 初始化枚举对象：为其注入 _list / _of / _objectOf / _classOf 等辅助方法，
 * 并将每个枚举 key 覆盖为其 id 值（方便 if (val === EStatus.eEnabled) 使用）
 * 返回值带 id 字面量类型，便于在 TS 中做可辨识联合与自动补全
 * @param enumObj 枚举对象
 */
export function init<T extends Record<string, EnumItem>>(
  enumObj: T
): EnumObject<T> & EnumIdMap<T> {
  const keys = Object.keys(enumObj).filter((key) => (enumObj[key] as unknown as EnumItem).isEnum)
  const _list: EnumItem[] = keys.map((key) => ({ ...(enumObj[key] as unknown as EnumItem) }))
  // 为了简化大部分使用情况，用 ID 覆盖原本的对象，要获取对象请用 _objectOf 方法
  for (let i in keys) {
    ;(enumObj as unknown as Record<string, unknown>)[keys[i]] = _list[i].id
  }
  const result = enumObj as unknown as EnumObject<T>
  result._list = _list
  result._of = (id, defaultValue = '-') => {
    const item = result._objectOf(id)
    return item ? (item.name as string) : defaultValue
  }
  result._objectOf = (id, useDefault = true) => {
    let found = result._list.find((item) => item.id === id)
    if (!found && useDefault) {
      found = { id, name: String(id), disabled: false, data: {}, key: id, value: id, label: String(id), title: String(id), text: String(id), isEnum: true, toString() { return String(id) } } as EnumItem
    }
    return found
  }
  result._classOf = (id) => {
    return result._objectOf(id)?.class
  }
  if (Object.freeze) {
    Object.freeze(result)
  }
  return result as EnumObject<T> & EnumIdMap<T>
}
