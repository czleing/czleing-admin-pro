<!-- CRUD 页面组件 -->
<template>
  <div ref="cPage" class="c-page" :class="{'is-fullscreen': isFullScreen}">
    <div v-if="treeConfig" ref="treeBox" class="c-page__tree mr10 pr10" :class="{'is-hide': !isTreeShow}">
      <!-- 树 -->
      <CTree v-show="isTreeShow" class="c-tree" :config="treeConfig" @selected="onTreeSelectHandle" />
      <div class="c-page__tree__toggle pointer flex-y-center radius6" @click="toggleTree">
        <LeftOutlined class="em06" v-show="isTreeShow" />
        <RightOutlined class="em06" v-show="!isTreeShow" />
      </div>
      <div v-show="isTreeShow" ref="resizerRef" class="c-page__tree__dragger"></div>
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
        @action="onActionHandle"
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

<script setup>
import CFilter from '@/components/crud/components/c-filter.vue'
import CForm from '@/components/crud/components/c-form.vue'
import CTable from '@/components/crud/components/c-table.vue'
import CTools from '@/components/crud/components/c-tools.vue'
import CTree from '@/components/crud/components/c-tree.vue'
import { useSettingStore } from '@/stores/setting-store'
import { isNotEmpty } from '@/utils/index.js'
import { LeftOutlined, RightOutlined } from '@ant-design/icons-vue'
import { useI18n } from 'vue-i18n'
import { useActionHandle } from './hooks/useActionHandle'
import { useApiConfig } from './hooks/useApiConfig'
import { useApiMethodConfig } from './hooks/useApiMethodConfig'
import { usePermissionConfig } from './hooks/usePermissionConfig'
import { useTemplateRef } from 'vue'
import { useResizableRight } from '@/hooks/useResizableRight'

const props = defineProps({
  /** 没有新增按钮，可选 */
  noAdd: Boolean,
  /** 没有删除按钮，可选 */
  noDelete: Boolean,
  /** 没有表格多选框，可选 */
  noSelect: Boolean,
  /** 没有操作栏，可选 */
  noTools: Boolean,
  /** 没有全屏按钮，可选 */
  noFullscreen: Boolean,
  /** 有返回按钮，可选 */
  hasGoBack: Boolean,
  /** 有导入按钮，可选 */
  hasImport: Boolean,
  /** 有导出按钮，可选 */
  hasExport: Boolean,
  /** 主键字段名，默认 id */
  primaryKey: { type: String, default: 'id' },
  /** 操作栏配置，可选 */
  toolsConfig: Object,
  /** 接口配置，可选，默认根据路由及功能生成（如：新增：/system/user -> /system/user/add） */
  apiConfig: Object,
  /** 接口请求方式配置，可选，默认根据是否使用restfull风格自动生成，不使用restfull则全部post请求 */
  apiMethodConfig: Object,
  /** 接口请求其他配置，如：headers, content-type 等，可选 */
  apiOptionConfig: Object,
  /** 权限配置，可选，默认根据路由及功能生成（如：新增：/system/user -> system:user:add） */
  permissionConfig: Object,
  /** 左侧树形控件配置，可选 */
  treeConfig: Object,
  /** 过滤条件配置，可选 */
  filterConfig: Object,
  /** 表格配置，可选，也可以通过插槽自定义实现表格部分，比如需要以卡片形式展示 */
  tableConfig: Object,
  /** 增改查弹窗配置，可选 */
  modalConfig: { type: Object, default: () => ({}) },
  /** 查询前修改查询参数，可选，params => ({ ...params, type: 1 }) */
  beforeSearch: Function,
  /** 查询后修改查询结果，可选，list => list.map(...) */
  afterSearch: Function,
  /** 提交表单前修改表单数据，可选，data => ({...}) */
  beforeSubmit: Function,
  /** 提交表单成功后执行，可选，formData => ({...}) */
  afterSubmit: Function,
  /** 编辑或查看详情时转换详情数据，可选，detail => ({...}) */
  transformDetail: Function,
  /** 弹出表单弹窗后执行，可做一些新增、编辑、查看详情前的数据准备工作，可选，({ isAdd, isEdit, isView }) => {} */
  afterOpenModal: Function,
})
const loading = ref(false)
const cTable = ref()
const cModal = ref()
const cForm = ref()
const columns = ref()
const { t } = useI18n()
const selectedIds = ref([])
const selectedObjs = ref([])
const searchParams = ref({}) // 当前查询参数，格式化后的数据，实时同步
const showSearch = ref(true)
const checkedFieldNames = ref(props.tableConfig?.columns?.filter(item => item.hidden !== true)?.map(item => item.dataIndex))
const settingStore = useSettingStore()
const useTableBorder = ref(0)
const pagination = ref({
  showSizeChanger: true,
  showTotal: (total, range) => t('crud.totalPage', { value: total }),
  pageSize: props.tableConfig?.props?.pageSize ?? 10,
  current: 1,
  total: 0
})
const sorter = ref({
  field: undefined,
  order: undefined
})
const filterAutoSearch = computed(() => {
  return props.filterConfig?.fields?.some(field => isNotEmpty(field.defaultValue))
})
const tableSlots = computed(() => columns.value?.filter(column => column.slot))
const { api } = useApiConfig(props.apiConfig) // 接口
const { permission } = usePermissionConfig(props.permissionConfig) // 权限
const { apiMethod } = useApiMethodConfig(props.apiMethodConfig) // 接口请求方式
const emit = defineEmits(['added', 'updated', 'deleted'])
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
} = useActionHandle({
  cModal,
  cForm,
  cTable,
  modalConfig: props.modalConfig,
  api,
  apiMethod,
  transformDetail: props.transformDetail,
  afterOpenModal: props.afterOpenModal,
  primaryKey: props.primaryKey,
  apiOptionConfig: props.apiOptionConfig,
  afterSubmit: props.afterSubmit,
  emit
})
watchSyncEffect(() => {
  columns.value = [...props.tableConfig?.columns]
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
function toggleTree () {
  isTreeShow.value = !isTreeShow.value
}

function onSearchHandle () {
  pagination.value.current = 1
  cTable.value.search()
}
function onRefreshHandle () {
  cTable.value.refresh()
}
function onReloadHandle () {
  clearSelect()
  cTable.value.reload()
}
function onCancelHandle () {
  cForm.value?.reset()
}
function onTreeSelectHandle (orgId) {
  searchParams.value[props.treeConfig?.searchField ?? 'orgId'] = orgId
  cTable.value.search()
}
function toggleShowSearch () {
  showSearch.value = !showSearch.value
}
function clearSelect () {
  selectedIds.value = []
  selectedObjs.value = []
}

/** 拖拽调整左侧树宽度 */
let treeBoxRef = useTemplateRef('treeBox')
let resizerRef = useTemplateRef('resizerRef')
const treeMinWidth = 180
const treeMaxWidth = 320
useResizableRight(treeBoxRef, resizerRef, treeMinWidth, treeMaxWidth)

/** CRUD 区域局部全屏 */
const isFullScreen = ref(false)
function toggleFullScreen () {
  if (isFullScreen.value) {
    isFullScreen.value = false
  } else {
    isFullScreen.value = true
  }
}
function sortColumn (oldIndex, newIndex) {
  const moveColumn = columns.value.splice(oldIndex, 1)[0]
  columns.value.splice(newIndex, 0, moveColumn)
}
function resizeColumn (dataIndex, width) {
  const col = columns.value.find(item => item.dataIndex === dataIndex)
  col && (col.width = width)
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
