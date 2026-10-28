<!-- c-page 工具栏组件 -->
<template>
  <div class="c-tools mb10 flex-x-between">
    <div>
      <a-space>
        <!-- 新增 -->
        <a-button v-if="noAdd !== true" v-hasPermi="permissionConfig.add" type="primary" :icon="h(PlusOutlined)" @click="onAddHandle">
          {{ config?.addBtnText ?? $t('crud.add') }}
        </a-button>
        <!-- 批量删除 -->
        <a-button v-if="noDelete !== true" v-hasPermi="permissionConfig.delete" type="primary" danger :icon="h(DeleteOutlined)" :disabled="selectNum === 0" @click="onDeleteHandle">{{ $t('crud.batchDelete') }} {{ selectNum > 0 ? `(${ selectNum })` : '' }}</a-button>
        <!-- 自定义按钮 -->
        <template v-for="(btn, index) in config?.otherTools">
          <!-- 自定义按钮 -->
          <a-button
            v-if="!btn.component || btn.component === 'a-button'"
            :key="index"
            v-hasPermi="btn.permission"
            v-bind="{ ...btn.props, disabled: getFnValue(btn.props.disabled, callbackParams), icon: undefined, onClick: undefined }"
            @click="onToolClickHandle(btn)"
          >
            <template #icon v-if="btn.props.icon">
              <a-icon :type="btn.props.icon" />
            </template>
            {{ getFnValue(btn.name, callbackParams) }}
          </a-button>
          <!-- 自定义组件 -->
          <component v-else :is="btn.component" v-hasPermi="btn.permission" v-bind="{ ...btn.props, disabled: getFnValue(btn.props.disabled, callbackParams) }" v-on="getFnValue(btn.on ?? {}, callbackParams)" />
        </template>
        <!-- 导入 -->
        <CImport v-if="hasImport" v-hasPermi="permissionConfig.import" :url="apiConfig.import" :template-url="apiConfig.importTemplate" @success="onImportSuccessHandle" />
        <!-- 导出 -->
        <a-button v-if="hasExport" v-hasPermi="permissionConfig.export" type="dashed" :icon="h(ExportOutlined)" @click="onExportHandle">{{ $t('crud.export') }} {{ selectNum > 0 ? `(${ selectNum })` : '' }}</a-button>
        <!-- 返回 -->
        <a-button v-if="hasGoBack" :icon="h(RollbackOutlined)" @click="$router.back()">{{ config?.backBtnText ?? $t('crud.back') }}</a-button>
      </a-space>
    </div>
    <a-space>
      <!-- 隐藏搜索区 -->
      <a-button title="隐藏/展开搜索区" v-if="useToggleSearch" :type="showSearch ? 'default' : 'primary'" @click="onToggleShowSearchHandle">
        <template #icon>
          <SearchOutlined class="em09" />
        </template>
      </a-button>
      <!-- 刷新 -->
      <a-button title="刷新列表" :loading="loading" @click="onRefreshHandle">
        <template v-if="!loading" #icon>
          <SyncOutlined class="em09" />
        </template>
      </a-button>
      <!-- CRUD全屏 -->
      <a-button v-if="useFullscreen" title="全屏" @click="onToggleFullScreenHandle">
        <template #icon>
          <FullscreenExitOutlined v-if="isFullscreen" class="em09" />
          <FullscreenOutlined v-else class="em09" />
        </template>
      </a-button>
      <!-- 筛选列 -->
      <a-dropdown placement="bottomLeft">
        <a-button title="列设置" :icon="h(FilterOutlined)" class="em09" />
        <template #overlay>
          <a-checkbox-group :value="checkedFieldNames" @change="onFieldsFilterChange">
            <div class="c-tools__overlay">
              <div class="border-bottom flex-x-center pt5 pb10 mb10" @click.stop>
                <a-segmented v-model:value="useTableBorder" :options="tableBorderOptions" />
              </div>
              <div ref="listContainer" class="c-tools__menus">
                <div v-for="column in currColumns" :key="column.dataIndex" @click.stop>
                  <div class="c-tools__menus__item">
                    <div class="flex-x-between">
                      <a-checkbox :value="column.dataIndex" class="pointer" @click.stop>{{ column.title }}</a-checkbox>
                      <div @click.stop>
                        <HolderOutlined class="draggable" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </a-checkbox-group>
        </template>
      </a-dropdown>
    </a-space>
  </div>
</template>

<script setup>
import { PlusOutlined, DeleteOutlined, ExportOutlined, RollbackOutlined, SyncOutlined, FilterOutlined, SearchOutlined, HolderOutlined, BorderInnerOutlined, FullscreenOutlined, FullscreenExitOutlined } from '@ant-design/icons-vue'
import CImport from './c-import.vue'
import { Modal } from 'ant-design-vue'
import { h } from 'vue'
import { getFnValue } from '@/utils'
import axios from '@/api/index.js'
import { useSortable } from '@/hooks/useSortable.js'

const props = defineProps({
  /** 没有新增按钮 */
  noAdd: Boolean,
  /** 没有删除按钮 */
  noDelete: Boolean,
  /** 有返回按钮 */
  hasGoBack: Boolean,
  /** 有导入按钮 */
  hasImport: Boolean,
  /** 有导出按钮 */
  hasExport: Boolean,
  /** 是否显示搜索区 */
  showSearch: Boolean,
  /** 工具栏配置 */
  config: Object,
  /** 接口配置 */
  apiConfig: Object,
  /** 接口请求方式配置 */
  apiMethodConfig: Object,
  /** 权限配置 */
  permissionConfig: Object,
  /** 列字段配置 */
  columns: Array,
  /** 分页信息 */
  pagination: Object,
  /** 选中的要展示的列字段名数组 */
  checkedFieldNames: Array,
  /** 是否使用查询区切换按钮 */
  useToggleSearch: { type: Boolean, default: true },
  /** 是否使用全屏按鈕 */
  useFullscreen: { type: Boolean, default: true },
  /** 是否全屏 */
  isFullscreen: { type: Boolean, default: false }
})

const selectedIds = inject('c-page.selectedIds', ref([]))
const selectedObjs = inject('c-page.selectedObjs', ref([]))
const searchParams = inject('c-page.searchParams', ref({}))
const loading = inject('c-page.loading', ref(false))
const refreshTable = inject('c-page.onRefreshHandle', undefined)
const useTableBorder = inject('c-page.useTableBorder', ref(0))
const tableBorderOptions = [
  { label: '?', value: 0, title: '默认' },
  { label: '田', value: 1, title: '网格' },
  { label: '☰', value: 2, title: '横边框' },
]
const selectNum = computed(() => selectedIds.value.length)
const callbackParams = computed(() => ({
  selectedIds: selectedIds.value,
  selectedObjs: selectedObjs.value,
  pagination: props.pagination ?? {}
}))
const currColumns = computed(() => props.columns.filter(item => !item.action))

// 拖拽排序
const listContainer = ref(null)
const { setEnabled } = useSortable(listContainer, null, {
  handle: '.draggable',
  direction: 'vertical',
  animation: 180,
  onSortEnd: (evt) => {
    emits('sortColumn', evt.oldIndex, evt.newIndex)
  }
})

function onAddHandle () {
  emits('add')
}
function onDeleteHandle () {
  emits('delete', selectedIds.value)
}
function onImportSuccessHandle () {
  refreshTable()
}
function onExportHandle () {
  if (selectNum.value > 0) { // 有勾选，按选中的导出
    Modal.confirm({
      title: '温馨提示',
      content: () => h('div', [
        '确定导出以下选中的',
        h('b', { class: 'text-danger mx5' }, [`${selectedIds.value.length}`]),
        '项数据记录？'
      ]),
      async onOk () {
        await axios[props.apiMethodConfig.export](props.apiConfig.export, { ids: selectedIds.value }, { responseType: 'blob' })
        selectedIds.value = []
        selectedObjs.value = []
      }
    })
  } else { // 按查询条件导出
    Modal.confirm({
      title: '温馨提示',
      content: '确定根据当前条件导出所有数据？',
      async onOk () {
        await axios[props.apiMethodConfig.export](props.apiConfig.export, searchParams.value, { responseType: 'blob' })
      }
    })
  }
}
function onToolClickHandle (btn) {
  if (typeof btn.props?.onClick === 'function') {
    btn.props?.onClick(callbackParams.value)
  }
}

const emits = defineEmits(['add', 'delete', 'refresh', 'update:checkedFieldNames', 'toggleShowSearch', 'sortColumn', 'toggleFullScreen'])
function onToggleShowSearchHandle () {
  emits('toggleShowSearch')
}
function onToggleFullScreenHandle () {
  emits('toggleFullScreen')
}
function onRefreshHandle () {
  emits('refresh')
}
function onFieldsFilterChange (values) {
  emits('update:checkedFieldNames', values)
}
</script>

<style lang="less" scoped>
.c-tools {
  &__overlay {
    background-color: var(--ant-colorBgElevated);
    box-shadow: 0 5px 20px rgba(0, 0, 0, .1);
    border-radius: var(--ant-borderRadiusLG);
    padding: 5px;
  }
  &__menus {
    max-height: 80vh;
    overflow: auto;
    &__item {
      padding: 5px 8px;
      border-radius: var(--ant-borderRadius);
      &:hover {
        background-color: var(--ant-colorFillSecondary);
      }
      .draggable {
        cursor: move;
      }
    }
  }
}
</style>
