<!-- CRUD 页面组件 -->
<template>
  <div ref="cPage" class="c-page" :class="{ 'is-fullscreen': isFullScreen }">
    <div v-if="treeConfig" ref="treeBox" class="c-page__tree mr10 pr10" :class="{ 'is-hide': !isTreeShow }">
      <!-- 树 -->
      <CTree v-show="isTreeShow" class="c-tree" :config="treeConfig" @selected="onTreeSelectHandle" />
      <div class="c-page__tree__toggle pointer flex-y-center radius6" @click="toggleTree">
        <LeftOutlined class="em06" v-show="isTreeShow" />
        <RightOutlined class="em06" v-show="!isTreeShow" />
      </div>
      <div v-show="isTreeShow" ref="resizerRef" class="c-page__tree__dragger" />
    </div>
    <div class="c-page__page">
      <slot name="header" />
      <!-- 过滤器 -->
      <CFilter v-if="filterConfig" v-show="showSearch" :config="filterConfig" @search="onSearchHandle" />
      <slot name="filter" :search="onSearchHandle" />
      <!-- 工具栏 -->
      <CTools
        v-if="noTools !== true"
        v-model:checkedFieldNames="checkedFieldNames"
        :no-add="noAdd"
        :no-delete="noDelete"
        :has-import="hasImport"
        :has-export="hasExport"
        :has-go-back="hasGoBack"
        :config="toolsConfig"
        :api-config="api"
        :api-method-config="apiMethod"
        :permission-config="permission"
        :columns="columns"
        :pagination="pagination"
        :show-search="showSearch"
        :useToggleSearch="!!filterConfig"
        :useFullscreen="noFullscreen !== true"
        :isFullscreen="isFullScreen"
        @sortColumn="sortColumn"
        @toggleShowSearch="toggleShowSearch"
        @toggleFullScreen="toggleFullScreen"
        @refresh="onRefreshHandle"
        @add="onAddHandle(toolsConfig?.addInitData)"
        @delete="onBatchDeleteHandle"
      />
      <slot name="tools" :refresh="onRefreshHandle" :add="onAddHandle" :delete="onBatchDeleteHandle" />
      <!-- 表格数据 -->
      <CTable
        ref="cTable"
        v-if="tableConfig"
        :primaryKey="primaryKey"
        :no-select="noSelect"
        :config="{
          ...tableConfig,
          columns
        }"
        :filter-auto-search="filterAutoSearch"
        :api-config="api"
        :api-method-config="apiMethod"
        :api-option-config="apiOptionConfig"
        :permission-config="permission"
        :before-search="beforeSearch"
        :after-search="afterSearch"
        @action="onTableActionHandle"
        @resize-column="resizeColumn"
      >
        <!-- 自定义插槽 -->
        <template v-for="sl in tableSlots" #[sl.slot]="options">
          <slot :name="sl.slot" v-bind="options" />
        </template>
      </CTable>
      <!-- 表格部分自定义插槽，需要什么属性添加什么属性 -->
      <slot
        v-if="$slots.table"
        name="table"
        :primaryKey="primaryKey"
        :no-select="noSelect"
        :api-config="api"
        :selectedIds="selectedIds"
        :selectedObjs="selectedObjs"
        :api-method-config="apiMethod"
        :api-option-config="apiOptionConfig"
        :permission-config="permission"
        :before-search="beforeSearch"
        :after-search="afterSearch"
        :action="onActionHandle"
      />
    </div>
    <!-- 弹窗 -->
    <!-- 新增修改详情弹窗页面，如果想自定义不想要默认的弹窗或行为可以通过自定义操作按钮来实现 -->
    <CModal ref="cModal" v-if="formConfig" v-bind="modalConfig?.props" :onCancel="onCancelHandle" :footer="null">
      <!-- :footer="null" -> CModal 和 CForm 都提供了 确认、取消按钮支持，这里为了方便控制按钮状态，使用 CForm 的按钮 -->
      <CForm v-if="isAdd || isEdit || isView" ref="cForm" v-bind="{ detail, isAdd, isEdit, isView, primaryKey, formConfig, ...buttonConfig, beforeSubmit, onSubmitHandle }" />
    </CModal>
  </div>
</template>

<script setup lang="ts" generic="Row extends CrudRecord = CrudRecord">
import CFilter from '@/components/crud/components/c-filter.vue'
import CForm from '@/components/crud/components/c-form.vue'
import CTable from '@/components/crud/components/c-table.vue'
import CTools from '@/components/crud/components/c-tools.vue'
import CTree from '@/components/crud/components/c-tree.vue'
import { useResizableRight } from '@/hooks/useResizableRight'
import type { IsEmptyValue } from '@/utils/index'
import { isNotEmpty } from '@/utils/index'
import { LeftOutlined, RightOutlined } from '@ant-design/icons-vue'
import { useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { useActionHandle } from './hooks/useActionHandle'
import { useApiConfig } from './hooks/useApiConfig'
import { useApiMethodConfig } from './hooks/useApiMethodConfig'
import { usePermissionConfig } from './hooks/usePermissionConfig'
import type {
  CrudFormExpose,
  CrudModalExpose,
  CrudPageEmits,
  CrudPageProps,
  CrudPagination,
  CrudRecord,
  CrudSorter,
  CrudTableColumn,
  CrudTableExpose,
  PageActionParams
} from './types'

const props = withDefaults(defineProps<CrudPageProps<Row>>(), {
  primaryKey: 'id',
  modalConfig: () => ({})
})
const loading = ref(false)
const cTable = ref<CrudTableExpose<Row>>()
const cModal = ref<CrudModalExpose>()
const cForm = ref<CrudFormExpose>()
const columns = ref<CrudTableColumn<Row>[]>([])
const { t } = useI18n()
const selectedIds = ref<(string | number)[]>([])
const selectedObjs = ref<Row[]>([])
const searchParams = ref<Record<string, unknown>>({}) // 当前查询参数，格式化后的数据，实时同步
const showSearch = ref(true)
const checkedFieldNames = ref<string[]>(
  props.tableConfig?.columns
    ?.filter((item) => item.hidden !== true)
    .map((item) => (typeof item.dataIndex === 'string' ? item.dataIndex : '')) ?? []
)
const useTableBorder = ref(0)
const pagination = ref<CrudPagination>({
  showSizeChanger: true,
  showTotal: (total: number) => t('crud.totalPage', { value: total }),
  pageSize: props.tableConfig?.props?.pageSize ?? 10,
  current: 1,
  total: 0
})
const sorter = ref<CrudSorter>({
  field: undefined,
  order: undefined
})
const filterAutoSearch = computed(() => {
  return props.filterConfig?.fields?.some((field) => isNotEmpty(field.defaultValue as IsEmptyValue))
})
const tableSlots = computed(() => {
  const result: { slot: string }[] = []
  columns.value.forEach((column) => {
    if (typeof column.slot === 'string') {
      result.push({ slot: column.slot })
    }
  })
  return result
})
const { api } = useApiConfig<Row>(props.apiConfig) // 接口
const { permission } = usePermissionConfig(props.permissionConfig) // 权限
const { apiMethod } = useApiMethodConfig(props.apiMethodConfig) // 接口请求方式
const emit = defineEmits<CrudPageEmits>()
const {
  isAdd,
  isEdit,
  isView,
  detail,
  formConfig,
  buttonConfig,
  onAddHandle, // 新增按钮点击处理
  onBatchDeleteHandle, // 批量删除处理
  onActionHandle, // 表格中预设按钮点击处理
  onSubmitHandle // 提交表单处理
} = useActionHandle<Row>({
  cModal,
  cForm,
  cTable,
  modalConfig: props.modalConfig,
  api,
  apiMethod,
  permissionConfig: permission,
  transformDetail: props.transformDetail,
  afterOpenModal: props.afterOpenModal,
  primaryKey: props.primaryKey,
  apiOptionConfig: props.apiOptionConfig,
  afterSubmit: props.afterSubmit,
  emit
})
watchSyncEffect(() => {
  columns.value = [...(props.tableConfig?.columns ?? [])]
})

/** 与子组件共享变量 */
provide('c-page.loading', loading)
provide('c-page.selectedIds', selectedIds)
provide('c-page.selectedObjs', selectedObjs)
provide('c-page.searchParams', searchParams)
provide('c-page.pagination', pagination)
provide('c-page.sorter', sorter)
provide('c-page.checkedFieldNames', checkedFieldNames)
provide('c-page.onRefreshHandle', onRefreshHandle)
provide('c-page.onReloadHandle', onReloadHandle)
provide('c-page.useTableBorder', useTableBorder)

const isTreeShow = ref(true)
function toggleTree(): void {
  isTreeShow.value = !isTreeShow.value
}

function onSearchHandle(): void {
  pagination.value.current = 1
  void cTable.value?.search()
}
function onRefreshHandle(): Promise<void> {
  return cTable.value?.refresh() ?? Promise.resolve()
}
function onReloadHandle(): Promise<void> {
  clearSelect()
  return cTable.value?.reload() ?? Promise.resolve()
}
function onCancelHandle(): void {
  cForm.value?.reset()
}
function onTreeSelectHandle(orgId?: string | number): void {
  searchParams.value[props.treeConfig?.searchField ?? 'orgId'] = orgId
  void cTable.value?.search()
}
function toggleShowSearch(): void {
  showSearch.value = !showSearch.value
}
function clearSelect(): void {
  selectedIds.value = []
  selectedObjs.value = []
}

/** 拖拽调整左侧树宽度 */
const treeBoxRef = useTemplateRef<HTMLElement>('treeBox')
const resizerRef = useTemplateRef<HTMLElement>('resizerRef')
const treeMinWidth = 180
const treeMaxWidth = 320
useResizableRight(treeBoxRef, resizerRef, treeMinWidth, treeMaxWidth)

/** CRUD 区域局部全屏 */
const isFullScreen = ref(false)
function toggleFullScreen(): void {
  if (isFullScreen.value) {
    isFullScreen.value = false
  } else {
    isFullScreen.value = true
  }
}
function sortColumn(oldIndex?: number, newIndex?: number): void {
  if (oldIndex === undefined || newIndex === undefined) return
  const moveColumn = columns.value.splice(oldIndex, 1)[0]
  if (moveColumn) {
    columns.value.splice(newIndex, 0, moveColumn)
  }
}
function resizeColumn(dataIndex: string, width: number): void {
  for (const col of columns.value) {
    if (col.dataIndex === dataIndex) {
      col.width = width
      return
    }
  }
}

/** 表格行操作事件（表格组件返回的行数据类型为 CrudRecord，此处收敛为 Row） */
function onTableActionHandle(params: { action: string; record: CrudRecord }): void {
  onActionHandle({ ...params, record: params.record as Row } as PageActionParams<Row>)
}

defineExpose({
  cModal,
  cForm,
  detail,
  selectedIds,
  selectedObjs,
  refresh: onRefreshHandle,
  reload: onReloadHandle,
  onAddHandle,
  onActionHandle,
  clearSelect,
  dataSource: computed(() => cTable.value?.dataSource)
})
</script>

<style lang="less" scoped>
.c-page {
  display: flex;
  &.is-fullscreen {
    position: fixed;
    inset: 0;
    padding: 10px;
    border-radius: 0;
    background-color: var(--ant-colorBgContainer);
  }
  &__tree {
    min-width: calc(v-bind(treeMinWidth) * 1px);
    width: 240px;
    max-width: calc(v-bind(treeMaxWidth) * 1px);
    border-right: solid var(--ant-lineWidth) rgba(100, 100, 100, .1);
    position: relative;
    transition: min-width .3s, max-width .3s;
    .c-tree {
      min-width: 180px;
    }
    &__dragger {
      position: absolute;
      top: 0;
      bottom: 0;
      right: -5px;
      width: 10px;
      cursor: col-resize;
      &:hover {
        &:after {
          content: '';
          position: absolute;
          top: 0;
          bottom: 0;
          width: 2px;
          right: 4px;
          background-color: var(--ant-colorPrimary);
        }
      }
    }
    &__toggle {
      position: absolute;
      right: -5px;
      top: 50%;
      transform: translateY(-50%) scaleX(0);
      height: 40px;
      width: 10px;
      background-color: var(--ant-colorBorder);
      backdrop-filter: blur(10px);
      color: white;
      transition: transform .3s;
      z-index: 2;
    }
    &:hover {
      .c-page__tree__toggle {
        transform: translateY(-50%) scaleX(1);
      }
    }
    &.is-hide {
      min-width: 0px;
      max-width: 0px;
      .c-page__tree__toggle {
        transform: translateY(-50%) scaleX(1);
      }
    }
  }
  &__page {
    flex: auto;
    width: 70%;
  }
}
</style>
