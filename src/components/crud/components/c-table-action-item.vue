<!-- c-page 表格行操作按钮组件 -->
<template>
  <template v-if="action.confirm">
    <!-- 带确认框 -->
    <a-popconfirm
      placement="left"
      :title="action.confirmContent ?? $t('crud.confirmDoIt', { text: action.name ? `[${ action.name }]` : $t('crud.this') })"
      @confirm="action.callback({ record })"
    >
      <component v-if="action.customRender" :is="action.customRender({ record })" v-permission="action.permission" />
      <a v-else-if="action.name || action.icon" v-permission="action.permission" href="javascript:;" :class="action.class">
        <a-icon v-if="action.icon" :type="action.icon" />
        {{ action.name }}
      </a>
    </a-popconfirm>
  </template>
  <template v-else>
    <component v-if="action.customRender" :is="action.customRender({ record })" v-permission="action.permission" />
    <a v-else-if="action.name || action.icon" v-permission="action.permission" href="javascript:;" :class="action.class" @click="action.callback({ record })">
      <a-icon v-if="action.icon" :type="action.icon" />
      {{ action.name }}
    </a>
  </template>
</template>

<script setup lang="ts">
import type { CrudRecord, NormalizedTableAction } from '../types'

defineProps<{
  /** 操作按钮配置 */
  action: NormalizedTableAction
  /** 当前行数据 */
  record: CrudRecord
}>()
</script>

<style lang="scss" scoped>
</style>
