<!-- c-page 表格、数据展示组件 -->
<template>
  <div class="c-table">
    <a-table
      :columns="currColumns"
      :data-source="dataSource"
      :pagination="config.props?.usePage === false ? false : pagination"
      :rowKey="primaryKey"
      :row-class-name="`striped-row ${config.props?.rowClick ? 'pointer' : ''}`"
      :row-selection="currentRowSelection"
      :custom-row="customRow"
      :showSorterTooltip="config.props?.showSorterTooltip ?? false"
      v-bind="{ ...defaultProps, ...config.props }"
      @resizeColumn="resizeColumn"
      @change="onPageChangeHandle"
    >
      <template #headerCell="{ column }">
        <template v-if="asColumn(column).tooltip">
          <span>
            <a-tooltip :title="asColumn(column).tooltip">
              <QuestionCircleOutlined />
            </a-tooltip>
            {{ column.title }}
          </span>
        </template>
      </template>
      <template #bodyCell="{ text, record, index, column }">
        <!-- 如果使用插槽来渲染单元格内容 -->
        <template v-if="asColumn(column).slot">
          <slot :name="asColumn(column).slot" :text="text" :record="record" :index="index" :column="column" />
        </template>
        <!-- 日期时间格式化 -->
        <template v-else-if="asColumn(column).dateFormat && text">
          <span>{{ dayjs(text).format(asColumn(column).dateFormat) }}</span>
        </template>
        <template v-else-if="asColumn(column).isDate && text">
          <span>{{ dayjs(text).format('YYYY-MM-DD') }}</span>
        </template>
        <template v-else-if="asColumn(column).isDateTime && text">
          <span>{{ dayjs(text).format('YYYY-MM-DD HH:mm') }}</span>
        </template>
        <!-- 金额格式化 -->
        <template v-else-if="asColumn(column).isAmount && text">
          <span>{{ numFormat(text, { digit: 2 }) }} {{ asColumn(column).unit ?? '' }}</span>
        </template>
        <!-- 字典转换 -->
        <template v-else-if="asColumn(column).dictType && text">
          <DictView :dict-type="asColumn(column).dictType" :value="text" />
        </template>
        <!-- 头像转换 -->
        <template v-else-if="asColumn(column).isAvatar && text">
          <a-avatar :src="getImageSrcData(text)" :size="30" />
        </template>
        <!-- 图片转换 -->
        <template v-else-if="asColumn(column).isImage && text">
          <a-image :src="getImageSrcData(text)" :height="30" />
        </template>
        <!-- 类型转换 -->
        <template v-else-if="asColumn(column).type">
          <template v-if="asColumn(column).type === 'isEnabled'">
            <a-tag :color="text ? 'success' : 'error'" :bordered="false">{{ $t(EIsEnabled._of(text ? 1 : 0)) }}</a-tag>
          </template>
          <template v-if="asColumn(column).type === 'Boolean'">
            <a-tag :color="text ? 'success' : 'error'" :bordered="false">{{ EYesNo._of(text ? 1 : 0) }}</a-tag>
          </template>
        </template>
        <!-- 带单位、带默认值、字符串脱敏 -->
        <template v-else-if="asColumn(column).hideChar || asColumn(column).default || asColumn(column).unit">
          <span v-if="isEmpty(text)" v-html="asColumn(column).default" />
          <span v-else>{{ hideCharText(asColumn(column), text) }}</span>
          {{ asColumn(column).unit ?? '' }}
        </template>
        <!-- 操作列 -->
        <template v-else-if="asColumn(column).action">
          <CTableAction :record="record" :column="asColumn(column)" :permission-config="permissionConfig" @action="handleTableAction" />
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
              :key="getColumnKey(column)"
              :col-span="index === 0 && noSelect ? 0 : 1"
              class="tc"
            >
              <span v-if="column.useTotal">
                {{ numFormat(total[getColumnKey(column)] ?? 0, { digit: 2 }) }} {{ column.unit ?? '' }}
              </span>
              <span v-else>-</span>
            </a-table-summary-cell>
          </a-table-summary-row>
        </a-table-summary>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts" generic="Row extends CrudRecord = CrudRecord">
import { QuestionCircleOutlined } from '@ant-design/icons-vue'
import type { TableColumnType, TablePaginationConfig, TableProps } from 'ant-design-vue'
import type { TableRowSelection, SorterResult } from 'ant-design-vue/es/table/interface'
import dayjs from 'dayjs'
import CTableAction from './c-table-action.vue'
import { EIsEnabled, EYesNo } from '@/enum'
import { stringStar, isEmpty, getImageSrcData } from '@/utils/index'
import type { IsEmptyValue } from '@/utils/index'
import { useSettingStore } from '@/stores/setting-store'
import { useNumFormat } from '@/hooks/useNumFormat'
import { crudRequest } from '../utils/request'
import type {
  CrudApiOptionConfig,
  CrudPagination,
  CrudRecord,
  CrudSorter,
  CrudTableColumn,
  ListResult,
  ResolvedApiConfig,
  ResolvedApiMethodConfig,
  ResolvedPermissionConfig,
  RowClickContext,
  SearchParams,
  TableConfig
} from '../types'

const props = withDefaults(
  defineProps<{
    /** 不要选择框 */
    noSelect?: boolean
    /** 表格配置 */
    config: TableConfig<Row>
    /** 查询器那边是否自动提交查询(有默认值时会自动提交) */
    filterAutoSearch?: boolean
    /** 主键字段名 */
    primaryKey?: string
    /** 接口配置 */
    apiConfig: ResolvedApiConfig<Row>
    /** 接口请求方式配置 */
    apiMethodConfig: ResolvedApiMethodConfig
    /** 接口请求其他配置，如 headers */
    apiOptionConfig?: CrudApiOptionConfig
    /** 权限配置 */
    permissionConfig: ResolvedPermissionConfig
    /** 查询前修改查询参数 */
    beforeSearch?: (params: SearchParams) => SearchParams
    /** 查询后修改查询结果 */
    afterSearch?: (list: Row[]) => Row[]
  }>(),
  {
    primaryKey: 'id',
    config: () => ({ columns: [] })
  }
)

const checkedFieldNames = inject<Ref<string[]>>('c-page.checkedFieldNames', ref([]))
const searchParams = inject<Ref<SearchParams>>('c-page.searchParams', ref({}))
const pagination = inject<Ref<CrudPagination>>(
  'c-page.pagination',
  ref<CrudPagination>({ current: 1, pageSize: 10, total: 0, showSizeChanger: true })
)
const cPageSorter = inject<Ref<CrudSorter>>('c-page.sorter', ref<CrudSorter>({}))
const loading = inject<Ref<boolean>>('c-page.loading', ref(false))
const selectedIds = inject<Ref<(string | number)[]>>('c-page.selectedIds', ref([]))
const selectedObjs = inject<Ref<Row[]>>('c-page.selectedObjs', ref([]))
const useTableBorder = inject<Ref<number>>('c-page.useTableBorder', ref(0))
const dataSource = ref<Row[]>([])
const settingStore = useSettingStore()
const { numFormat } = useNumFormat()

/** 排序字段映射 */
const orderMap: Record<'ascend' | 'descend', string> = { ascend: 'asc', descend: 'desc' }

// 表格默认属性
const defaultProps = computed<Pick<TableProps, 'size' | 'bordered'>>(() => ({
  size: 'small',
  bordered: useTableBorder.value === 0 ? settingStore.useTableBorder : useTableBorder.value === 1
}))
const currColumns = computed<CrudTableColumn<Row>[]>(() =>
  props.config.columns
    .filter((column) => column.action || checkedFieldNames.value.includes(getColumnKey(column)))
    .map((column) => ({ ...column, align: column.align ?? 'center' }))
)
// 表格行选择器定义
const currentRowSelection = computed<TableRowSelection<Row> | undefined>(() => {
  const option: TableRowSelection<Row> = Object.assign(
    {
      selectedRowKeys: selectedIds.value,
      onChange: onSelectChangeHandle,
      getCheckboxProps: rowSelectDisabled
    },
    props.config.props?.rowSelection
  )
  return !props.noSelect ? option : undefined
})
// 是否使用合计
const useTotal = computed(() => currColumns.value.some((col) => col.useTotal))
const usePage = computed(() => props.config.props?.usePage !== false)
const page = computed(() => {
  return {
    pageNum: usePage.value ? pagination.value.current : undefined,
    pageSize: usePage.value ? pagination.value.pageSize : undefined,
    orderByColumn: cPageSorter.value.field,
    isAsc: cPageSorter.value.order ? orderMap[cPageSorter.value.order] : undefined
  }
})
// 合计数据
const total = computed<Record<string, number>>(() => {
  if (!useTotal.value) return {}
  return dataSource.value.reduce<Record<string, number>>((t, c) => {
    currColumns.value.filter((col) => col.useTotal).forEach((col) => {
      const key = getColumnKey(col)
      t[key] = (t[key] ?? 0) + Number(c[key] ?? 0)
    })
    return t
  }, {})
})

// 初始化后是否查询
onMounted(() => {
  // 查询器会查我就不查，查询器不查，我就根据配置决定查不查
  const initSearch = props.config.initSearch ?? !props.filterAutoSearch
  if (initSearch !== false) {
    void getList()
  }
})

/** 列字段名（列配置统一使用字符串 dataIndex） */
function getColumnKey(column: { dataIndex?: TableColumnType<CrudRecord>['dataIndex'] }): string {
  return typeof column.dataIndex === 'string' ? column.dataIndex : ''
}
/** a-table 插槽中的列类型较宽松，转换为 CRUD 列配置类型 */
function asColumn(column: unknown): CrudTableColumn {
  return column as CrudTableColumn
}
/** 字符串脱敏 */
function hideCharText(column: { hideChar?: [number, number, string?, number?] }, text: unknown): string {
  if (!column.hideChar) return text === undefined || text === null ? '' : String(text)
  return String(stringStar(text as string | number, ...column.hideChar))
}

/** 获取数据 */
async function getList(reload = false): Promise<void> {
  const url = props.apiConfig.list
  if (reload) {
    pagination.value.current = 1
  }
  let params: SearchParams = {
    ...searchParams.value,
    page: page.value
  }
  if (typeof props.beforeSearch === 'function') {
    params = props.beforeSearch(params)
  }
  try {
    loading.value = true
    let result: ListResult<Row> | Row[]
    if (typeof url === 'function') {
      result = await url(params)
    } else {
      result = await crudRequest<ListResult<Row> | Row[]>(props.apiMethodConfig.list, url, params, props.apiOptionConfig?.list)
    }
    let list: Row[] = Array.isArray(result) ? result : (result.list ?? [])
    if (typeof props.afterSearch === 'function') {
      list = props.afterSearch(list)
    }
    dataSource.value = list
    pagination.value.total = Number(Array.isArray(result) ? result.length : result.total)
  } finally {
    loading.value = false
  }
}

// 可以通过数据中的字段 selectDisabled 控制选择框是否禁用
function rowSelectDisabled(record: Row): { disabled: boolean } {
  return { disabled: !!record.selectDisabled }
}
function onSelectChangeHandle(ids: (string | number)[], rows: Row[]): void {
  selectedIds.value = ids
  selectedObjs.value = rows
}
function resizeColumn(width: number, col: TableColumnType<Row>): void {
  emits('resizeColumn', typeof col.dataIndex === 'string' ? col.dataIndex : '', width)
}
function clearSelect(): void {
  selectedIds.value = []
  selectedObjs.value = []
}
function onPageChangeHandle(
  pageConfig: TablePaginationConfig,
  _filters: unknown,
  sorter: SorterResult<Row> | SorterResult<Row>[]
): void {
  let needRefresh = false
  const current = pageConfig.current ?? 1
  const pageSize = pageConfig.pageSize ?? 10
  if (pagination.value.current !== current || pagination.value.pageSize !== pageSize) {
    needRefresh = true
  }
  pagination.value.current = current
  pagination.value.pageSize = pageSize
  const singleSorter = Array.isArray(sorter) ? sorter[0] : sorter
  if (singleSorter?.order && singleSorter.column?.sorter === true) {
    // sorter 为 true，服务端排序，sorter 为 function 则客户端排序
    cPageSorter.value.field = singleSorter.field === undefined ? undefined : String(singleSorter.field)
    cPageSorter.value.order = singleSorter.order
  } else {
    cPageSorter.value.field = undefined
    cPageSorter.value.order = undefined
  }
  if (needRefresh) {
    void getList()
  }
}

function search(): Promise<void> {
  return getList(true)
}
function refresh(): Promise<void> {
  return getList(false)
}
function reload(): Promise<void> {
  return getList(true)
}

function onActionHandle(data: { action: string; record: Row }): void {
  emits('action', data)
}

/** 操作列点击（操作列组件返回的行数据为 CrudRecord，此处收敛为 Row） */
function handleTableAction(params: { action: string; record: CrudRecord }): void {
  onActionHandle({ action: params.action, record: params.record as Row })
}

/** 行事件配置 */
function customRow(record: Row, index?: number) {
  return {
    onClick(): void {
      const fn = props.config.props?.rowClick
      if (typeof fn === 'function') {
        // 如果配置了行点击函数
        const ctx: RowClickContext<Row> = {
          key: record[props.primaryKey],
          index: index ?? 0,
          record,
          selected: selectedIds.value.includes(record[props.primaryKey] as string | number),
          selectedIds,
          selectedObjs
        }
        fn(ctx)
      }
    }
  }
}

const emits = defineEmits<{
  (e: 'action', params: { action: string; record: Row }): void
  (e: 'resizeColumn', dataIndex: string, width: number): void
}>()

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
