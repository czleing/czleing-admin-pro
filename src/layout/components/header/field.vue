<!-- 设置-单个设置项容器组件 -->
<template>
  <div class="field">
    <div v-if="title" class="bold em11 mt15 mb8">{{ title }}</div>
    <div class="field__item flex-x-between gap10" :style="`padding: ${itemPadding}`">
      <div v-if="label" class="label">
        {{ label }}
        <span v-if="tips" class="text-gray em09  ml10">
          <info-circle-filled />
          {{ tips }}
        </span>
        <a-tooltip v-else-if="tooltip" :title="tooltip">
          <info-circle-filled class="text-gray ml10" />
        </a-tooltip>
      </div>
      <div class="value" :class="{'flex-auto': !label}">
        <slot />
      </div>
    </div>
    <div v-if="extra" class="text-gray em09 tr mr10">
      <info-circle-filled />
      {{ extra }}
    </div>
  </div>
</template>
<script setup>
import { InfoCircleFilled } from '@ant-design/icons-vue';

const props = defineProps({
  title: String,
  label: String,
  extra: String,
  tips: String,
  tooltip: String,
  itemPadding: String
})
</script>
<style scoped lang="less">
.field {
  margin: 8px 0;
  &__item {
    padding: 8px 10px;
    border-radius: var(--ant-borderRadiusLG);
    transition: background-color .3s;
    &:hover {
      background-color: color-mix(var(--ant-colorPrimary) 15%, transparent);
    }
  }
}
</style>