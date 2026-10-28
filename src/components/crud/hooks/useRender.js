import { EControlType } from '@/enum/index'
import { getFnValue, isNotEmpty, isEmpty } from '@/utils/index'
import dayjs from 'dayjs'
import { h, resolveComponent } from 'vue'

/**
 * 渲染组件
 * 根据 field 配置
 * 可以通过自定义渲染函数来改变全局组件的渲染
 * 到这里，组件的所有 props 都已经解析为静态属性，不存在函数式动态属性
 * @returns 组件
 */
export function useRender ({ ctx, isView, value, dataSource }) {
  const formData = inject('c-form.formData', {})
  const { t, te } = useI18n()
  const emitUpdate = async (...args) => {
    ctx.$emit('update:value', ...args) // 统一使用 value 作为双向绑定的 props (为了与 ant-design 一致)
  }
  // 自定义渲染函数
  const getRenderFn = {
    [EControlType.eInput]: renderInput,
    [EControlType.eHidden]: renderHidden,
    [EControlType.eAutoComplete]: renderAutoComplete,
    [EControlType.eTextarea]: renderTextarea,
    [EControlType.eNumber]: renderInputNumber,
    [EControlType.eNumberRange]: renderInputNumberRange,
    [EControlType.eRadio]: renderRadio,
    [EControlType.eCheckbox]: renderCheckbox,
    [EControlType.eSelect]: renderSelect,
    [EControlType.eDate]: renderDate,
    [EControlType.eDateRange]: renderDateRange,
    [EControlType.eSwitch]: renderSwitch,
    [EControlType.eEditor]: renderEditor,
    [EControlType.eTreeSelect]: renderTreeSelect,
    [EControlType.eCustom]: renderCustom
  }
  // 通过字段配置生成控件
  function renderByField (field) {
    field.type = field.type ?? EControlType.eInput
    const fn = getRenderFn[field.type]
    if (fn) {
      // 1.有自定义渲染函数的，用自定义渲染函数渲染
      return fn(field)
    } else if (field.type) {
      const controlTypeEnum = EControlType._objectOf(field.type)
      // 2.没有自定义的，尝试当全局组件渲染，当然上面所有的 ant-design 组件都可以走这里，只是查看模式时，不会渲染成文本，而是渲染成禁用的组件
      return h(resolveComponent(field.type), {
        ...controlTypeEnum?.data?.defaultProps ?? {},
        ...field.props,
        value,
        isView,
        onChange: undefined,
        disabled: field.props.disabled ?? isView,
        'onUpdate:value': emitUpdate
      })
    } else {
      console.warn('field.type 不存在')
    }
  }
  /**
   * 渲染输入框
   * @param {Object} field 字段配置信息
   * @returns 组件VNode
   */
  function renderInput (field) {
    // 查看模式，直接渲染文本
    if (isView) {
      return h('span', [value ?? '-'])
    }
    const controlTypeEnum = EControlType._objectOf(field.type)
    const props = Object.assign(
      {
        type: 'text',
        placeholder: field.props?.placeholder ?? t('crud.pleaseEnter', { text: field.label }),
        maxlength: 50
      },
      controlTypeEnum.data.defaultProps ?? {},
      field.props
    )
    const controlProps = {
      ...props,
      value,
      onChange: undefined,
      'onUpdate:value': emitUpdate
    }
    let type = field.type
    if (field.props?.type === 'password') {
      type = 'a-input-password'
    }
    return h(resolveComponent(type), controlProps)
  }

  /**
   * 渲染隐藏域
   * @param {Object} field 字段配置信息
   * @returns 组件VNode
   */
  function renderHidden (field) {
    // 查看模式，直接渲染文本
    if (isView) {
      return h('span', { style: 'display: none;'}, [value ?? '-'])
    }
    const controlTypeEnum = EControlType._objectOf(field.type)
    const props = Object.assign(
      {
        type: 'text',
      },
      controlTypeEnum.data.defaultProps ?? {},
      field.props
    )
    const controlProps = {
      ...props,
      value,
      onChange: undefined,
      'onUpdate:value': emitUpdate
    }
    return h(resolveComponent('a-input'), controlProps)
  }

  /**
   * 渲染自动补全输入框
   * @param {Object} field 字段配置信息
   * @returns 组件VNode
   */
  function renderAutoComplete (field) {
    // 查看模式，直接渲染文本
    if (isView) {
      return h('span', [value ?? '-'])
    }
    const controlTypeEnum = EControlType._objectOf(field.type)
    const props = Object.assign(
      {
        placeholder: field.props?.placeholder ?? t('crud.pleaseEnterOrSelect', { text: field.label })
      },
      controlTypeEnum.data.defaultProps ?? {},
      field.props
    )
    const options = transformOptions(props.options ?? dataSource)
    const controlProps = {
      ...props,
      value,
      options,
      onChange: undefined,
      'onUpdate:value': emitUpdate
    }
    return h(resolveComponent(field.type), controlProps)
  }

  /**
   * 渲染数字组件
   * @param {Object} field 字段配置信息
   * @returns 组件VNode
   */
  function renderInputNumber (field) {
    // 查看模式，直接渲染文本
    if (isView) {
      return h('span', [value ?? '-', field.props?.addonAfter])
    }
    const controlTypeEnum = EControlType._objectOf(field.type)
    const props = Object.assign(
      {
        placeholder: field.props?.placeholder ?? t('crud.pleaseEnter', { text: field.label })
      },
      controlTypeEnum.data.defaultProps ?? {},
      field.props
    )
    const controlProps = {
      ...props,
      value,
      onChange: undefined,
      'onUpdate:value': emitUpdate
    }
    return h(resolveComponent(field.type), controlProps)
  }

  /**
   * 渲染数字范围组件
   * @param {Object} field 字段配置信息
   * @returns 组件VNode
   */
  function renderInputNumberRange (field) {
    // 查看模式，直接渲染文本
    if (isView) {
      return h('span', [value?.[0] ?? '-', field.props?.addonAfters?.[0], '~', value?.[1] ?? '-', field.props?.addonAfters?.[1]])
    }
    const controlTypeEnum = EControlType._objectOf(field.type)
    const props = Object.assign(
      {
        placeholders: field.props?.placeholders ?? [`${field.label}${t('crud.start')}`, `${field.label}${t('crud.end')}`]
      },
      controlTypeEnum.data.defaultProps ?? {},
      field.props
    )
    let values = [value?.[0], value?.[1]]
    function updateValue (val, index) {
      if (isEmpty(values)) {
        values = []
      }
      values[index] = val
      if (isEmpty(values[0]) && isEmpty(values[1])) {
        values = undefined
      }
      emitUpdate(values)
    }
    const props1 = {
      onChange: undefined,
      value: values[0],
      'onUpdate:value': val => updateValue(val, 0)
    }
    const props2 = {
      onChange: undefined,
      value: values[1],
      'onUpdate:value': val => updateValue(val, 1)
    }
    for (const [key, value] of Object.entries(props)) {
      const prop = key.substring(0, key.length - 1)
      if (Array.isArray(value)) {
        props1[prop] = value[0]
        props2[prop] = value[1]
      }
    }
    return h(resolveComponent('a-form-item-rest'), null, {
      default: () => h(resolveComponent('a-input-group'), { compact: true, style: 'white-space:nowrap;display:flex;' }, {
        default: () => [
          h(resolveComponent('a-input-number'), { ...props1, style: 'flex: 45;' }),
          h(resolveComponent('a-input'), { disabled: true, placeholder: '~', style: 'width:30px;pointer-events:none;' }),
          h(resolveComponent('a-input-number'), { ...props2, style: 'flex: 45' })
        ]
      })
    })
  }

  /**
   * 渲染文本域组件
   * @param {Object} field 字段配置信息
   * @returns 组件VNode
   */
  function renderTextarea (field) {
    // 查看模式，直接渲染文本
    if (isView) {
      return h('span', [value ?? '-'])
    }
    const controlTypeEnum = EControlType._objectOf(field.type)
    const props = Object.assign(
      {
        placeholder: field.props?.placeholder ?? t('crud.pleaseEnter', { text: field.label }),
      },
      controlTypeEnum.data.defaultProps ?? {},
      field.props
    )
    const controlProps = {
      ...props,
      value,
      onChange: undefined,
      'onUpdate:value': emitUpdate
    }
    return h(resolveComponent(field.type), controlProps)
  }

  /**
   * 渲染单选按钮组件
   * @param {Object} field 字段配置信息
   * @returns 组件VNode
   */
  function renderRadio (field) {
    const controlTypeEnum = EControlType._objectOf(field.type)
    const props = Object.assign({}, controlTypeEnum.data.defaultProps ?? {}, field.props)
    const options = transformOptions(props.options ?? dataSource)
    // 查看模式，直接渲染文本
    if (isView) {
      return h('span', [options?.find(item => item.value === value)?.label ?? '-'])
    }
    const controlProps = {
      ...props,
      options,
      value,
      onChange: undefined,
      'onUpdate:value': (val) => {
        const option = options?.find(item => item.id === val)
        if (import.meta.env.VITE_APP_DEBUG_MODE === 'true') {
          console.log('selected: ', val, option)
        }
        emitUpdate(val, option)
      }
    }
    return h(resolveComponent(field.type), controlProps)
  }

  /**
   * 渲染多选按钮组件
   * @param {Object} field 字段配置信息
   * @returns 组件VNode
   */
  function renderCheckbox (field) {
    const controlTypeEnum = EControlType._objectOf(field.type)
    const props = Object.assign({}, controlTypeEnum.data.defaultProps ?? {}, field.props)
    const options = transformOptions(props.options ?? dataSource)
    // 查看模式，直接渲染文本
    if (isView) {
      const newVal = typeof value === 'string' ? value.split(',') : value
      const selectedValues = Array.isArray(newVal) ? newVal : [newVal]
      return h('span', [options.filter(item => selectedValues.includes(item.value))?.map(item => item.name)?.join(',') ?? value ?? '-'])
    }
    const controlProps = {
      ...props,
      options,
      value,
      onChange: undefined,
      'onUpdate:value': (val) => {
        const option = options?.find(item => item.id === val)
        if (import.meta.env.VITE_APP_DEBUG_MODE === 'true') {
          console.log('selected: ', val, option)
        }
        emitUpdate(val, option)
      }
    }
    return h(resolveComponent(field.type), controlProps)
  }

  /**
   * 渲染下拉组件
   * @param {Object} field 字段配置信息
   * @returns 组件VNode
   */
  function renderSelect (field) {
    const controlTypeEnum = EControlType._objectOf(field.type)
    const props = Object.assign(
      {
        placeholder: field.props?.placeholder ?? t('crud.pleaseSelect', { text: field.label })
      },
      controlTypeEnum.data.defaultProps ?? {},
      field.props
    )
    const options = transformOptions(props.options ?? dataSource, props.useAll)
    // 查看模式，直接渲染文本
    if (isView) {
      const newVal = typeof value === 'string' ? value.split(',') : value
      const selectedValues = Array.isArray(newVal) ? newVal : [newVal]
      return h('span', [options?.filter(item => selectedValues.includes(item.value))?.map(item => item.label)?.join(',') ?? value ?? '-'])
    }
    const controlProps = {
      ...props,
      value,
      options,
      onChange: undefined,
      style: { flex: 'auto' },
      'onUpdate:value': (val) => {
        const option = options?.find(item => item.id === val)
        if (import.meta.env.VITE_APP_DEBUG_MODE === 'true') {
          console.log('selected: ', val, option)
        }
        emitUpdate(val, option)
      }
    }
    return h(resolveComponent(field.type), controlProps)
  }

  /**
   * 渲染日期组件
   * @param {Object} field 字段配置信息
   * @returns 组件VNode
   */
  function renderDate (field) {
    // 查看模式，直接渲染文本
    if (isView) {
      let val = formatToDateStr(value, field.props?.showTime)
      return h('span', [val])
    }
    const controlTypeEnum = EControlType._objectOf(field.type)
    const props = Object.assign(
      {
        placeholder: field.props?.placeholder ?? t('crud.pleaseSelect', { text: field.label }),
        style: { width: '100%' }
      },
      controlTypeEnum.data.defaultProps ?? {},
      field.props
    )
    const controlProps = {
      ...props,
      value: value ? dayjs(value) : value,
      onChange: undefined,
      'onUpdate:value': emitUpdate
    }
    return h(resolveComponent(field.type), controlProps)
  }

  /**
   * 渲染日期范围组件
   * @param {Object} field 字段配置信息
   * @returns 组件VNode
   */
  function renderDateRange (field) {
    let start = value && value[0]
    let end = value && value[1]
    // 查看模式，直接渲染文本
    if (isView) {
      if (start && end) {
        start = formatToDateStr(start, field.props?.showTime)
        end = formatToDateStr(end, field.props?.showTime)
        return h('span', [start + ' ~ ' + end])
      }
      return h('span', '-')
    }
    if (start && end) {
      let bol = false
      if (!dayjs.isDayjs(start)) {
        start = dayjs(start)
        bol = true
      }
      if (!dayjs.isDayjs(end)) {
        end = dayjs(end)
        bol = true
      }
      if (bol) {
        emitUpdate([start, end])
        return ''
      }
    }
    const controlTypeEnum = EControlType._objectOf(field.type)
    const props = Object.assign(
      {
        placeholder: field.props?.placeholder ?? [`${t('crud.pleaseSelectStart', { text: field.label })}`, `${t('crud.pleaseSelectEnd', { text: field.label })}`],
        style: { width: '100%' }
      },
      controlTypeEnum.data.defaultProps ?? {},
      field.props
    )
    const controlProps = {
      ...props,
      value,
      onChange: undefined,
      'onUpdate:value': emitUpdate
    }
    return h(resolveComponent(field.type), controlProps)
  }

  /**
   * 渲染开关组件
   * @param {Object} field 字段配置信息
   * @returns 组件VNode
   */
  function renderSwitch (field) {
    // 查看模式，直接渲染文本
    if (isView) {
      return h('span', [!!value ? t('crud.yes') : t('crud.no')])
    }
    const controlTypeEnum = EControlType._objectOf(field.type)
    const props = Object.assign(
      {},
      controlTypeEnum.data.defaultProps ?? {},
      field.props
    )
    const controlProps = {
      ...props,
      checked: value,
      onChange: undefined,
      'onUpdate:checked': emitUpdate
    }
    return h(resolveComponent(field.type), controlProps)
  }

  function renderEditor (field) {
    // 查看模式，直接渲染文本
    if (isView) {
      return h('div', { class: 'pa5', innerHTML: value })
    }
    const controlTypeEnum = EControlType._objectOf(field.type)
    const props = Object.assign(
      {},
      controlTypeEnum.data.defaultProps ?? {},
      field.props
    )
    const controlProps = {
      ...props,
      value,
      onChange: undefined,
      'onUpdate:value': emitUpdate
    }
    return h(resolveComponent(field.type), controlProps)
  }

  function renderTreeSelect (field) {
    const treeData = field.props?.treeData ?? dataSource
    const valueField = field.props?.fieldNames?.value ?? 'id'
    const labelField = field.props?.fieldNames?.label ?? 'name'
    const childrenField = field.props?.fieldNames?.children ?? 'children'
    // 查看模式，直接渲染文本
    if (isView) {
      const values = typeof value === 'string' ? value.split(',') : value
      const selectedValueArr = Array.isArray(values) ? values : (isNotEmpty(values) ? [values] : [])
      let text = []
      if (isNotEmpty(selectedValueArr) && isNotEmpty(treeData)) {
        const findText = (list) => {
          list.forEach(item => {
            if (selectedValueArr.includes(item[valueField])) {
              text.push(item[labelField])
            }
            if (isNotEmpty(item[childrenField])) {
              findText(item[childrenField])
            }
          })
        }
        findText(treeData)
      }
      return h('span', text.join(','))
    }
    const controlTypeEnum = EControlType._objectOf(field.type)
    const props = Object.assign(
      {
        placeholder: field.props?.placeholder ?? t('crud.pleaseSelect', { text: field.label })
      },
      controlTypeEnum.data.defaultProps ?? {},
      field.props
    )
    const controlProps = {
      ...props,
      value,
      treeData,
      fieldNames: {
        value: valueField,
        label: labelField,
        children: childrenField
      },
      onChange: undefined,
      'onUpdate:value': emitUpdate
    }
    return h(resolveComponent(field.type), controlProps)
  }

  /**
   * 渲染自定义组件
   * @param {Object} field 字段配置信息
   * @returns 组件VNode
   */
  function renderCustom (field) {
    const props = field.props
    const controlProps = {
      ...props,
      value,
      onChange: undefined,
      'onUpdate:value': emitUpdate,
      disabled: props.disabled ?? isView,
      component: undefined
    }
    // 自定义 model props，实现数据双向绑定(默认通过 value 驱动，但个别特殊组件没有 value，需要自定义)
    if (props.modelProps) {
      controlProps[props.modelProps] = value
    }
    // 自定义 model 事件，实现数据双向绑定(默认通过 onChange 驱动，但个别特殊组件没有 onChange，需要自定义)
    if (props.modelEvent) {
      controlProps[props.modelEvent] = emitUpdate // onChange
    }
    // 自定义数据源字段
    controlProps[props.modelData ?? 'dataSource'] = dataSource
    // 需要有数据源才渲染，解决 ant-design-vue 4 异步数据源导致部分属性失效问题
    if (props.renderNeedDataSource) {
      if (isEmpty(dataSource)) {
        return
      }
    }
    let component = props.component
    if (typeof component === 'function') {
      component = component(formData)
    } else if (typeof component === 'string') {
      component = resolveComponent(component)
    }
    return h(component, controlProps)
  }

  /** 将本系统风格的 options 转成 ant-design 风格的 options，适用于 a-radio, a-select, a-checkbox, a-auto-complete 等 */
  function transformOptions (options, useAll = false) {
    const result = options?.map(item => {
      let label = item.name ?? item.label
      if (te(label)) {
        label = t(label) // 国际化转换
      }
      return { ...item, value: item.id ?? item.value, label }
    })
    if (useAll && result) {
      result.unshift({ value: null, label: t('crud.all') })
    }
    return result
  }

  /** 格式化日期 */
  function formatToDateStr (val, showTime = false) {
    let result = val
    const format = showTime ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD'
    if (/\d{13}/.test(String(val))) { // 时间戳 转 年月日
      result = dayjs(Number(val)).format(format)
    } else if (val && typeof val === 'object' && val.$isDayjsObject) { // dayjs 转 年月日
      result = val.format(format)
    } else if (typeof val === 'string' && !showTime) { // 年月日时分秒 转 年月日
      return dayjs(val).format(format)
    }
    return result ?? '-'
  }

  return {
    renderByField
  }
}