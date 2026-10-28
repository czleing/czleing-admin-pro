<!-- 标题栏 -->
<template>
  <div class="title flex-x-between">
    <div class="text bold" :style="`--bgColor: ${token.colorPrimary}`">{{ title }}</div>
    <div class="extra">
      <slot name="extra" />
    </div>
  </div>
</template>

<script setup>
import { useThemeToken } from '@/hooks/useThemeToken.js'

const props = defineProps({
  title: { type: String }
})
const { token } = useThemeToken()

</script>

<style lang="scss" scoped>
.title {
  .text {
    padding-left: 18px;
    position: relative;
    &:before {
      content: '';
      position: absolute;
      top: 2px;
      bottom: 2px;
      left: 2px;
      width: 8px;
      border-radius: 3px;
      background-color: var(--bgColor);
    }
  }
}
</style>
