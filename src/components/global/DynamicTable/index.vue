<!-- 动态表格，用于表单中动态添加多条数据，或动态展示多条数据 -->
<template>
  <div class="dynamic-table">
    <a-form-item-rest>
      <a-table
        :columns="currColumns"
        :data-source="modelValue"
        :pagination="false"
        v-bind="$attrs"
        :rowKey="primaryKey"
      >
        <template #headerCell="{ column }">
          <template v-if="column.title">
            <span>
              <a-tooltip v-if="getCol(column).tooltip" :title="getCol(column).tooltip">
                <QuestionCircleOutlined />
              </a-tooltip>
              {{ column.title }}
            </span>
          </template>
        </template>
        <template #bodyCell="{ text, record, index, column }">
          <template v-if="getCol(column).field">
            <div class="flex-x x-middle gap2">
              <span v-if="getFnValue(getCol(column).required, record, modelValue)" class="text-danger">*</span>
              <CComponent
                v-model:value="record[getColDataIndex(column)]"
                :field="getFinalField(getCol(column).field, record)"
                :is-view="getCol(column).isView || disabled"
                :cellInfo="{ text, record, index, column }"
                class="flex-auto"
                @update:value="(val: unknown) => handleChange(val, record, getCol(column).field)"
              />
            </div>
          </template>
          <!-- 操作列 -->
          <template v-else-if="useDelete && modelValue.length > minCount && getCol(column).type === 'action' && !disabled">
            <a-popconfirm
              placement="left"
              title="确认要删除该行吗？"
              @confirm="deleteHandle(index)"
            >
              <span class="text-danger pointer">删除</span>
            </a-popconfirm>
          </template>
        </template>
      </a-table>
      <div v-if="!disabled && modelValue.length <= maxCount" class="add-row tc py8 em09 flex-x-center">
        <a class="" href="javascript:;" @click="addHandle">
          <PlusCircleOutlined />
          新增一行
        </a>
        <!-- 文本OCR -->
        <template v-if="useTextOCR">
          <!-- <span class="text-gray2 mx20">|</span> -->
          <a-divider type="vertical" />
          <span class="flex-x x-middle gap10">
            <a-popover v-model:open="textOcrOpen">
              <template #content>
                <div style="width:500px;">
                  <div class="bold">文本识别：</div>
                  <a-textarea v-model:value="textContent" :rows="8" :placeholder="`请输入内容，如：\n1,2,3\n4,5,6\n`" class="mt10"></a-textarea>
                  <div class="mt10 flex-x-between">
                    <div>* 每行不同列之间用 <a-tag>|</a-tag><a-tag>,</a-tag><a-tag>，</a-tag> 或空格、制表符间隔，回车结束</div>
                    <a-button type="primary" :loading="textOcring" @click="textOcrHandle">识别</a-button>
                  </div>
                </div>
              </template>
              <a href="javascript:;">
                <FormOutlined /> {{ textOcring ? '识别中...' : '从文本中识别' }}
              </a>
            </a-popover>
          </span>
        </template>
        <!-- 清空 -->
        <template v-if="useClear && value.length > 0">
          <a-popconfirm
            title="确认要清空所有数据？"
            @confirm="clearHandle"
          >
            <a-divider type="vertical" />
            <span class="text-danger pointer"><ClearOutlined /> 清空</span>
          </a-popconfirm>
        </template>
      </div>
    </a-form-item-rest>
  </div>
</template>

<script setup lang="ts">
import { QuestionCircleOutlined, PlusCircleOutlined, ClearOutlined, FormOutlined } from '@ant-design/icons-vue'
import CComponent from '@/components/crud/components/c-component'
import type { CrudComponentField, CrudControlProps, MaybeFn } from '@/components/crud/types'
import { getFnValue } from '@/utils'
import { message } from 'ant-design-vue'
import type { PropType } from 'vue'
import type { ColumnType, ColumnsType } from 'ant-design-vue/es/table/interface'

/** 表格行数据 */
type TableRow = Record<string, unknown>

/** 扩展列配置，在 ant-design-vue 列配置基础上增加自定义属性 */
interface DynamicColumn {
  title?: string
  tooltip?: string
  dataIndex?: string
  type?: string
  required?: unknown
  disabled?: unknown
  isView?: boolean
  hidden?: boolean
  ocrIgnore?: boolean
  defaultValue?: unknown
  props?: Record<string, unknown>
  field?: {
    label?: string
    fieldName?: string
    type?: unknown
    disabled?: unknown
    props?: Record<string, unknown>
    required?: unknown
    [key: string]: unknown
  }
  [key: string]: unknown
}

const props = defineProps({
  // 组件值，对象数组
  value: { type: Array, default: () => [] },
  // 主键字段名
  primaryKey: { type: String, default: 'id' },
  // 最小条数限制
  minCount: { type: Number, default: 0 },
  // 最大条数限制
  maxCount: { type: Number, default: 10 },
  /**
   * 列信息，对象数组，在 ant-design-vue 的 columns 基础上增加了一些属性配置项(以下带++标识的为新增配置)
   * title: 表头名称
   * tooltip: 表头提示说明（++）
   * dataIndex: 该列对应字段名
   * width: 100, // 宽度
   * minWidth: 40,
   * maxWidth: 200,
   * resizeble: true, // 是否可调整列宽
   * type: 控件类型（++），枚举：EControlType
   * defaultValue: 默认值（++）
   * hidden: true, // 该列隐藏（++）（类似 <input type="hidden" /> 适合需要给每行附加固定字段，又不需要显示出来的场景，也可以用 type: EControlType.eHidden 隐藏）
   * required: true, // 该列是否必填（++），支持函数 Boolean | (record, records) => Boolean，需配合 c-form.vue 使用才能动态生成校验规则
   * validator: 校验逻辑函数，(rowIndex, value, record, records) => string，需配合 c-form.vue 使用才能动态生成校验规则
   * disabled: false, // 该列是否禁用（++），支持函数 Boolean | (record, records) => Boolean
   * isView: false, // 该列是否仅展示文本值（++）
   * props: 组件属性配置（++）
   * props.onChange: // 控件值改变事件（++），通过修改record里的属性进行多列间联动 (val, record, records) => {}
   */
  columns: { type: Array as PropType<DynamicColumn[]>, required: true },
  // 是否禁用组件，禁用后只能查看，不能操作
  disabled: { type: Boolean, default: false },
  // 是否需要默认新增一行
  useAddDefault: { type: Boolean, default: true },
  // 是否需要删除按钮
  useDelete: { type: Boolean, default: true },
  /** 是否使用清空功能 */
  useClear: { type: Boolean, default: true },
  /** 是否使用文本识别功能 */
  useTextOCR: { type: Boolean, default: true },
})

const modelValue = ref<TableRow[]>([])

/** 表格插槽中的列配置转换为扩展列配置 */
function getCol (column: ColumnType): DynamicColumn {
  return column as unknown as DynamicColumn
}

/** 安全获取列的 dataIndex */
function getColDataIndex (column: ColumnType): string {
  return (getCol(column).dataIndex ?? '') as string
}

/** eHidden 控件类型的运行时值 */
const HIDDEN_CONTROL_TYPE = EControlType.eHidden as unknown as string

const currColumns = computed(() => ([
  ...props.columns.filter(item => !item.hidden && item.type !== HIDDEN_CONTROL_TYPE).map(item => {
    return {
      ...item,
      type: undefined,
      rules: undefined,
      disabled: undefined,
      // align: item.align ?? 'center', // 默认居左，居中会导致部分控件展示怪异
      field: {
        label: item.title,
        fieldName: item.dataIndex,
        type: item.type,
        disabled: item.disabled,
        props: item.props ?? {}
      }
    }
  }),
  props.useDelete && !props.disabled ? {
    title: '操作',
    key: 'action',
    align: 'center',
    type: 'action'
  } : null
].filter(Boolean)) as unknown as ColumnsType)

onMounted(() => {
  if (!props.disabled && (!props.value || props.value.length === 0)) {
    props.useAddDefault && addHandle()
  }
})

watch(
  () => props.value,
  (val) => {
    setData(val)
  },
  { immediate: true, deep: true }
)

function setData(val: unknown[]) {
  modelValue.value = (val ?? []) as TableRow[]
  modelValue.value.forEach(item => {
    item[props.primaryKey] = item[props.primaryKey] ?? Date.now()
  })
}

// 获取最终的字段配置，将动态的函数形式的值转成具体值
function getFinalField (field: DynamicColumn['field'], record: TableRow): CrudComponentField {
  // 模板中已通过 v-if 保证 field 存在，此处仅做类型收敛
  const target = field as CrudComponentField
  const fieldProps = (getFnValue(target.props, record, modelValue.value) ?? {}) as CrudControlProps
  const disabled = getFnValue(
    target.disabled as MaybeFn<boolean, [TableRow, TableRow[]]>,
    record,
    modelValue.value
  )
  const placeholder = getFnValue(
    fieldProps.placeholder as unknown as MaybeFn<string, [TableRow, TableRow[]]>,
    record,
    modelValue.value
  )
  if (disabled !== undefined) {
    fieldProps.disabled = disabled
  }
  if (placeholder !== undefined) {
    fieldProps.placeholder = placeholder
  }
  return {
    ...target,
    required: getFnValue(target.required, record, modelValue.value),
    props: fieldProps
  }
}

function handleChange (val: unknown, record: TableRow, field: DynamicColumn['field']) {
  if (field) {
    const onChange = (field.props as Record<string, unknown>)?.onChange
    if (typeof onChange === 'function') {
      ;(onChange as (val: unknown, record: TableRow, model: unknown) => void)(val, record, modelValue)
    }
  }
  emitChange()
}

/** 删除一行 */
function deleteHandle(index: number) {
  modelValue.value.splice(index, 1)
  emitChange()
}
/** 新增一行 */
function addHandle() {
  const emptyObj: TableRow = { [props.primaryKey]: Date.now() }
  props.columns.forEach((item) => {
    if (item.dataIndex) {
      emptyObj[item.dataIndex] = item.defaultValue ?? null
    }
  })
  modelValue.value.push(emptyObj)
  emitChange()
}
/** 清空 */
function clearHandle () {
  modelValue.value = []
  emitChange()
}

// 文本识别
const textOcring = ref(false)
const textOcrOpen = ref(false)
const textContent = ref('')
function textOcrHandle () {
  if (!textContent.value) {
    message.warning('请输入文本内容')
    return
  }
  textOcring.value = true
  try {
    const lines = textContent.value.split('\n').filter(line => line.trim())
    let now = Date.now()
    const newData = lines.map(line => {
      const obj: TableRow = {[props.primaryKey]: ++now}
      let splitChar: string | RegExp = '\t'
      if (!line.includes(splitChar as string)) {
        splitChar = '|'
        if (!line.includes(splitChar as string)) {
          splitChar = '，'
          if (!line.includes(splitChar as string)) {
            splitChar = ','
            if (!line.includes(splitChar as string)) {
              splitChar = /\s+/
            }
          }
        }
      }
      const values = line.split(splitChar)
      props.columns.filter(item => !item.hidden && item.ocrIgnore !== true).forEach((col, index) => {
        if (col.dataIndex) {
          obj[col.dataIndex] = values[index] ?? null
        }
      })
      return obj
    })
    modelValue.value.push(...newData)
    textContent.value = ''
    textOcrOpen.value = false
    emitChange()
  } finally {
    textOcring.value = false
  }
}

const emit = defineEmits(['update:value', 'change'])
async function emitChange() {
  await nextTick()
  emit('update:value', modelValue.value)
  emit('change', modelValue.value)
}
</script>

<style lang="less" scoped>
.dynamic-table{
  .add-row {
    border: solid var(--ant-lineWidth) var(--ant-colorBorderSecondary);
    border-top: none;
    border-radius: 0 0 var(--ant-borderRadius) var(--ant-borderRadius);
  }
}
</style>
