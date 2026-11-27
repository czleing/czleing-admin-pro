<script setup lang="ts">
import { useSettingStore } from '@/stores/setting-store'
import { App, ConfigProvider, theme } from 'antdv-next'
import type { Locale } from 'antdv-next/dist/locale'
import enUs from 'antdv-next/locale/en_US'
import zhCN from 'antdv-next/locale/zh_CN'
import zhHK from 'antdv-next/locale/zh_HK'
import dayjs from 'dayjs'
import 'dayjs/locale/en'
import 'dayjs/locale/zh-cn'
import 'dayjs/locale/zh-hk'
import relativeTime from 'dayjs/plugin/relativeTime'
import { h } from 'vue'
import { useCheckUpdate } from './hooks/useCheckUpdate'
dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

const settingStore = useSettingStore()

// dayjs 语言动态切换
watch(
  () => settingStore.locale,
  () => {
    dayjs.locale(settingStore.locale)
  },
  { immediate: true }
)

/** antdv-next 语言动态切换的 mapping */
const localeMap: Record<string, Locale> = {
  'en': enUs,
  'zh-cn': zhCN,
  'zh-hk': zhHK
}
const locale = computed<Locale>(() => localeMap[settingStore.locale] ?? zhCN)
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

// 使 Modal.xxx 等静态方法适配当前主题
ConfigProvider.config({
  holderRender: children =>
    h(ConfigProvider, {
      locale: locale.value,
      theme: currTheme.value,
      componentSize: settingStore.componentSize
    }, {
      default: () => h(App, null, () => children),
    })
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
