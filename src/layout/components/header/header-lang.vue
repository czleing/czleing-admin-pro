<!-- 待办消息 -->
<template>
  <div class="header-lang pointer">
    <a-dropdown placement="bottom">
      <img :src="currLang.image" class="curr-lang radius3">
      <template #overlay>
        <a-menu @click="onLangChange">
          <a-menu-item
            v-for="lang in langOptions"
            :key="lang.value"
          >
            <div class="flex-x x-middle">
              <img v-if="lang.image" :src="lang.image" class="radius3" style="height: 16px;">
              <span class="ml8">{{ lang.label }}</span>
            </div>
          </a-menu-item>
        </a-menu>
      </template>
    </a-dropdown>
  </div>
</template>

<script setup>
import { langOptions } from '@/locales/index'
import { useSettingStore } from '@/stores/setting-store';

const settingStore = useSettingStore()
const currLang = computed(() => langOptions.find(item => item.value === settingStore.locale))

function onLangChange (e) {
  settingStore.setLocale(e.key)
}
</script>

<style lang="less" scoped>
.header-lang {
  .curr-lang {
    height: 18px;
    vertical-align: text-top;
    opacity: .7;
  }
}
</style>
