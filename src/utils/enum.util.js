/**
 * 枚举对象
 * extra 为 boolean 时代表 disabled
 * extra 为 string 时代表 class
 * extra 为 object 时代表 data，此时第四个参数 data 无效
 * data 代表扩展属性
 * {id, name, disabled} or {id, name, class} or {id, name, data} or {id, name, disabled, data} or {id, name, class, data}
 */
export const Enum = (id, name, extra, data = {}) => {
  const disabled = typeof extra === 'boolean' ? extra : (data.disabled || false)
  const _class = typeof extra === 'string' ? extra : data.class
  const _data = typeof extra === 'object' ? extra : data
  name = name ?? id
  return {
    id,
    name,
    disabled,
    class: _class,
    data: _data,
    key: id,
    value: id,
    label: name,
    title: name,
    text: name,
    isEnum: true,
    toString () {
      return this.id
    }
  }
}

/**
 * 初始化
 * 判断时直接用 if (user.status === xxxEnum.STATUS1)
 */
export function init (enumObj) {
  const keys = Object.keys(enumObj).filter((key) => enumObj[key].isEnum)
  enumObj._list = keys.map((key) => ({ ...enumObj[key] }))
  // 为了简化大部分使用情况，用ID覆盖原本的对象，要获取对象请用 _objectOf 方法
  for (let i in keys) {
    enumObj[keys[i]] = enumObj[keys[i]].id
  }
  enumObj._of = (id, defaultValue = '-') => {
    return enumObj._objectOf(id)?.name || defaultValue
  }
  enumObj._objectOf = (id, useDefault = true) => {
    let result = enumObj._list.find((item) => item.id === id)
    return useDefault ? (result || Enum()) : result
  }
  enumObj._classOf = (id) => {
    return enumObj._objectOf(id)?.class
  }
  if (Object.freeze) {
    Object.freeze(enumObj)
  }
}
