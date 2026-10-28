<script setup>
import { theme } from 'ant-design-vue'
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import zhHK from 'ant-design-vue/es/locale/zh_HK'
import enUs from 'ant-design-vue/es/locale/en_US'
import { useSettingStore } from '@/stores/setting-store.js'
import { useCheckUpdate } from './hooks/useCheckUpdate'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'
import 'dayjs/locale/zh-hk'
import 'dayjs/locale/en'
dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

const settingStore = useSettingStore()

// dayjs 语言动态切换
watch(
  () => settingStore.locale,
  () => {
    dayjs.locale(settingStore.locale)
  }
)

/** ant-design-vue 语言动态切换的 mapping */
const localeMap = {
  'en': enUs,
  'zh-cn': zhCN,
  'zh-hk': zhHK
}
const locale = computed(() => localeMap[settingStore.locale] ?? zhCN)
// 动态主题
const currTheme = computed(() => {
  return {
    token: {
      ...settingStore.theme.token,
      lineWidth: settingStore.useThinLine ? 0.55 : 1,
    },
    algorithm: settingStore.isDark ? theme.darkAlgorithm : theme.defaultAlgorithm
  }
})
// 检测版本更新
useCheckUpdate()
</script>

<template>
  <a-config-provider
    :locale="locale"
    :theme="currTheme"
    :componentSize="settingStore.componentSize"
  >
    <RouterView />
  </a-config-provider>
</template>

<style>
</style>
