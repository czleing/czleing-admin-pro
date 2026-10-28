<!-- 菜单栏头部LOGO组件 -->
<template>
  <div class="header-logo flex-x x-middle">
    <img :src="settingStore.isDark ? info.logoWhite : info.logo" class="header-logo__img" />
    <span
      class="header-logo__title nowrap ml10 bold em12"
      :class="{
        'text-white': settingStore.isDark
      }"
    >
      {{ info.systemName }}
    </span>
  </div>
</template>

<script setup>
import settings from '@/config/setting.js'
import { useSettingStore } from '@/stores/setting-store.js'

const { websiteInfo: info } = settings
const settingStore = useSettingStore()
</script>

<style lang="scss" scoped>
.header-logo {
  position: relative;
  &__img {
    width: 32px;
    height: 32px;
    object-fit: contain;
    border-radius: 5px;
  }
  &__title {
  }
}
</style>
