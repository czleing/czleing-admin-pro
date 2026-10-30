/**
 * 组件渲染
 * 根据字段配置渲染对应控件，可通过自定义渲染函数覆盖全局组件的渲染
 * 到这里，组件的所有 props 都已经解析为静态属性，不存在函数式动态属性
 */
import { EControlType } from '@/enum/index'
import { isNotEmpty, isEmpty } from '@/utils/index'
import type { IsEmptyValue } from '@/utils/index'
import dayjs from 'dayjs'
import { h, resolveComponent } from 'vue'
import type { Component, VNodeChild } from 'vue'
import type {
  CrudComponentField,
  CrudControlProps,
  CrudFormData,
  CrudOption,
  CrudRecord,
  OptionItem
} from '../types'

/** 渲染函数 */
type FieldRenderFn = (field: CrudComponentField) => VNodeChild

/** useRender 入参 */
export interface UseRenderOptions {
  /** 组件实例，用于触发 update:value 事件 */
  ctx: { $emit: (event: string, ...args: unknown[]) => void }
  /** 是否查看模式 */
  isView: boolean
  /** 当前值 */
  value: unknown
  /** 数据源 */
  dataSource: OptionItem[]
}

/**
 * 渲染组件
 * @param options 渲染上下文
 * @returns renderByField 根据字段配置生成控件 VNode
 */
export function useRender({ ctx, isView, value, dataSource }: UseRenderOptions) {
  const formData = inject<CrudFormData>('c-form.formData', {})
  const { t, te } = useI18n()

  const emitUpdate = (...args: unknown[]): void => {
    // 统一使用 value 作为双向绑定的 props（为了与 ant-design 一致）
    ctx.$emit('update:value', ...args)
  }

  /** 将未知值渲染为文本子节点 */
  function toChild(val: unknown): VNodeChild {
    return (val ?? '-') as VNodeChild
  }

  /** 获取配置控件默认属性 */
  function getDefaultProps(field: CrudComponentField): Record<string, unknown> {
    return (EControlType._objectOf(field.type ?? '')?.data?.defaultProps ?? {}) as Record<string, unknown>
  }

  /** 解析控件对应的组件 */
  function resolveByType(field: CrudComponentField) {
    return resolveComponent(field.type ?? '')
  }

  /** 将本系统风格的 options 转成 ant-design 风格的 options，适用于 a-radio、a-select、a-checkbox、a-auto-complete 等 */
  function transformOptions(options?: OptionItem[], useAll = false): CrudOption[] | undefined {
    const result = options?.map((item) => {
      let label = item.name ?? item.label
      if (typeof label === 'string' && te(label)) {
        label = t(label) // 国际化转换
      }
      return { ...item, value: item.id ?? item.value ?? null, label: label ?? '' }
    })
    if (useAll && result) {
      result.unshift({ value: null, label: t('crud.all') })
    }
    return result
  }

  /** 格式化日期 */
  function formatToDateStr(val: unknown, showTime = false): string {
    const format = showTime ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD'
    if (val === undefined || val === null || val === '') return '-'
    if (/\d{13}/.test(String(val))) {
      // 时间戳转年月日
      return dayjs(Number(val)).format(format)
    }
    if (dayjs.isDayjs(val)) {
      // dayjs 转年月日
      return val.format(format)
    }
    if (typeof val === 'string' && !showTime) {
      // 年月日时分秒转年月日
      return dayjs(val).format(format)
    }
    return String(val)
  }

  /** 获取范围值的起止项 */
  function getRangeValue(): [unknown, unknown] {
    return Array.isArray(value) ? [value[0], value[1]] : [undefined, undefined]
  }

  /** 自定义渲染函数集合 */
  const getRenderFn: Record<string, FieldRenderFn> = {
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

  /** 通过字段配置生成控件 */
  function renderByField(field: CrudComponentField): VNodeChild {
    field.type = field.type ?? EControlType.eInput
    const fn = getRenderFn[field.type]
    if (fn) {
      // 1.有自定义渲染函数的，用自定义渲染函数渲染
      return fn(field)
    }
    // 2.没有自定义的，尝试当全局组件渲染
    // 上面所有的 ant-design 组件都可以走这里，只是查看模式时不会渲染成文本，而是渲染成禁用的组件
    return h(resolveByType(field), {
      ...getDefaultProps(field),
      ...field.props,
      value,
      isView,
      onChange: undefined,
      disabled: field.props.disabled ?? isView,
      'onUpdate:value': emitUpdate
    })
  }

  /** 渲染输入框 */
  function renderInput(field: CrudComponentField): VNodeChild {
    if (isView) {
      return h('span', [toChild(value)])
    }
    const props: CrudControlProps = Object.assign(
      {
        type: 'text',
        placeholder: field.props.placeholder ?? t('crud.pleaseEnter', { text: field.label }),
        maxlength: 50
      },
      getDefaultProps(field),
      field.props
    )
    const controlProps: Record<string, unknown> = {
      ...props,
      value,
      onChange: undefined,
      'onUpdate:value': emitUpdate
    }
    const type = field.props.type === 'password' ? 'a-input-password' : (field.type ?? '')
    return h(resolveComponent(type), controlProps)
  }

  /** 渲染隐藏域 */
  function renderHidden(field: CrudComponentField): VNodeChild {
    if (isView) {
      return h('span', { style: 'display: none;' }, [toChild(value)])
    }
    const props: CrudControlProps = Object.assign(
      { type: 'text' },
      getDefaultProps(field),
      field.props
    )
    const controlProps: Record<string, unknown> = {
      ...props,
      value,
      onChange: undefined,
      'onUpdate:value': emitUpdate
    }
    return h(resolveComponent('a-input'), controlProps)
  }

  /** 渲染自动补全输入框 */
  function renderAutoComplete(field: CrudComponentField): VNodeChild {
    if (isView) {
      return h('span', [toChild(value)])
    }
    const props: CrudControlProps = Object.assign(
      { placeholder: field.props.placeholder ?? t('crud.pleaseEnterOrSelect', { text: field.label }) },
      getDefaultProps(field),
      field.props
    )
    const options = transformOptions(props.options ?? dataSource)
    const controlProps: Record<string, unknown> = {
      ...props,
      value,
      options,
      onChange: undefined,
      'onUpdate:value': emitUpdate
    }
    return h(resolveByType(field), controlProps)
  }

  /** 渲染数字组件 */
  function renderInputNumber(field: CrudComponentField): VNodeChild {
    if (isView) {
      return h('span', [toChild(value), field.props.addonAfter])
    }
    const props: CrudControlProps = Object.assign(
      { placeholder: field.props.placeholder ?? t('crud.pleaseEnter', { text: field.label }) },
      getDefaultProps(field),
      field.props
    )
    const controlProps: Record<string, unknown> = {
      ...props,
      value,
      onChange: undefined,
      'onUpdate:value': emitUpdate
    }
    return h(resolveByType(field), controlProps)
  }

  /** 渲染数字范围组件 */
  function renderInputNumberRange(field: CrudComponentField): VNodeChild {
    const [startValue, endValue] = getRangeValue()
    const addonAfters = field.props.addonAfters
    if (isView) {
      return h('span', [
        toChild(startValue),
        addonAfters?.[0],
        '~',
        toChild(endValue),
        addonAfters?.[1]
      ])
    }
    const placeholders = field.props.placeholders
    const props: CrudControlProps = Object.assign(
      {
        placeholders: placeholders ?? [
          `${field.label}${t('crud.start')}`,
          `${field.label}${t('crud.end')}`
        ]
      },
      getDefaultProps(field),
      field.props
    )
    let values: unknown[] | undefined = [startValue, endValue]
    function updateValue(val: unknown, index: number): void {
      if (!values) {
        values = []
      }
      values[index] = val
      if (isEmpty(values[0] as IsEmptyValue) && isEmpty(values[1] as IsEmptyValue)) {
        values = undefined
      }
      emitUpdate(values)
    }
    const props1: Record<string, unknown> = {
      onChange: undefined,
      value: values?.[0],
      'onUpdate:value': (val: unknown) => updateValue(val, 0)
    }
    const props2: Record<string, unknown> = {
      onChange: undefined,
      value: values?.[1],
      'onUpdate:value': (val: unknown) => updateValue(val, 1)
    }
    for (const [key, propValue] of Object.entries(props)) {
      const prop = key.substring(0, key.length - 1)
      if (Array.isArray(propValue)) {
        props1[prop] = propValue[0]
        props2[prop] = propValue[1]
      }
    }
    return h(resolveComponent('a-form-item-rest'), null, {
      default: () =>
        h(
          resolveComponent('a-input-group'),
          { compact: true, style: 'white-space:nowrap;display:flex;' },
          {
            default: () => [
              h(resolveComponent('a-input-number'), { ...props1, style: 'flex: 45;' }),
              h(resolveComponent('a-input'), {
                disabled: true,
                placeholder: '~',
                style: 'width:30px;pointer-events:none;'
              }),
              h(resolveComponent('a-input-number'), { ...props2, style: 'flex: 45' })
            ]
          }
        )
    })
  }

  /** 渲染文本域组件 */
  function renderTextarea(field: CrudComponentField): VNodeChild {
    if (isView) {
      return h('span', [toChild(value)])
    }
    const props: CrudControlProps = Object.assign(
      { placeholder: field.props.placeholder ?? t('crud.pleaseEnter', { text: field.label }) },
      getDefaultProps(field),
      field.props
    )
    const controlProps: Record<string, unknown> = {
      ...props,
      value,
      onChange: undefined,
      'onUpdate:value': emitUpdate
    }
    return h(resolveByType(field), controlProps)
  }

  /** 渲染单选按钮组件 */
  function renderRadio(field: CrudComponentField): VNodeChild {
    const props: CrudControlProps = Object.assign({}, getDefaultProps(field), field.props)
    const options = transformOptions(props.options ?? dataSource)
    if (isView) {
      return h('span', [toChild(options?.find((item) => item.value === value)?.label)])
    }
    const controlProps: Record<string, unknown> = {
      ...props,
      options,
      value,
      onChange: undefined,
      'onUpdate:value': (val: unknown) => {
        const option = options?.find((item) => item.id === val)
        if (import.meta.env.VITE_APP_DEBUG_MODE === 'true') {
          console.log('selected: ', val, option)
        }
        emitUpdate(val, option)
      }
    }
    return h(resolveByType(field), controlProps)
  }

  /** 渲染多选按钮组件 */
  function renderCheckbox(field: CrudComponentField): VNodeChild {
    const props: CrudControlProps = Object.assign({}, getDefaultProps(field), field.props)
    const options = transformOptions(props.options ?? dataSource)
    if (isView) {
      const newVal = typeof value === 'string' ? value.split(',') : value
      const selectedValues = Array.isArray(newVal) ? newVal : [newVal]
      return h('span', [
        options
          ?.filter((item) => selectedValues.includes(item.value))
          .map((item) => item.name)
          .join(',') ?? toChild(value)
      ])
    }
    const controlProps: Record<string, unknown> = {
      ...props,
      options,
      value,
      onChange: undefined,
      'onUpdate:value': (val: unknown) => {
        const option = options?.find((item) => item.id === val)
        if (import.meta.env.VITE_APP_DEBUG_MODE === 'true') {
          console.log('selected: ', val, option)
        }
        emitUpdate(val, option)
      }
    }
    return h(resolveByType(field), controlProps)
  }

  /** 渲染下拉组件 */
  function renderSelect(field: CrudComponentField): VNodeChild {
    const props: CrudControlProps = Object.assign(
      { placeholder: field.props.placeholder ?? t('crud.pleaseSelect', { text: field.label }) },
      getDefaultProps(field),
      field.props
    )
    const options = transformOptions(props.options ?? dataSource, props.useAll)
    if (isView) {
      const newVal = typeof value === 'string' ? value.split(',') : value
      const selectedValues = Array.isArray(newVal) ? newVal : [newVal]
      return h('span', [
        options
          ?.filter((item) => selectedValues.includes(item.value))
          .map((item) => item.label)
          .join(',') ?? toChild(value)
      ])
    }
    const controlProps: Record<string, unknown> = {
      ...props,
      value,
      options,
      onChange: undefined,
      style: { flex: 'auto' },
      'onUpdate:value': (val: unknown) => {
        const option = options?.find((item) => item.id === val)
        if (import.meta.env.VITE_APP_DEBUG_MODE === 'true') {
          console.log('selected: ', val, option)
        }
        emitUpdate(val, option)
      }
    }
    return h(resolveByType(field), controlProps)
  }

  /** 渲染日期组件 */
  function renderDate(field: CrudComponentField): VNodeChild {
    if (isView) {
      return h('span', [formatToDateStr(value, field.props.showTime)])
    }
    const props: CrudControlProps = Object.assign(
      {
        placeholder: field.props.placeholder ?? t('crud.pleaseSelect', { text: field.label }),
        style: { width: '100%' }
      },
      getDefaultProps(field),
      field.props
    )
    const controlProps: Record<string, unknown> = {
      ...props,
      value: value ? dayjs(value as string | number) : value,
      onChange: undefined,
      'onUpdate:value': emitUpdate
    }
    return h(resolveByType(field), controlProps)
  }

  /** 渲染日期范围组件 */
  function renderDateRange(field: CrudComponentField): VNodeChild {
    let [start, end] = getRangeValue()
    if (isView) {
      if (start && end) {
        return h('span', [
          `${formatToDateStr(start, field.props.showTime)} ~ ${formatToDateStr(end, field.props.showTime)}`
        ])
      }
      return h('span', '-')
    }
    if (start && end) {
      let bol = false
      if (!dayjs.isDayjs(start)) {
        start = dayjs(start as string | number)
        bol = true
      }
      if (!dayjs.isDayjs(end)) {
        end = dayjs(end as string | number)
        bol = true
      }
      if (bol) {
        emitUpdate([start, end])
        return ''
      }
    }
    const placeholder =
      field.props.placeholder ??
      [`${t('crud.pleaseSelectStart', { text: field.label })}`, `${t('crud.pleaseSelectEnd', { text: field.label })}`]
    const props: CrudControlProps = Object.assign(
      { placeholder, style: { width: '100%' } },
      getDefaultProps(field),
      field.props
    )
    const controlProps: Record<string, unknown> = {
      ...props,
      value,
      onChange: undefined,
      'onUpdate:value': emitUpdate
    }
    return h(resolveByType(field), controlProps)
  }

  /** 渲染开关组件 */
  function renderSwitch(field: CrudComponentField): VNodeChild {
    if (isView) {
      return h('span', [value ? t('crud.yes') : t('crud.no')])
    }
    const props: CrudControlProps = Object.assign({}, getDefaultProps(field), field.props)
    const controlProps: Record<string, unknown> = {
      ...props,
      checked: value,
      onChange: undefined,
      'onUpdate:checked': emitUpdate
    }
    return h(resolveByType(field), controlProps)
  }

  /** 渲染富文本组件 */
  function renderEditor(field: CrudComponentField): VNodeChild {
    if (isView) {
      return h('div', { class: 'pa5', innerHTML: value as string })
    }
    const props: CrudControlProps = Object.assign({}, getDefaultProps(field), field.props)
    const controlProps: Record<string, unknown> = {
      ...props,
      value,
      onChange: undefined,
      'onUpdate:value': emitUpdate
    }
    return h(resolveByType(field), controlProps)
  }

  /** 渲染树形选择组件 */
  function renderTreeSelect(field: CrudComponentField): VNodeChild {
    const treeData = field.props.treeData ?? dataSource
    const fieldNames = Array.isArray(field.props.fieldNames) ? {} : (field.props.fieldNames ?? {})
    const valueField = fieldNames?.value ?? 'id'
    const labelField = fieldNames?.label ?? 'name'
    const childrenField = fieldNames?.children ?? 'children'
    if (isView) {
      const values = typeof value === 'string' ? value.split(',') : value
      const selectedValueArr = Array.isArray(values)
        ? values
        : isNotEmpty(values as IsEmptyValue)
          ? [values]
          : []
      const text: unknown[] = []
      if (isNotEmpty(selectedValueArr) && isNotEmpty(treeData)) {
        const findText = (list: CrudRecord[]): void => {
          list.forEach((item) => {
            if (selectedValueArr.includes(item[valueField])) {
              text.push(item[labelField])
            }
            const children = item[childrenField]
            if (isNotEmpty(children as IsEmptyValue) && Array.isArray(children)) {
              findText(children as CrudRecord[])
            }
          })
        }
        findText(treeData)
      }
      return h('span', text.join(','))
    }
    const props: CrudControlProps = Object.assign(
      { placeholder: field.props.placeholder ?? t('crud.pleaseSelect', { text: field.label }) },
      getDefaultProps(field),
      field.props
    )
    const controlProps: Record<string, unknown> = {
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
    return h(resolveByType(field), controlProps)
  }

  /** 渲染自定义组件 */
  function renderCustom(field: CrudComponentField): VNodeChild {
    const props = field.props
    const controlProps: Record<string, unknown> = {
      ...props,
      value,
      onChange: undefined,
      'onUpdate:value': emitUpdate,
      disabled: props.disabled ?? isView,
      component: undefined
    }
    // 自定义 model props，实现数据双向绑定（默认通过 value 驱动，但个别特殊组件没有 value，需要自定义）
    if (props.modelProps) {
      controlProps[props.modelProps] = value
    }
    // 自定义 model 事件，实现数据双向绑定（默认通过 onChange 驱动，但个别特殊组件没有 onChange，需要自定义）
    if (props.modelEvent) {
      controlProps[props.modelEvent] = emitUpdate
    }
    // 自定义数据源字段
    controlProps[props.modelData ?? 'dataSource'] = dataSource
    // 需要有数据源才渲染，解决 ant-design-vue 4 异步数据源导致部分属性失效问题
    if (props.renderNeedDataSource && isEmpty(dataSource)) {
      return
    }
    let component = props.component
    if (typeof component === 'function') {
      component = (component as (formData: CrudFormData) => Component | string)(formData)
    } else if (typeof component === 'string') {
      component = resolveComponent(component)
    }
    return h(component as Component, controlProps)
  }

  return {
    renderByField
  }
}
