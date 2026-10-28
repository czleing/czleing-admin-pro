<!-- 字段分组-组件 -->
<template>
  <div class="field-group" :class="{ 'is-expand': showContainer }">
    <div v-if="title" class="field-group__title pointer flex-x-between"
      @click="toggle"
    >
      <div>
        <span class="flag"></span>
        <span class="bold">{{ title }}</span>
        <span class="ml10">{{ subTitle }}</span>
      </div>
      <span v-if="$slots.default">
        <RightCircleOutlined class="icon em12 text-gray" :class="{ 'is-show': showContainer}" />
      </span>
    </div>
    <div v-if="$slots.default" class="field-group__container" :class="{ 'is-open': showContainer }">
      <div class="inner-container">
        <div class="px10 pt15 pb2">
          <slot />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { RightCircleOutlined } from '@ant-design/icons-vue'
import { useThemeToken } from '@/hooks/useThemeToken.js'

const props = defineProps({
  title: String,
  subTitle: String
})
const showContainer = ref(true)
const { token } = useThemeToken()

function toggle () {
  showContainer.value = !showContainer.value
}
</script>

<style lang="less" scoped>
.field-group {
  margin-bottom: 15px;
  &__title {
    position: relative;
    padding: 8px 15px;
    padding-left: 20px;
    border-radius: var(--ant-borderRadius);
    line-height: 1;
    background-color: color-mix(in srgb, var(--ant-colorPrimary) 8%, transparent);
    border: solid var(--ant-lineWidth) var(--ant-colorBorderSecondary);
    &:hover {
      opacity: .8;
    }
    & .flag {
      display: inline-block;
      position: absolute;
      top: 6px;
      left: 8px;
      bottom: 6px;
      width: 5px;
      border-radius: 3px;
      background-color: var(--ant-colorPrimary);
    }
    & .icon {
      transition: transform .2s;
      &.is-show {
        transform: rotate(90deg);
      }
    }
  }
  &__container {
    display: grid;
    grid-template-rows: 0fr;
    transition: grid-template-rows .2s;
    overflow: hidden;
    border-style: solid;
    border-width: 0;
    border-radius: 0 0 var(--ant-borderRadius) var(--ant-borderRadius);
    border-color: var(--ant-colorBorderSecondary);
    .inner-container {
      min-height: 0;
    }
    &.is-open {
      grid-template-rows: 1fr;
      border-width: 0 var(--ant-lineWidth) var(--ant-lineWidth) var(--ant-lineWidth);
    }
  }
  &.is-expand {
    .field-group__title {
      border-radius: var(--ant-borderRadius) var(--ant-borderRadius) 0 0;
    }
  }
}
</style>
