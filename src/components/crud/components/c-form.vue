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
          <template v-if="isFieldGroup(field) && !getFnValue(field.none, formData)">
            <!-- 控件组 -->
            <a-col span="24" v-show="!getFnValue(field.hidden, formData)">
              <FieldGroup :title="getFnValue(field.title, formData)" :subTitle="getFnValue(field.subTitle, formData)">
                <a-row :gutter="15">
                  <template v-for="child in field.fields" :key="child.fieldName">
                    <a-col v-if="!getFnValue(child.none, formData)" v-show="!getFnValue(child.hidden, formData)" v-bind="child.col">
                      <a-form-item v-bind="formItemProps(child)">
                        <CComponent v-model:value="formData[child.fieldName]" :field="staticField(child)" :is-view="isView" @update:value="(...args) => field.props?.onChange?.(...args, formData)" />
                      </a-form-item>
                    </a-col>
                  </template>
                </a-row>
              </FieldGroup>
            </a-col>
          </template>
          <template v-else-if="!getFnValue(field.none, formData)">
            <!-- 控件 -->
            <a-col v-bind="field.col" v-show="!getFnValue(field.hidden, formData)">
              <a-form-item v-bind="formItemProps(field)">
                <CComponent v-model:value="formData[field.fieldName]" :field="staticField(field)" :is-view="isView" @update:value="(...args) => field.props?.onChange?.(...args, formData)" />
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

<script setup>
import CComponent from './c-component.js'
import dayjs from 'dayjs'
import { getFnValue } from '@/utils'

const props = defineProps({
  isAdd: Boolean,
  isEdit: Boolean,
  isView: Boolean,
  primaryKey: { type: String, default: 'id' }, // 主键字段名
  detail: { type: Object, default: () => ({}) }, // 修改、查看详情时的详情数据
  /**
   * formConfig:
   * layout: 'horizontal', // 表单布局 horizontal | vertical | inline 默认 horizontal
   * cols: 2, // 一行显示几列，默认 2 列
   * labelCol: { span: 6 }, // 如果需要固定label宽度，可设为 { flex: '120px' }, 默认 { flex: '0 0 100px' }，参考 ant-design-vue a-col 的属性设置
   * wrapperCol: { span: 18 }, // 如果需要固定控件宽度，可设为 { flex: '280px' }, 默认 撑满剩余空间，参考 ant-design-vue a-col 的属性设置
   * autoReset: { type: Boolean, default: true }, // 提交之后自动清空表单
   * autoClose: { type: Boolean, default: true }, // 提交之后自动关闭弹窗(如果有)
   * removeNoneFields: { type: Boolean, default: true }, // 提交时过滤掉已移除的字段，none = true 的字段
   * fields: [Object], // 表单字段数组，可分组
   */
  formConfig: { type: Object, required: true }, // 表单配置信息
  beforeSubmit: Function, // 提交表单前，对数据进行手工处理的函数，submitData => modifiedSubmitData
  onSubmitHandle: Function, // 校验通过之后，对提交的数据进行处理，如请求接口将数据提交到服务器、提交成功提示、刷新列表
  // 以下为自定义提交、取消按钮属性
  showConfirm: { type: Boolean, default: true },
  confirmText: { type: String },
  confirmContinue: { type: [Boolean, Function], default: false },
  showCancel: { type: Boolean, default: true },
  cancelText: { type: String },
  confirmAlign: { type: String, default: 'right' }, // 提交、取消按钮对齐方式，left，center，right
  
})

const { t } = useI18n()
const inputForm = ref()
// const inModal = inject('modal.in', false)
const closeModal = inject('modal.close', null)
const formData = reactive({})
const formRemotes = reactive({}) // 收集组件的 remote 方法，用于需要重新刷新 remote 数据时使用
const loading = ref(false)
const { layout = 'horizontal', labelCol = { flex: '0 0 100px' }, wrapperCol, cols = 2 } = props.formConfig // 已经解构失去响应式
const isHorizontal = layout === 'horizontal'
const colSpan = parseInt(24 / cols)
let dateFields = [] // 收集的日期字段数组，便于统一转换格式
let dateRangeFields = [] // 收集的日期范围字段数组
let rangeFieldNamesMap = {} // 日期范围，一般有两个值，其字段名用 map 暂存
const currFields = computed(() => {
  // 对字段配置信息做初步整理
  pushDateFields()
  pushDateRangeFields()
  const initFields = (_fields) => {
    return _fields.map(item => {
      // 字段组，递归处理
      if (isFieldGroup(item)) {
        item.fields = initFields(item.fields)
      }
      // 详情时，使用独有的 detailConfig 覆盖原有属性配置
      if (props.isView && item.detailConfig) {
        item = Object.assign({ ...item, detailConfig: undefined }, item.detailConfig)
      }
      // 日期类型字段收集，便于统一数据转换
      if (item.type === EControlType.eDate) {
        pushDateFields(item.fieldName)
      } else if (item.type === EControlType.eDateRange) {
        pushDateRangeFields(item.fieldName, item.props?.fieldNames)
      } else if (item.type === EControlType.eTable) {
        // 表格类型，根据 columns 自动生成 rules
        setTableRules(item)
      }
      item.col = item.singleLine ? { span: 24 } : (item.col ?? { span: colSpan })
      return item
    })
  }
  return initFields(props.formConfig.fields)
})
const fieldNamesArr = computed(() => {
  function getNamesArrByFields (fields) {
    const arr = []
    fields.forEach(f => {
      if (isFieldGroup(f)) {
        arr.push(...getNamesArrByFields(f.fields))
      } else {
        arr.push(f.fieldName)
      }
    })
    return arr
  }
  return getNamesArrByFields(currFields.value)
})
/** 收集默认值 */
const defaultObject = computed(() => {
  const obj = {}
  function getDefaultValueByFields (fields) {
    fields.forEach(f => {
      if (isFieldGroup(f)) {
        getDefaultValueByFields(f.fields)
      } else if (isNotEmpty(f.defaultValue)) {
        obj[f.fieldName] = f.defaultValue
      }
    })
  }
  getDefaultValueByFields(currFields.value)
  return obj
})
const alignClass = computed(() => {
  return {
    'left': 'tl',
    'center': 'tc',
    'right': 'tr'
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
 * @param {Object} data 要设置的数据对象，默认绑定的 detail 对象
 * @param {Array} includeFieldNames 要设置的字段数组，默认全部字段
 * @param {Array} excludeFieldNames 不要设置的字段数组，默认空数组
 */
function setFormData (data = props.detail, includeFieldNames = fieldNamesArr.value, excludeFieldNames = []) {
  includeFieldNames.forEach(fieldName => {
    if (!excludeFieldNames || !excludeFieldNames.includes(fieldName)) {
      // 回填时，对日期类型特殊处理
      if (dateFields.includes(fieldName)) {
        formData[fieldName] = data[fieldName] ? dayjs(data[fieldName]) : defaultObject.value[fieldName]
      } else if (dateRangeFields.includes(fieldName)) {
        const fieldNames = rangeFieldNamesMap[fieldName]
        if (Array.isArray(fieldNames) && fieldNames.length === 2) {
          if (data[fieldName]) {
            formData[fieldName] = data[fieldName] ?? defaultObject.value[fieldName]
          } else if (data[fieldNames[0]] && data[fieldNames[1]]) {
            formData[fieldName] = [dayjs(data[fieldNames[0]]), dayjs(data[fieldNames[1]])]
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

/** 是否是字段分组 */
function isFieldGroup (field) {
  return !!field?.fields
}

/** 通过字段配置，生成表单项的属性 */
function formItemProps (field) {
  return {
    labelCol: isHorizontal ? field.labelCol : undefined,
    wrapperCol: isHorizontal ? field.wrapperCol : undefined,
    name: field.fieldName,
    label: getFnValue(field.label, formData),
    disabled: props.isView ? false : getFnValue(field.disabled, formData),
    required: props.isView ? false : getFnValue(field.required, formData),
    tooltip: getFnValue(field.tooltip, formData),
    extra: props.isView ? undefined : getFnValue(field.extra, formData),
    rules: props.isView ? undefined : getFnValue(field.rules, formData)
  }
}

/** 通过字段动态配置，生成组件静态属性 */
function staticField (field) {
  const cProps = getFnValue(field.props, formData) ?? {}
  const placeholder = getFnValue(cProps.placeholder, formData)
  const disabled = getFnValue(field.disabled, formData)
  if (disabled !== undefined) {
    cProps.disabled = disabled
  }
  if (placeholder !== undefined) {
    cProps.placeholder = placeholder
  }
  return {
    ...field,
    label: getFnValue(field.label, formData),
    props: cProps
  }
}

/** 重置表单 */
function reset () {
  inputForm.value.resetFields()
  Object.keys(formData)?.forEach(key => formData[key] = undefined)
  const resetDatas = (fields) => {
    fields.forEach(field => {
      if (isFieldGroup(field)) {
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
function transferDate (data) {
  for (const key in data) {
    const value = data[key]
    if (dateFields.includes(key) && isDayjs(value)) {
      // 日期字段处理
      data[key] = value.valueOf()
    } else if (dateRangeFields.includes(key) && Array.isArray(value)) {
      // 日期范围字段处理
      const fieldNames = rangeFieldNamesMap[key]
      data[fieldNames[0]] = value[0].valueOf()
      data[fieldNames[1]] = value[1].valueOf()
      delete data[key]
    }
  }
}
function pushDateFields (fieldName) {
  if (fieldName) {
    dateFields.push(fieldName)
  } else {
    dateFields = []
  }
}
function pushDateRangeFields (fieldName, fieldNames) {
  if (fieldName) {
    dateRangeFields.push(fieldName)
    rangeFieldNamesMap[fieldName] = fieldNames ?? [`${fieldName}Begin`, `${fieldName}End`]
  } else {
    dateRangeFields = []
    rangeFieldNamesMap = {}
  }
}
// 过滤掉 none = true 字段或组
function filterNoneFields (submitData) {
  const removeNone = (fields) => {
    fields.forEach(field => {
      if (isFieldGroup(field)) {
        removeNone(field.fields)
      } else {
        let isNone = getFnValue(field.none, submitData)
        if (isNone) {
          delete submitData[field.fieldName]
        }
      }
    })
  }
  removeNone(currFields.value)
}

/** 动态表格类型组件，表单校验封装 */
function setTableRules (field) {
  const columns = field.props?.columns ?? []
  if (columns.length === 0) return
  let isRequired = false
  let hasValidator = false
  columns.forEach(item => {
    if (item.required && !isRequired) {
      isRequired = true
    }
    if (!!item.validator && !hasValidator) {
      hasValidator = true
    }
  })

  field.rules = []
  if (isRequired) {
    field.rules.push({ type: 'array', required: true, message: t('crud.notNull', { label: field.label }) })
  }
  if (hasValidator) {
    field.rules.push({
      validator (rule, list) {
        if (Array.isArray(list) && list.length > 0) {
          for (let i in list) {
            const obj = list[i]
            for (let c in columns) {
              const column = columns[c]
              const required = getFnValue(column.required, obj, list)
              if (required && isEmpty(obj[column.dataIndex])) {
                return Promise.reject(t('crud.someRowNotNull', { rowNum: Number(i) + 1, label: column.title }))
              } else if (typeof column.validator === 'function') {
                const message = column.validator(Number(i), obj[column.dataIndex], obj, list)
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
}

/** 取消 */
function cancel () {
  if (props.formConfig.autoReset !== false) {
    reset()
  }
  if (closeModal) {
    closeModal()
  }
}

/** 获取提交数据 */
async function getSubmitData () {
  if (import.meta.env.VITE_APP_DEBUG_MODE === 'true') {
    console.log('formData', formData)
  }
  await inputForm.value.validate()
  let submitData = { ...formData }
  // 日期统一转成时间戳
  transferDate(submitData)
  if (props.beforeSubmit) {
    submitData = await props.beforeSubmit(submitData, {
      isAdd: props.isAdd,
      isEdit: props.isEdit,
      detail: props.detail
    })
  }
  if (props.isEdit && props.primaryKey) {
    submitData[props.primaryKey] = props.detail[props.primaryKey]
  }
  // 过滤掉 none = true 的字段
  props.formConfig.removeNoneFields !== false && filterNoneFields(submitData)
  if (import.meta.env.VITE_APP_DEBUG_MODE === 'true') {
    console.log('submitData', submitData)
  }
  return submitData
}

/** 提交表单 */
function submit () {
  loadingRequest(loading, async () => {
    const submitData = await getSubmitData()
    if (props.onSubmitHandle) {
      await props.onSubmitHandle(submitData)
    }
    if (props.formConfig.autoReset !== false) {
      reset()
    }
    if (typeof props.confirmContinue === 'function') {
      await nextTick()
      props.confirmContinue(formData, submitData)
    } else if (props.formConfig.autoClose !== false && closeModal) {
      !props.confirmContinue && closeModal()
    }
  })
}

function validate () {
  return inputForm.value.validate() // 校验成功返回表单数据
}

function remotes () {
  return formRemotes
}

defineExpose({
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
    // ::v-deep(.ant-form-item-control) {
    //   font-weight: bold;
    // }
  }
}
</style>
