<!-- 表格操作按钮组件 -->
<template>
  <div class="c-table-action" @click.stop>
    <template v-for="action in showActions">
      <CTableActionItem :action="action" :record="record" />
    </template>
    <template v-if="moreActions && moreActions.length > 0">
      <!-- 更多 -->
      <a-dropdown>
        <a v-hasPermi="morePermissions" href="javascript:;">
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

<script setup>
import { DownOutlined } from '@ant-design/icons-vue'
import { getFnValue } from '@/utils/index'
import CTableActionItem from './c-table-action-item.vue'

const props = defineProps({
  column: Object,
  record: {
    type: Object,
    default: () => ({})
  },
  permissionConfig: Object
})


/** 所有操作按钮 */
const currActions = computed(() => {
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

function getPermission (action) {
  if (typeof action.callback === 'string') {
    // 预设按钮
    return props.permissionConfig[action.callback]
  } else {
    return action.permission
  }
}

function getCallback (action) {
  if (typeof action.callback === 'string') {
    return () => emits('action', { action: action.callback, record: props.record })
  } else {
    return action.callback
  }
}

const emits = defineEmits(['action'])

</script>

<style lang="scss" scoped>
</style>
