<!-- 表格操作按钮组件 -->
<template>
  <div class="c-table-action" @click.stop>
    <template v-for="action in showActions">
      <CTableActionItem :action="action" :record="record" />
    </template>
    <template v-if="moreActions && moreActions.length > 0">
      <!-- 更多 -->
      <a-dropdown>
        <a v-permission="morePermissions" href="javascript:;">
          {{ column.actionMoreText ?? $t('crud.more') }}
          <DownOutlined />
        </a>
        <template #overlay>
          <a-menu>
            <a-menu-item
              v-for="action in moreActions"
              :key="action.name"
            >
              <CTableActionItem :action="action" :record="record" />
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </template>
  </div>
</template>

<script setup lang="ts">
import { DownOutlined } from '@ant-design/icons-vue'
import { getFnValue } from '@/utils/index'
import CTableActionItem from './c-table-action-item.vue'
import type {
  CrudRecord,
  CrudTableColumn,
  NormalizedTableAction,
  ResolvedPermissionConfig,
  TableActionConfig
} from '../types'

const props = withDefaults(
  defineProps<{
    /** 操作列配置 */
    column: CrudTableColumn
    /** 当前行数据 */
    record?: CrudRecord
    /** 权限配置 */
    permissionConfig: ResolvedPermissionConfig
  }>(),
  {
    record: () => ({})
  }
)

/** 所有操作按钮 */
const currActions = computed<NormalizedTableAction[]>(() => {
  const actions = getFnValue(props.column.action, { record: props.record })
  if (!actions) return []
  return actions.map(action => {
    return {
      ...action,
      permission: getPermission(action),
      callback: getCallback(action),
      class: action.class ?? (action.callback === 'delete' ? 'text-danger' : 'text-info'),
      confirm: action.confirm ?? action.callback === 'delete'
    }
  })
})
const showActions = computed(() => {
  const showNum = props.column.actionShowNum ?? 2
  return currActions.value.slice(0, showNum)
})
const moreActions = computed(() => {
  const showNum = props.column.actionShowNum ?? 2
  return currActions.value.slice(showNum)
})
const morePermissions = computed(() => {
  return moreActions.value.map(item => item.permission)
})

function getPermission(action: TableActionConfig): string | undefined {
  if (typeof action.callback === 'string') {
    // 预设按钮
    return props.permissionConfig[action.callback]
  } else {
    return action.permission
  }
}

function getCallback(action: TableActionConfig): NormalizedTableAction['callback'] {
  if (typeof action.callback === 'string') {
    return () => emits('action', { action: action.callback as string, record: props.record })
  }
  return action.callback ?? (() => {})
}

const emits = defineEmits<{
  (e: 'action', params: { action: string; record: CrudRecord }): void
}>()

</script>

<style lang="scss" scoped>
</style>
