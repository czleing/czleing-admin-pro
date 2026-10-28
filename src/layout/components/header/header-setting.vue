<template>
  <div class="header-setting">
    <a-tooltip placement="top" :title="$t('frame.themeSetting')">
      <SettingOutlined class="font18" @click="openSetting" />
    </a-tooltip>
    <CModal ref="settingModal" :title="$t('frame.setting')" width="420" mode="drawer" :footer="null">
      <a-segmented v-model:value="settingTab" :options="settingTabs" block />
      <div class="mt20">
        <div v-show="settingTab === 'theme'">
          <!-- 选择主题 -->
          <Field :title="$t('frame.selectTheme')" item-padding="3px 10px">
            <div class="flex-x-between gap10">
              <a-select v-model:value="settingStore.themeName" style="width: 150px;" @change="handleChange">
                <a-select-option
                  v-for="(item, index) in settingStore.themes"
                  :key="item.name"
                  :value="item.name"
                >
                  {{ $t(item.name) }}
                </a-select-option>
              </a-select>
              <div class="flex-x x-middle gap5">
                <a-tooltip
                  v-if="!settingStore.theme.isDiy"
                  placement="top"
                  v-for="(kv, index) in currColors"
                  :key="index"
                >
                  <template #title>
                    <span>{{ kv[0] }}: {{ kv[1] }}</span>
                  </template>
                  <span class="color-box" :style="{ backgroundColor: kv[1] }" />
                </a-tooltip>
              </div>
            </div>
          </Field>
          <div v-if="settingStore.theme.isDiy">
            <div class="theme-diy flex-y pl15">
              <label v-for="[key, value] in Object.entries(settingStore.theme.token)" class="theme-diy__item flex-x-between gap10">
                <div class="label">
                  <span>{{ $t(`frame.${key}`) }}</span>
                  <span v-if="key === 'colorInfo'" class="em09 ml text-primary pointer" @click.prevent="settingStore.theme.token[key] = settingStore.theme.token.colorPrimary">
                    {{ $t('frame.usePrimaryColor') }}
                  </span>
                </div>
                <input type="color" :value="settingStore.theme.token[key]" class="value" @input="e => handleColorInput(e, key)" />
              </label>
            </div>
          </div>
          <Field :label="$t('frame.themeMode')" item-padding="3px 10px">
            <a-segmented :value="mode" :options="modeOptions">
              <template #label="{ value, payload = {} }">
                <div class="flex-x x-middle gap5" @click="onModeChange($event, value)">
                  <div v-if="payload.icon" class="flex-y-center" v-html="payload.icon"></div>
                  <span>{{ payload.label }}</span>
                </div>
              </template>
            </a-segmented>
          </Field>
          <Field :label="$t('frame.modeAnimate')" item-padding="3px 10px">
            <a-segmented v-model:value="settingStore.modeAnimate" :options="modeAniOptions" />
          </Field>
          <Field :label="$t('frame.useBg')">
            <a-switch v-model:checked="settingStore.useBg" />
          </Field>
          <div v-show="settingStore.useBg" class="">
            <div class="grid cols4 gap10 pl10">
              <template v-for="item in bgImageOptions" :key="item.src">
                <img
                  v-if="item.src"
                  :src="item.src"
                  width="100%"
                  height="50"
                  draggable="false"
                  class="check-icon pointer"
                  :class="{ 'is-checked': settingStore.bgImage === item.src }"
                  @click="settingStore.bgImage = item.src"
                />
                <div v-else class="check-icon border pointer" :class="{'is-checked': bgIsDiy}" @click="settingStore.bgImage = ''">
                  <div class="flex-y-center" style="height: 50px;">
                    <span class="text-primary">{{ $t('frame.bgDiy') }}</span>
                  </div>
                </div>
              </template>
            </div>
            <Field v-if="bgIsDiy" :label="$t('frame.bgImage')" item-padding="3px 10px">
              <a-input v-model:value="settingStore.bgImage" placeholder="http://" style="width: 280px;" />
            </Field>
            <Field :label="$t('frame.bgBlur')">
              <div class="flex-x x-middle gap5">
                <a-slider v-model:value="settingStore.bgBlur" :step="1" :min="0" :max="50" style="width:120px;margin: 5px;" />
                <div class="w38">{{ settingStore.bgBlur }}px</div>
              </div>
            </Field>
            <Field :label="$t('frame.bgOpacity')">
              <div class="flex-x x-middle gap5">
                <a-slider v-model:value="settingStore.bgOpacity" :step="0.01" :min="0" :max="1" style="width:120px;margin: 5px;" />
                <div class="w38">{{ parseInt(settingStore.bgOpacity * 100) }}%</div>
              </div>
            </Field>
          </div>
        </div>
        <div v-show="settingTab === 'layout'">
          <!-- 菜单布局 -->
          <div>
            <div class="bold em11 mt15 mb8">{{ $t('frame.menu') }}</div>
            <div class="flex-x-around gap15 pl10">
              <div v-for="item in menuLayoutOptions" :key="item.value" class="flex-y-center gap5 pt5 pointer" @click="settingStore.menuLayout = item.value">
                <component :is="item.icon" class="check-icon" :class="{'is-checked': settingStore.menuLayout === item.value}" width="90" height="60" />
                <div>{{ item.label }}</div>
              </div>
            </div>
          </div>
          <Field v-if="settingStore.menuLayout === 'left'" :label="$t('frame.useBreadcrumbs')">
            <a-switch v-model:checked="settingStore.useBreadcrumbs" />
          </Field>
          <template v-else>
            <Field :label="$t('frame.firstMenuMode')" item-padding="3px 10px">
              <a-segmented v-model:value="settingStore.firstMenuMode" :options="firstMenuModeOptions" />
            </Field>
            <Field :label="$t('frame.firstMenuAlign')" item-padding="3px 10px">
              <a-segmented v-model:value="settingStore.firstMenuAlign" :options="firstMenuAlignOptions" />
            </Field>
          </template>
          <Field v-show="settingStore.menuLayout === 'top-left'" :label="$t('frame.autoOpenChildMenu')" :tooltip="$t('frame.autoOpenChildMenuTooltip')">
            <a-switch v-model:checked="settingStore.autoOpenChildMenu" />
          </Field>
          <Field :label="$t('frame.layoutDivide')" item-padding="3px 10px">
            <a-segmented v-model:value="settingStore.layoutDivide" :options="layoutDivideOptions" />
          </Field>
          <Field :label="$t('frame.useFooter')">
            <a-switch v-model:checked="settingStore.useFooter" />
          </Field>
          <Field v-if="settingStore.menuLayout !== 'top'" :label="$t('frame.leftMenuWidth')">
            <div class="flex-x x-middle gap5">
              <a-slider v-model:value="settingStore.leftMenuWidth" :step="10" :min="200" :max="400" style="width:120px;margin: 5px;" />
              <div class="w38">{{ settingStore.leftMenuWidth }}px</div>
            </div>
          </Field>
          <Field :label="$t('frame.topHeaderHeight')">
            <div class="flex-x x-middle gap5">
              <a-slider v-model:value="settingStore.topHeaderHeight" :step="1" :min="48" :max="64" style="width:120px;margin: 5px;" />
              <div class="w38 tr">{{ settingStore.topHeaderHeight }}px</div>
            </div>
          </Field>
          <!-- Tabs 标签 -->
          <Field :title="$t('frame.tabs')" :label="$t('frame.useTabs')">
            <a-switch v-model:checked="settingStore.useTabs" />
          </Field>
          <Field v-show="settingStore.useTabs" :label="$t('frame.tabType')" item-padding="3px 10px">
            <a-segmented v-model:value="settingStore.tabType" :options="tabTypeOptions" />
          </Field>
          <Field :label="$t('frame.tabAnimate')" item-padding="3px 10px">
            <a-segmented v-model:value="settingStore.tabAnimate" :options="tabAniOptions" />
          </Field>
          <Field v-show="settingStore.useTabs" :label="$t('frame.useTabIcon')">
            <a-switch v-model:checked="settingStore.useTabIcon" />
          </Field>
          <Field v-show="settingStore.useTabs" :label="$t('frame.useTabClose')">
            <a-switch v-model:checked="settingStore.useTabClose" />
          </Field>
          <Field v-show="settingStore.useTabs" :label="$t('frame.useTabFavorite')">
            <a-switch v-model:checked="settingStore.useTabFavorite" />
          </Field>
        </div>
        <!-- 其他 -->
        <div v-show="settingTab === 'other'">
          <!-- 语言 -->
          <Field :title="$t('frame.lang')" :label="$t('frame.selectLang')" item-padding="3px 10px">
            <a-select v-model:value="settingStore.locale" style="width: 150px;" @change="handleLocalChange">
              <a-select-option
                v-for="lang in langOptions"
                :key="lang.value"
                :value="lang.value"
              >
                <div class="flex-x x-middle">
                  <img v-if="lang.image" :src="lang.image" class="radius3" style="height: 16px;" >
                  <span class="ml8">{{ lang.label }}</span>
                </div>
              </a-select-option>
            </a-select>
          </Field>
          <!-- 其他 -->
          <Field :title="$t('frame.other')" :label="$t('frame.componentSize')" item-padding="3px 10px">
            <a-segmented v-model:value="settingStore.componentSize" :options="sizeOptions" />
          </Field>
          <Field :label="$t('frame.useTableBorder')">
            <a-switch v-model:checked="settingStore.useTableBorder" />
          </Field>
          <Field :label="$t('frame.useThinLine')" :tips="$t('frame.useThinLineExtra')">
            <a-switch v-model:checked="settingStore.useThinLine" />
          </Field>
          <Field :label="$t('frame.showWeather')">
            <a-switch v-model:checked="settingStore.useWeather" />
          </Field>
          <Field :label="$t('frame.useDynamicPageTitle')">
            <a-switch v-model:checked="settingStore.useDynamicPageTitle" @change="onSwitchPageTitleChange" />
          </Field>
          <Field :label="$t('frame.useWatermark')">
            <a-switch v-model:checked="settingStore.useWatermark" />
          </Field>
          <Field v-if="settingStore.isCn" :label="$t('frame.useWanSplit')" :tips="numFormat(123456.789)">
            <a-switch v-model:checked="settingStore.useWanSplit" />
          </Field>
        </div>
      </div>
      <template #extra>
        <a-popconfirm :title="$t('frame.restoreSettingsConfirm')" @confirm="settingStore.restoreSettings">
          <a-button :icon="h(UndoOutlined)" size="small">{{ $t('frame.restoreSettings') }}</a-button>
        </a-popconfirm>
      </template>
    </CModal>
  </div>
</template>

<script setup>
import { useNumFormat } from '@/hooks/useNumFormat.js'
import useViewTransition from '@/hooks/useViewTransition.js'
import { langOptions } from '@/locales/index'
import { useSettingStore } from '@/stores/setting-store.js'
import { SettingOutlined, UndoOutlined } from '@ant-design/icons-vue'
import settings from '@/config/setting.js'
import { h } from 'vue'
import Field from './field.vue'
import Left from './icons/left.vue'
import TopLeft from './icons/top-left.vue'
import Top from './icons/top.vue'


const settingStore = useSettingStore()
settingStore.watchSysMode()
const { startViewTransition } = useViewTransition()
const settingModal = ref()
const currColors = computed(() => Object.entries(settingStore.theme?.token))
const { t } = useI18n()
const { numFormat } = useNumFormat()
const route = useRoute()

const bgImageOptions = computed(() => [
  { src: import.meta.env.VITE_APP_CONTEXT_PATH + 'assets/page-bg-1.jpg' },
  { src: import.meta.env.VITE_APP_CONTEXT_PATH + 'assets/page-bg-2.jpg' },
  { src: import.meta.env.VITE_APP_CONTEXT_PATH + 'assets/page-bg-3.jpg' },
  { src: import.meta.env.VITE_APP_CONTEXT_PATH + 'assets/page-bg-4.jpg' },
  { src: import.meta.env.VITE_APP_CONTEXT_PATH + 'assets/page-bg-5.jpg' },
  { src: import.meta.env.VITE_APP_CONTEXT_PATH + 'assets/page-bg-6.jpg' },
  { src: import.meta.env.VITE_APP_CONTEXT_PATH + 'assets/page-bg-7.jpg' },
  { src: '' },
])
const bgIsDiy = computed(() => !bgImageOptions.value.map(i => i.src).filter(Boolean).includes(settingStore.bgImage))
const menuLayoutOptions = computed(() => [
  { value: 'top', label: t('frame.top'), icon: Top },
  { value: 'left', label: t('frame.left'), icon: Left },
  { value: 'top-left', label: t('frame.topLeft'), icon: TopLeft },
])
const firstMenuModeOptions = computed(() => [
  { label: t('frame.firstMenuModeLine'), value: 'line' },
  { label: t('frame.firstMenuModeCard'), value: 'card' },
])
const firstMenuAlignOptions = computed(() => [
  { label: t('frame.firstMenuAlignLeft'), value: 'start' },
  { label: t('frame.firstMenuAlignCenter'), value: 'center' },
  { label: t('frame.firstMenuAlignRight'), value: 'end' },
])
const mode = ref(settingStore.useAutoMode ? 'auto' : settingStore.mode)
const modeOptions = computed(() => [
  { value: 'light', payload: { label: t('frame.modeLight'), icon: '<svg t="1788400712642" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="14613" width="22" height="22"><path d="M501.48 493.55m-233.03 0a233.03 233.03 0 1 0 466.06 0 233.03 233.03 0 1 0-466.06 0Z" fill="#F9C626" p-id="14614"></path><path d="M501.52 185.35H478.9c-8.28 0-15-6.72-15-15V87.59c0-8.28 6.72-15 15-15h22.62c8.28 0 15 6.72 15 15v82.76c0 8.28-6.72 15-15 15zM281.37 262.76l-16 16c-5.86 5.86-15.36 5.86-21.21 0l-58.52-58.52c-5.86-5.86-5.86-15.36 0-21.21l16-16c5.86-5.86 15.36-5.86 21.21 0l58.52 58.52c5.86 5.86 5.86 15.35 0 21.21zM185.76 478.48v22.62c0 8.28-6.72 15-15 15H88c-8.28 0-15-6.72-15-15v-22.62c0-8.28 6.72-15 15-15h82.76c8.28 0 15 6.72 15 15zM270.69 698.63l16 16c5.86 5.86 5.86 15.36 0 21.21l-58.52 58.52c-5.86 5.86-15.36 5.86-21.21 0l-16-16c-5.86-5.86-5.86-15.36 0-21.21l58.52-58.52c5.85-5.86 15.35-5.86 21.21 0zM486.41 794.24h22.62c8.28 0 15 6.72 15 15V892c0 8.28-6.72 15-15 15h-22.62c-8.28 0-15-6.72-15-15v-82.76c0-8.28 6.72-15 15-15zM706.56 709.31l16-16c5.86-5.86 15.36-5.86 21.21 0l58.52 58.52c5.86 5.86 5.86 15.36 0 21.21l-16 16c-5.86 5.86-15.36 5.86-21.21 0l-58.52-58.52c-5.86-5.85-5.86-15.35 0-21.21zM802.17 493.59v-22.62c0-8.28 6.72-15 15-15h82.76c8.28 0 15 6.72 15 15v22.62c0 8.28-6.72 15-15 15h-82.76c-8.28 0-15-6.72-15-15zM717.24 273.44l-16-16c-5.86-5.86-5.86-15.36 0-21.21l58.52-58.52c5.86-5.86 15.36-5.86 21.21 0l16 16c5.86 5.86 5.86 15.36 0 21.21l-58.52 58.52c-5.86 5.86-15.35 5.86-21.21 0z" fill="#F9C626" p-id="14615"></path></svg>' } },
  { value: 'dark', payload: { label: t('frame.modeDark'), icon: '<svg t="1788400799046" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="16187" width="22" height="22"><path d="M505.4 878.6c-196.7 0-358-150.9-374.9-343.1 1-18.6 16.1-33.4 34.9-33.4 10.8 0 20.5 4.8 26.9 12.4 0.2 0.3 0.5 0.1 0.5-0.7 41.6 44.2 100.5 71.9 166.1 71.9 127.1 0 230.1-103 230.1-230.1 0-66.1-28-125.1-72.6-166.8 0.1-0.1 0.5-0.1 0.3-0.3-7-6.5-11.4-15.7-11.4-26.1 0-19 14.9-34.1 33.7-35.3 192.1 17.1 342.9 178.3 342.9 375 0 208-168.5 376.5-376.5 376.5z" fill="#03E8F7" p-id="16188"></path></svg>' } },
  { value: 'auto', payload: { label: t('frame.modeAuto'), icon: '<svg t="1788400895717" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="18278" width="22" height="22"><path d="M91.83 661.86c1.87 34.09 30.28 60.65 64.43 60.22h331.23v91.74H360.74c-13.34 0-24.16 10.82-24.16 24.16s10.82 24.16 24.16 24.16h302.53c13.34 0 24.16-10.82 24.16-24.16s-10.82-24.16-24.16-24.16H536.51v-91.74h331.24c34.14 0.43 62.55-26.13 64.43-60.22v-55.32H91.83v55.32zM867.74 161.86H156.26c-34.93-0.39-63.66 27.41-64.43 62.33v328.43h840.34V224.19c-0.77-34.93-29.5-62.72-64.43-62.33z" fill="#707070" p-id="18279"></path></svg>' }},
])
const modeAniOptions = computed(() => [
  { label: t('frame.modeAnimateFade'), value: 'fade' },
  { label: t('frame.modeAnimateCircle'), value: 'circle' },
  { label: t('frame.modeAnimateLine'), value: 'line' },
])
const sizeOptions = computed(() => [
  { label: t('frame.small'), value: 'small' },
  { label: t('frame.middle'), value: 'middle' },
  { label: t('frame.large'), value: 'large' },
])
const layoutDivideOptions = computed(() => [
  { label: t('frame.layoutDivideNone'), value: '' },
  { label: t('frame.layoutDivideLine'), value: 'line' },
  { label: t('frame.layoutDivideShadow'), value: 'shadow' },
  { label: t('frame.layoutDivideRound'), value: 'round' },
])
const tabAniOptions = computed(() => [
  { label: t('frame.tabAnimateNone'), value: '' },
  { label: t('frame.tabAnimateSlideRight'), value: 'slide-right' },
  { label: t('frame.tabAnimateFade'), value: 'fade' },
  { label: t('frame.tabAnimateScale'), value: 'scale' },
])
const tabTypeOptions = computed(() => [
  { label: t('frame.tabTypeTab'), value: 'tab' },
  { label: t('frame.tabTypeCard'), value: 'card' },
  { label: t('frame.tabTypeLine'), value: 'line' },
])
const settingTab = ref('theme')
const settingTabs = computed(() => [
  { label: t('frame.theme'), value: 'theme' },
  { label: t('frame.layout'), value: 'layout' },
  { label: t('frame.other'), value: 'other' },
])

const openSetting = () => {
  settingModal.value.open()
}
const closeSetting = () => {
  settingModal.value.close()
}

const handleChange = name => {
  settingStore.setThemeByName(name)
}
const handleLocalChange = lc => {
  settingStore.setLocale(lc)
}
const onSwitchPageTitleChange = (checked) => {
  document.title = (checked ? route.meta?.title + ' | ' : '') + settings.websiteInfo.systemName
}
let timer = null
const handleColorInput = (e, key) => {
  clearTimeout(timer)
  timer = setTimeout(() => {
    settingStore.theme.token[key] = e.target.value
  }, 2000)
}
const onModeChange = async (e, newMode) => {
  if (newMode === mode.value) return;
  mode.value = newMode
  const isAuto = newMode === 'auto'
  settingStore.useAutoMode = isAuto
  if (isAuto) {
    settingStore.watchSysMode()
  } else {
    settingStore.destroyWatchSysMode()
  }
  if (isAuto && settingStore.getSystemMode() === settingStore.mode) return;
  else if (newMode === settingStore.mode) return;
  await sleep(300)
  // 开始执行过渡动画
  const x = e.clientX, y = e.clientY;
  const changeFn = () => {
    if (isAuto) {
      settingStore.setModeAuto()
    } else if (newMode === 'light') {
      settingStore.setLight();
    } else if (newMode === 'dark') {
      settingStore.setDark()
    }
  }
  startViewTransition({
    changeFn,
    x, y,
    animateName: settingStore.modeAnimate,
    positive: settingStore.isLight,
    duration: 650
  })
}
watch(
  () => settingStore.mode,
  () => {
    mode.value = settingStore.useAutoMode ? 'auto' : settingStore.mode
  }
)
</script>

<style lang="less" scoped>
.color-box {
  display: inline-block;
  width: 20px;
  height: 20px;
  border-radius: 3px;
}
.check-icon {
  padding: 2px;
  object-fit: cover;
  transition: all 0.3s;
  border-radius: var(--ant-borderRadius);
  background-color: var(--ant-colorBgContainer);
  &.is-checked, &:hover {
    box-shadow: 0 0 0 3px var(--ant-colorPrimary);
  }
}
.theme-diy {
  &__item {
    background-color: transparent;
    padding: 5px;
    border-radius: var(--ant-borderRadius);
    transition: all .3s;
    &:hover {
      background-color: var(--ant-colorBgLayout);
    }
    .value {
      border-color: var(--ant-colorBorderSecondary);
      background-color: var(--ant-colorBgContainer);
    }
  }
}
</style>
