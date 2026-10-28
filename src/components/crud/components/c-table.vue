<!-- c-page 表格、数据展示组件 -->
<template>
  <div class="c-table">
    <a-table
      :columns="currColumns"
      :data-source="dataSource"
      :pagination="config?.props?.usePage === false ? false : pagination"
      :rowKey="primaryKey"
      :row-class-name="`striped-row ${config?.props?.rowClick ? 'pointer' : ''}`"
      :row-selection="currentRowSelection"
      :custom-row="customRow"
      :showSorterTooltip="config?.props?.showSorterTooltip ?? false"
      v-bind="{ ...defaultProps, ...config?.props }"
      @resizeColumn="resizeColumn"
      @change="onPageChangeHandle"
    >
      <template #headerCell="{ column }">
        <template v-if="column.tooltip">
          <span>
            <a-tooltip :title="column.tooltip">
              <QuestionCircleOutlined />
            </a-tooltip>
            {{ column.title }}
          </span>
        </template>
      </template>
      <template #bodyCell="{ text, record, index, column }">
        <!-- 如果使用插槽来渲染单元格内容 -->
        <template v-if="column.slot">
          <slot :name="column.slot" :text="text" :record="record" :index="index" :column="column" />
        </template>
        <!-- 日期时间格式化 -->
        <template v-else-if="column.dateFormat && text">
          <span>{{ dayjs(text).format(column.dateFormat) }}</span>
        </template>
        <template v-else-if="column.isDate && text">
          <span>{{ dayjs(text).format('YYYY-MM-DD') }}</span>
        </template>
        <template v-else-if="column.isDateTime && text">
          <span>{{ dayjs(text).format('YYYY-MM-DD HH:mm') }}</span>
        </template>
        <!-- 金额格式化 -->
        <template v-else-if="column.isAmount && text">
          <span>{{ numFormat(text, { digit: 2 }) }} {{ column.unit ?? '' }}</span>
        </template>
        <!-- 字典转换 -->
        <template v-else-if="column.dictType && text">
          <DictView :dict-type="column.dictType" :value="text" />
        </template>
        <!-- 头像转换 -->
        <template v-else-if="column.isAvatar && text">
          <a-avatar :src="getImageSrcData(text)" :size="30" />
        </template>
        <!-- 图片转换 -->
        <template v-else-if="column.isImage && text">
          <a-image :src="getImageSrcData(text)" :height="30" />
        </template>
        <!-- 类型转换 -->
        <template v-else-if="column.type">
          <template v-if="column.type === 'isEnabled'">
            <a-tag :color="text ? 'success' : 'error'" :bordered="false">{{ $t(EIsEnabled._of(text ? 1 : 0)) }}</a-tag>
          </template>
          <template v-if="column.type === 'Boolean'">
            <a-tag :color="text ? 'success' : 'error'" :bordered="false">{{ EYesNo._of(text ? 1 : 0) }}</a-tag>
          </template>
        </template>
        <!-- 带单位、带默认值、字符串脱敏 -->
        <template v-else-if="column.hideChar || column.default || column.unit">
          <span v-if="isEmpty(text)" v-html="column.default" />
          <span v-else>{{ column.hideChar ? stringStar(text, ...column.hideChar) : text }}</span>
          {{ column.unit ?? '' }}
        </template>
        <!-- 操作列 -->
        <template v-else-if="column.action">
          <CTableAction :record="record" :column="column" :permission-config="permissionConfig" @action="onActionHandle" />
        </template>
      </template>
      <!-- 使用合计 -->
      <template v-if="useTotal" #summary>
        <a-table-summary fixed>
          <a-table-summary-row>
            <a-table-summary-cell>
              <div class="bold nowrap">{{ $t('crud.count') }}</div>
            </a-table-summary-cell>
            <a-table-summary-cell
              v-for="(column, index) in currColumns"
              :key="column.fieldName"
              :col-span="index === 0 && noSelect ? 0 : 1"
              class="tc"
            >
              <span v-if="column.useTotal">
                {{ numFormat(total[column.dataIndex] ?? 0, { digit: 2 }) }} {{ column.unit ?? '' }}
              </span>
              <span v-else>-</span>
            </a-table-summary-cell>
          </a-table-summary-row>
        </a-table-summary>
      </template>
    </a-table>
  </div>
</template>

<script setup>
import { QuestionCircleOutlined } from '@ant-design/icons-vue'
import axios from '@/api/index.js'
import dayjs from 'dayjs'
import CTableAction from './c-table-action.vue'
import { EIsEnabled, EYesNo } from '@/enum'
import { stringStar, isEmpty, getImageSrcData } from '@/utils/index.js'
import { useSettingStore } from '@/stores/setting-store.js'
import { useNumFormat } from '@/hooks/useNumFormat.js'

const props = defineProps({
  /** 不要选择框 */
  noSelect: Boolean,
  /** 表格配置 */
  config: Object,
  /** 查询器那边是否自动提交查询(有默认值时会自动提交) */
  filterAutoSearch: Boolean,
  /** 表格配置 */
  primaryKey: { type: String, default: 'id' },
  /** 接口配置 */
  apiConfig: Object,
  /** 接口请求方式配置 */
  apiMethodConfig: Object,
  /** 接口请求其他配置，如 headers */
  apiOptionConfig: Object,
  /** 权限配置 */
  permissionConfig: Object,
  /** 查询前修改查询参数 */
  beforeSearch: Function,
  /** 查询后修改查询结果 */
  afterSearch: Function
})

const checkedFieldNames = inject('c-page.checkedFieldNames', ref([]))
const searchParams = inject('c-page.searchParams', ref({}))
const pagination = inject('c-page.pagination', ref({}))
const cPageSorter = inject('c-page.sorter', ref({}))
const loading = inject('c-page.loading', ref(false))
const selectedIds = inject('c-page.selectedIds', ref([]))
const selectedObjs = inject('c-page.selectedObjs', ref([]))
const useTableBorder = inject('c-page.useTableBorder', ref(0))
const dataSource = ref([])
const settingStore = useSettingStore()
const { numFormat } = useNumFormat()
// 表格默认属性
const defaultProps = computed(() => ({
  size: 'small',
  bordered: useTableBorder.value === 0 ? settingStore.useTableBorder : useTableBorder.value === 1
}))
const currColumns = computed(() => props.config?.columns
  .filter(column => column.action || checkedFieldNames.value.includes(column.dataIndex))
  .map(column => ({ ...column, align: column.align ?? 'center'})))
// 表格行选择器定义
const currentRowSelection = computed(() => {
  const option = Object.assign({ selectedRowKeys: selectedIds.value, onChange: onSelectChangeHandle, getCheckboxProps: rowSelectDisabled }, props.config?.props?.rowSelection)
  return !props.noSelect ? option : undefined
})
// 是否使用合计
const useTotal = computed(() => currColumns.value.some(col => col.useTotal))
const usePage = computed(() => props.config?.props?.usePage !== false)
const page = computed(() => {
  return {
    pageNum: usePage.value ? pagination.value.current : undefined,
    pageSize: usePage.value ? pagination.value.pageSize : undefined,
    orderByColumn: cPageSorter.value.field,
    isAsc: cPageSorter.value.order && {ascend: 'asc', descend: 'desc'}[cPageSorter.value.order]
  }
})
// 合计数据
const total = computed(() => {
  if (useTotal.value) {
    return dataSource.value?.reduce((t, c) => {
      currColumns.value.filter(col => col.useTotal).forEach(col => {
        t[col.dataIndex] = (t[col.dataIndex] ?? 0) + Number(c[col.dataIndex] ?? 0)
      })
      return t
    }, {}) ?? {}
  } else {
    return {}
  }
})

// 初始化后是否查询
onMounted(() => {
  // 查询器会查我就不查，查询器不查，我就根据配置决定查不查
  const initSearch = props.config.initSearch ?? !props.filterAutoSearch
  if (initSearch !== false) {
    getList()
  }
})

/** 获取数据 */
async function getList (reload = false) {
  const url = props.apiConfig?.list
  if (reload) {
    pagination.value.current = 1
  }
  let params = {
    ...searchParams.value,
    page: page.value
  }
  if (typeof props.beforeSearch === 'function') {
    params = props.beforeSearch(params)
  }
  try {
    loading.value = true
    let result = []
    if (typeof url === 'function') {
      result = await url(params)
    } else {
      result = await axios[props.apiMethodConfig['list']](url, params, props.apiOptionConfig?.list)
    }
    let list = result?.list ?? result
    if (typeof props.afterSearch === 'function') {
      list = props.afterSearch(list)
    }
    dataSource.value = list
    pagination.value.total = Number(result?.total)
  } finally {
    loading.value = false
  }
}

// 可以通过数据中的字段 selectDisabled 控制选择框是否禁用
function rowSelectDisabled (record) {
  return { disabled: !!record.selectDisabled }
}
function onSelectChangeHandle (ids, objs) {
  selectedIds.value = ids
  selectedObjs.value = objs
}
function resizeColumn (w, col) {
  emits('resizeColumn', col.dataIndex, w)
}
function clearSelect () {
  selectedIds.value = []
  selectedObjs.value = []
}
function onPageChangeHandle (page, filter, sorter) {
  let needRefresh = false
  if (pagination.value.current !== page.current || pagination.value.pageSize !== page.pageSize) {
    needRefresh = true
  }
  pagination.value.current = page.current
  pagination.value.pageSize = page.pageSize
  if (sorter.order && sorter.column.sorter === true) { // sorter 为 true，服务端排序，sorter 为 function 则客户端排序
    cPageSorter.value.field = sorter.field
    cPageSorter.value.order = sorter.order
  } else {
    cPageSorter.value.field = undefined
    cPageSorter.value.order = undefined
  }
  needRefresh && getList()
}

function search () {
  getList(true)
}
function refresh () {
  getList(false)
}
function reload () {
  getList(true)
}

function onActionHandle (data) {
  emits('action', data)
}

/** 行事件配置 */
function customRow (record, index) {
  return {
    onClick () {
      const fn = props.config.props?.rowClick
      if (typeof fn === 'function') { // 如果配置了行点击函数
        fn({
          key: record[props.primaryKey],
          index,
          record,
          selected: selectedIds.value.includes(record[props.primaryKey]),
          selectedIds,
          selectedObjs
        })
      }
    }
  }
}

const emits = defineEmits(['action', 'resizeColumn'])
defineExpose({
  search, // 查询，分页重置
  refresh, // 查询，分页不重置
  reload, // 查询，分页重置
  clearSelect,
  dataSource
})
</script>

<style lang="less">
.striped-row:nth-child(odd) {
  background-color: color-mix(in srgb, var(--ant-colorPrimary) 8%, transparent);
}
</style>
