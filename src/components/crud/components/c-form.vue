<!-- 表单组件 -->
<template>
  <div class="c-form" :class="{ 'is-view': isView }">
    <a-form
      name="inputForm"
      ref="inputForm"
      :layout="layout"
      :model="formData"
      :label-col="isHorizontal ? labelCol : undefined"
      :wrapper-col="isHorizontal ? wrapperCol : undefined"
      autocomplete="off"
    >
      <a-row :gutter="15">
        <template v-for="field in currFields" :key="field.fieldName || field.title">
          <template v-if="isGroup(field) && !field.none">
            <!-- 控件组 -->
            <a-col span="24" v-show="!field.hidden">
              <FieldGroup :title="field.title" :subTitle="field.subTitle">
                <a-row :gutter="15">
                  <template v-for="child in field.fields ?? []" :key="child.fieldName">
                    <a-col v-if="!child.none" v-show="!child.hidden" v-bind="child.col">
                      <a-form-item v-bind="formItemProps(child)">
                        <CComponent v-model:value="formData[child.fieldName]" :field="staticField(child)" :is-view="isView" @update:value="onFieldValueChange(field, $event)" />
                      </a-form-item>
                    </a-col>
                  </template>
                </a-row>
              </FieldGroup>
            </a-col>
          </template>
          <template v-else-if="!field.none">
            <!-- 控件 -->
            <a-col v-bind="field.col" v-show="!field.hidden">
              <a-form-item v-bind="formItemProps(field)">
                <CComponent v-model:value="formData[field.fieldName]" :field="staticField(field)" :is-view="isView" @update:value="onFieldValueChange(field, $event)" />
              </a-form-item>
            </a-col>
          </template>
        </template>
      </a-row>
    </a-form>
    <!-- 提交按钮，单独使用表单组件时使用 -->
    <div v-if="$attrs.footer !== null && !isView && (showConfirm || showCancel)" class="mt20" :class="alignClass">
      <a-button v-if="showCancel" type="default" :disabled="loading" @click="cancel">{{ cancelText || $t('crud.cancel') }}</a-button>
      <a-button v-if="showConfirm" type="primary" :loading="loading" @click="submit">{{ confirmText || $t('crud.submit') }}</a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import CComponent from './c-component'
import dayjs from 'dayjs'
import type { ConfigType, Dayjs } from 'dayjs'
import type { FormInstance } from 'ant-design-vue'
import { getFnValue, loadingRequest } from '@/utils/index'
import type { IsEmptyValue } from '@/utils'
import { EControlType } from '@/enum'
import type {
  CrudBeforeSubmit,
  CrudComponentField,
  CrudControlProps,
  CrudFormData,
  CrudFormExpose,
  CrudFormField,
  CrudFormItemProps,
  CrudRecord,
  CrudSubmitHandle,
  DynamicTableColumn,
  DynamicTableFormField,
  FormConfig,
  FormFieldGroup,
  FormRule,
  FormRemotes,
  MaybeFn,
  NormalizedFormField
} from '../types'

const props = withDefaults(
  defineProps<{
    isAdd?: boolean
    isEdit?: boolean
    isView?: boolean
    /** 主键字段名 */
    primaryKey?: string
    /** 修改、查看详情时的详情数据 */
    detail?: CrudRecord
    /**
     * 表单配置
     * layout: 表单布局，默认 horizontal
     * cols: 一行显示几列，默认 2
     * labelCol: 文本部分栅格，默认 { flex: '0 0 100px' }
     * wrapperCol: 控件部分栅格，默认撑满剩余空间
     * autoReset: 提交后自动清空，默认 true
     * autoClose: 提交后自动关闭弹窗，默认 true
     * removeNoneFields: 提交时过滤 none 字段，默认 true
     * fields: 表单字段数组，可分组
     */
    formConfig: FormConfig
    /** 提交表单前，对数据进行手工处理 */
    beforeSubmit?: CrudBeforeSubmit
    /** 校验通过之后，对提交的数据进行处理，如请求接口、提示、刷新列表 */
    onSubmitHandle?: CrudSubmitHandle
    /** 是否显示确认按钮 */
    showConfirm?: boolean
    confirmText?: string
    /** 提交后是否继续，true 不关闭弹窗，函数可做继续时的初始化 */
    confirmContinue?: boolean | ((formData: CrudFormData, submitData: CrudRecord) => void | Promise<void>)
    /** 是否显示取消按钮 */
    showCancel?: boolean
    cancelText?: string
    /** 按钮对齐方式 */
    confirmAlign?: 'left' | 'center' | 'right'
  }>(),
  {
    primaryKey: 'id',
    detail: () => ({}),
    showConfirm: true,
    confirmContinue: false,
    showCancel: true,
    confirmAlign: 'right'
  }
)

/** 非分组字段 */
type CrudLeafField = Exclude<CrudFormField, FormFieldGroup>

const { t } = useI18n()
const inputForm = ref<FormInstance>()
const closeModal = inject<(() => Promise<void>) | undefined>('modal.close', undefined)
const formData = reactive<CrudFormData>({})
const formRemotes = reactive<Record<string, () => Promise<unknown>>>({}) // 收集组件的 remote 方法，用于需要重新刷新 remote 数据时使用
const loading = ref(false)
const { layout = 'horizontal', labelCol = { flex: '0 0 100px' }, wrapperCol, cols = 2 } = props.formConfig // 已经解构失去响应式
const isHorizontal = layout === 'horizontal'
const colSpan = Math.floor(24 / cols)
let dateFields: string[] = [] // 收集的日期字段数组，便于统一转换格式
let dateRangeFields: string[] = [] // 收集的日期范围字段数组
let rangeFieldNamesMap: Record<string, string[]> = {} // 日期范围，一般有两个值，其字段名用 map 暂存

/** 解析配置中的动态值（值或函数） */
function resolveMaybe<T>(value: MaybeFn<T, [CrudFormData]> | undefined): T | undefined {
  return value === undefined ? undefined : getFnValue(value, formData)
}

/** 是否是非分组字段 */
function isLeafField(field: CrudFormField): field is CrudLeafField {
  return !(field as FormFieldGroup).fields
}

/** 是否是字段分组（已解析后的字段使用 isGroup） */
function isGroup(field: NormalizedFormField): boolean {
  return !!field.fields
}

/** 对字段配置信息做初步整理，同时收集日期字段、处理详情覆盖配置 */
const currFields = computed<NormalizedFormField[]>(() => {
  pushDateFields()
  pushDateRangeFields()
  return normalizeFields(props.formConfig.fields)
})

function normalizeFields(fields: CrudFormField[]): NormalizedFormField[] {
  return fields.map((field) => normalizeField(field))
}

/** 把配置字段解析为静态字段，动态属性在此统一解析 */
function normalizeField(field: CrudFormField): NormalizedFormField {
  // 字段组，递归处理
  if (!isLeafField(field)) {
    return {
      fieldName: '',
      title: resolveMaybe(field.title),
      subTitle: resolveMaybe(field.subTitle),
      hidden: resolveMaybe(field.hidden),
      none: resolveMaybe(field.none),
      props: {},
      fields: normalizeFields(field.fields)
    }
  }
  // 详情时，使用独有的 detailConfig 覆盖原有属性配置
  const merged = (props.isView && field.detailConfig
    ? Object.assign({}, field, field.detailConfig)
    : field) as CrudLeafField
  // 日期类型字段收集，便于统一数据转换
  if (merged.type === EControlType.eDate) {
    pushDateFields(merged.fieldName)
  } else if (merged.type === EControlType.eDateRange) {
    const rangeProps = resolveMaybe(merged.props)
    pushDateRangeFields(merged.fieldName, rangeProps?.fieldNames)
  } else if (merged.type === EControlType.eTable) {
    // 表格类型，根据 columns 自动生成 rules
    setTableRules(merged as DynamicTableFormField)
  }
  const rules = props.isView ? undefined : resolveMaybe(merged.rules)
  return {
    fieldName: merged.fieldName,
    type: merged.type,
    label: resolveMaybe(merged.label),
    col: merged.singleLine ? { span: 24 } : (merged.col ?? { span: colSpan }),
    labelCol: merged.labelCol,
    wrapperCol: merged.wrapperCol,
    singleLine: merged.singleLine,
    defaultValue: merged.defaultValue,
    rules: Array.isArray(rules) ? rules : rules ? [rules] : undefined,
    required: props.isView ? false : resolveMaybe(merged.required),
    disabled: props.isView ? false : resolveMaybe(merged.disabled),
    hidden: resolveMaybe(merged.hidden),
    none: resolveMaybe(merged.none),
    tooltip: resolveMaybe(merged.tooltip),
    extra: props.isView ? undefined : resolveMaybe(merged.extra),
    props: resolveFieldProps(merged)
  }
}

/** 解析字段的控件属性，把二级动态属性（如 placeholder）也解析为静态值 */
function resolveFieldProps(field: CrudLeafField): CrudControlProps {
  const rawProps = resolveMaybe(field.props)
  const cProps: CrudControlProps = { ...(rawProps as CrudControlProps | undefined) }
  const placeholder = getFnValue<string | string[] | undefined, [CrudFormData]>(
    cProps.placeholder as MaybeFn<string | string[] | undefined, [CrudFormData]>,
    formData
  )
  const disabled = resolveMaybe(field.disabled)
  if (disabled !== undefined) {
    cProps.disabled = disabled
  }
  if (placeholder !== undefined) {
    cProps.placeholder = placeholder
  }
  return cProps
}

const fieldNamesArr = computed<string[]>(() => {
  function getNamesArrByFields(fields: NormalizedFormField[]): string[] {
    return fields.reduce<string[]>((arr, field) => {
      if (field.fields) {
        arr.push(...getNamesArrByFields(field.fields))
      } else {
        arr.push(field.fieldName)
      }
      return arr
    }, [])
  }
  return getNamesArrByFields(currFields.value)
})
/** 收集默认值 */
const defaultObject = computed<Record<string, unknown>>(() => {
  const obj: Record<string, unknown> = {}
  function getDefaultValueByFields(fields: NormalizedFormField[]): void {
    fields.forEach((field) => {
      if (field.fields) {
        getDefaultValueByFields(field.fields)
      } else if (isNotEmpty(field.defaultValue as IsEmptyValue)) {
        obj[field.fieldName] = field.defaultValue
      }
    })
  }
  getDefaultValueByFields(currFields.value)
  return obj
})
const alignClass = computed(() => {
  return {
    left: 'tl',
    center: 'tc',
    right: 'tr'
  }[props.confirmAlign]
})

// 共享给子组件的变量
provide('c-form.formData', formData)
provide('c-form.formRemotes', formRemotes)

// 监听详情数据，同步回填至表单
watch(
  () => props.detail,
  (val) => {
    setFormData(val)
  },
  { deep: true, immediate: true }
)

// 设置表单值或默认值
onMounted(() => {
  setFormData()
})

/**
 * 给表单设置数据
 * @param data 要设置的数据对象，默认绑定的 detail 对象
 * @param includeFieldNames 要设置的字段数组，默认全部字段
 * @param excludeFieldNames 不要设置的字段数组，默认空数组
 */
function setFormData(
  data: CrudRecord = props.detail,
  includeFieldNames: string[] = fieldNamesArr.value,
  excludeFieldNames: string[] = []
): void {
  includeFieldNames.forEach((fieldName) => {
    if (!excludeFieldNames.includes(fieldName)) {
      // 回填时，对日期类型特殊处理
      if (dateFields.includes(fieldName)) {
        formData[fieldName] = data[fieldName]
          ? dayjs(data[fieldName] as ConfigType)
          : defaultObject.value[fieldName]
      } else if (dateRangeFields.includes(fieldName)) {
        const fieldNames = rangeFieldNamesMap[fieldName]
        if (Array.isArray(fieldNames) && fieldNames.length === 2) {
          if (data[fieldName]) {
            formData[fieldName] = data[fieldName] ?? defaultObject.value[fieldName]
          } else if (data[fieldNames[0]] && data[fieldNames[1]]) {
            formData[fieldName] = [dayjs(data[fieldNames[0]] as ConfigType), dayjs(data[fieldNames[1]] as ConfigType)]
          }
        } else {
          console.error(`字段[${fieldName}]设置的 fieldNames 不正确，跳过赋值`, fieldNames)
        }
      } else {
        formData[fieldName] = data[fieldName] ?? defaultObject.value[fieldName]
      }
    }
  })
  if (data[props.primaryKey]) {
    formData[props.primaryKey] = data[props.primaryKey]
  }
}

/** 通过字段配置，生成表单项的属性 */
function formItemProps(field: NormalizedFormField): CrudFormItemProps {
  return {
    labelCol: isHorizontal ? field.labelCol : undefined,
    wrapperCol: isHorizontal ? field.wrapperCol : undefined,
    name: field.fieldName,
    label: field.label,
    disabled: props.isView ? false : field.disabled,
    required: props.isView ? false : field.required,
    tooltip: field.tooltip,
    extra: props.isView ? undefined : field.extra,
    rules: props.isView ? undefined : field.rules
  }
}

/** 通过字段配置，生成组件属性 */
function staticField(field: NormalizedFormField): CrudComponentField {
  return {
    fieldName: field.fieldName,
    type: field.type,
    label: field.label,
    props: field.props
  }
}

/** 控件值变化时触发字段配置的 onChange */
function onFieldValueChange(field: NormalizedFormField, ...args: unknown[]): void {
  field.props.onChange?.(...args, formData)
}

/** 重置表单 */
function reset(): void {
  inputForm.value?.resetFields()
  Object.keys(formData).forEach((key) => (formData[key] = undefined))
  const resetDatas = (fields: NormalizedFormField[]): void => {
    fields.forEach((field) => {
      if (field.fields) {
        resetDatas(field.fields)
      } else {
        formData[field.fieldName] = field.defaultValue
      }
    })
  }
  formData[props.primaryKey] = undefined
  resetDatas(currFields.value)
}

/** 提交表单时，对日期数据统一转换 */
function transferDate(data: CrudRecord): void {
  for (const key in data) {
    const value = data[key]
    if (dateFields.includes(key) && dayjs.isDayjs(value)) {
      // 日期字段处理
      data[key] = value.valueOf()
    } else if (dateRangeFields.includes(key) && Array.isArray(value)) {
      // 日期范围字段处理
      const fieldNames = rangeFieldNamesMap[key]
      const range = value as Dayjs[]
      data[fieldNames[0]] = range[0].valueOf()
      data[fieldNames[1]] = range[1].valueOf()
      delete data[key]
    }
  }
}

function pushDateFields(fieldName?: string): void {
  if (fieldName) {
    dateFields.push(fieldName)
  } else {
    dateFields = []
  }
}

function pushDateRangeFields(fieldName?: string, fieldNames?: string[]): void {
  if (fieldName) {
    dateRangeFields.push(fieldName)
    rangeFieldNamesMap[fieldName] = fieldNames ?? [`${fieldName}Begin`, `${fieldName}End`]
  } else {
    dateRangeFields = []
    rangeFieldNamesMap = {}
  }
}

/** 过滤掉 none = true 字段或组 */
function filterNoneFields(submitData: CrudRecord): void {
  const removeNone = (fields: NormalizedFormField[]): void => {
    fields.forEach((field) => {
      if (field.fields) {
        removeNone(field.fields)
      } else if (field.none) {
        delete submitData[field.fieldName]
      }
    })
  }
  removeNone(currFields.value)
}

/** 动态表格类型组件，表单校验封装 */
function setTableRules(field: DynamicTableFormField): void {
  const columns: DynamicTableColumn[] = typeof field.props === 'function' ? [] : (field.props?.columns ?? [])
  if (columns.length === 0) return
  let isRequired = false
  let hasValidator = false
  columns.forEach((item) => {
    if (item.required && !isRequired) {
      isRequired = true
    }
    if (!!item.validator && !hasValidator) {
      hasValidator = true
    }
  })

  const rules: FormRule[] = []
  if (isRequired) {
    rules.push({
      type: 'array',
      required: true,
      message: t('crud.notNull', { label: typeof field.label === 'string' ? field.label : field.fieldName })
    })
  }
  if (hasValidator) {
    rules.push({
      validator: async (_rule, list) => {
        if (Array.isArray(list) && list.length > 0) {
          for (const i in list) {
            const obj = list[i] as CrudRecord
            for (const c in columns) {
              const column = columns[c]
              const required = column.required === undefined ? false : getFnValue(column.required, obj, list as CrudRecord[])
              if (required && isEmpty(obj[column.dataIndex] as IsEmptyValue)) {
                return Promise.reject(t('crud.someRowNotNull', { rowNum: Number(i) + 1, label: column.title }))
              } else if (typeof column.validator === 'function') {
                const message = column.validator(Number(i), obj[column.dataIndex] as string, obj, list as CrudRecord[])
                if (message) {
                  return Promise.reject(message)
                }
              }
            }
          }
        }
        return Promise.resolve()
      },
      trigger: 'change'
    })
  }
  field.rules = rules
}

/** 取消 */
function cancel(): void {
  if (props.formConfig.autoReset !== false) {
    reset()
  }
  if (closeModal) {
    void closeModal()
  }
}

/** 获取提交数据 */
async function getSubmitData(): Promise<CrudRecord> {
  if (import.meta.env.VITE_APP_DEBUG_MODE === 'true') {
    console.log('formData', formData)
  }
  await inputForm.value?.validate()
  let submitData: CrudRecord = { ...formData }
  // 日期统一转成时间戳
  transferDate(submitData)
  if (props.beforeSubmit) {
    const result = await props.beforeSubmit(submitData, {
      isAdd: props.isAdd,
      isEdit: props.isEdit,
      isView: props.isView,
      detail: props.detail
    })
    if (result) {
      submitData = result
    }
  }
  if (props.isEdit && props.primaryKey) {
    submitData[props.primaryKey] = props.detail[props.primaryKey]
  }
  // 过滤掉 none = true 的字段
  if (props.formConfig.removeNoneFields !== false) {
    filterNoneFields(submitData)
  }
  if (import.meta.env.VITE_APP_DEBUG_MODE === 'true') {
    console.log('submitData', submitData)
  }
  return submitData
}

/** 提交表单 */
function submit(): void {
  void loadingRequest(loading, async () => {
    const submitData = await getSubmitData()
    if (props.onSubmitHandle) {
      await props.onSubmitHandle(submitData)
    }
    if (props.formConfig.autoReset !== false) {
      reset()
    }
    if (typeof props.confirmContinue === 'function') {
      await nextTick()
      await props.confirmContinue(formData, submitData)
    } else if (props.formConfig.autoClose !== false && closeModal) {
      if (!props.confirmContinue) {
        await closeModal()
      }
    }
  })
}

function validate(): Promise<CrudRecord> {
  return inputForm.value ? inputForm.value.validate() : Promise.resolve({ ...formData }) // 校验成功返回表单数据
}

function remotes(): FormRemotes {
  return formRemotes
}

defineExpose<CrudFormExpose>({
  submit,
  validate,
  getSubmitData,
  setFormData,
  reset,
  remotes
})
</script>

<style lang="scss" scoped>
.c-form {
  padding-top: 10px;
  &.is-view {
    ::v-deep(.ant-form-item) {
      margin-bottom: 10px;
    }
    ::v-deep(.ant-form-item-label) {
      opacity: .8;
    }
  }
}
</style>
