/**
 * 主题、语言、设置相关 store
 * 管理：主题色系、明暗模式、菜单布局、语言、Tab 栏、背景等用户偏好设置
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

/** 主题色 token */
export interface ThemeToken {
  colorPrimary: string
  colorError: string
  colorWarning: string
  colorSuccess: string
  colorInfo: string
  colorBorder?: string
  colorBorderSecondary?: string
}

/** 主题定义 */
export interface ThemeConfig {
  name: string
  inUse?: boolean
  theme: {
    bgImage: string
    isDiy?: boolean
    token: ThemeToken
  }
}

// ant-design-vue4.x 主题定义
const themes: ThemeConfig[] = [
  {
    name: 'frame.themeGreen', // 薄荷清新
    inUse: true,
    theme: {
      bgImage: 'page-bg-1.jpg',
      token: {
        colorPrimary: '#88c7b1',
        colorError: '#e88f78',
        colorWarning: '#f0c175',
        colorSuccess: '#85b17e',
        colorInfo: '#88c7b1',
      },
    },
  },
  {
    name: 'frame.themeGolden', // 金色沙滩
    theme: {
      bgImage: 'page-bg-2.jpg',
      token: {
        colorPrimary: '#d2b48c',
        colorError: '#c84e4e',
        colorWarning: '#e2b14c',
        colorSuccess: '#3dbd3e',
        colorInfo: '#d2b48c',
        // 可以自定义更多变量值
      },
    },
  },
  {
    name: 'frame.themeBlue', // 海岸微风
    theme: {
      bgImage: 'page-bg-3.jpg',
      token: {
        colorPrimary: '#78b2d8',
        colorError: '#cf7b6e',
        colorWarning: '#e1bf7f',
        colorSuccess: '#8cca81',
        colorInfo: '#56a0d2',
      },
    },
  },
  {
    name: 'frame.themePink', // 轻胭落砚
    theme: {
      bgImage: 'page-bg-4.jpg',
      token: {
        colorPrimary: '#ee9da7',
        colorError: '#bd2e0a',
        colorWarning: '#ff9209',
        colorSuccess: '#6dd747',
        colorInfo: '#ee9da7',
        colorBorder: '#ec889240',
        colorBorderSecondary: '#ec889220',
      },
    },
  },
  {
    name: 'frame.themeDiy', // 自定义
    theme: {
      bgImage: 'page-bg-5.jpg',
      isDiy: true,
      token: {
        colorPrimary: '#0099ff',
        colorError: '#c84e4e',
        colorWarning: '#e2b14c',
        colorSuccess: '#3dbd3e',
        colorInfo: '#0099ff',
      },
    },
  },
]

/** 明暗模式 */
export type ThemeMode = 'light' | 'dark'

export const useSettingStore = defineStore('setting', () => {
  /** 当前主题色系 */
  const theme = ref({ token: { ...themes.find((item) => item.inUse)?.theme?.token } })
  /** 当前主题名称 */
  const themeName = ref<string | undefined>(themes.find((item) => item.inUse)?.name)
  /** 明暗模式 light or dark */
  const mode = ref<ThemeMode>('light')
  /** 明暗是否跟随系统，是则开启监听，自动根据系统设置明暗模式 */
  const useAutoMode = ref(false)
  /** 切换明暗模式的动画 fade, circle, line */
  const modeAnimate = ref('fade')
  /** 当前语言 zh-cn, zh-hk, en */
  const locale = ref('zh-cn')
  /** 当前组件尺寸 */
  const componentSize = ref('middle')
  /** 菜单布局方式，top: 全部显示在顶部，left: 全部显示在左侧，top-left: 顶部一级菜单，左侧子菜单 */
  const menuLayout = ref('top-left')
  /** 左侧菜单宽度 px */
  const leftMenuWidth = ref(200)
  /** 顶部宽度 px */
  const topHeaderHeight = ref(50)
  /** 顶部菜单模式，card, line */
  const firstMenuMode = ref('card')
  /** 顶部菜单位置，start, center, end */
  const firstMenuAlign = ref('start')
  /** 自动打开子菜单(菜单 top-left 布局时，点击一级菜单，自动打开最后一次打开的子菜单或第一个子菜单) */
  const autoOpenChildMenu = ref(true)
  /** 是否使用天气组件 */
  const useWeather = ref(false)
  /** 是否使用 tabs 栏 */
  const useTabs = ref(true)
  /** tabs 栏是否使用图标 */
  const useTabIcon = ref(true)
  /** tabs 栏是否使用关闭按钮 */
  const useTabClose = ref(true)
  /** 是否启用 Tab 收藏功能 */
  const useTabFavorite = ref(true)
  /** tab 页签动画，'', 'slide-right', 'fade', 'scale' */
  const tabAnimate = ref('slide-right')
  /** tab 页签样式， 'tab', 'card', 'line' */
  const tabType = ref('line')
  /** 是否动态设置浏览器标签名，设置为路由上的 meta.title */
  const useDynamicPageTitle = ref(true)
  /** 表格是否使用竖向边框 */
  const useTableBorder = ref(true)
  /** 是否使用细线边框，需显示器、浏览器支持，由用户决定 */
  const useThinLine = ref(false)
  /** 是否使用面包屑目录层级 */
  const useBreadcrumbs = ref(true)
  /** 是否使用水印 */
  const useWatermark = ref(false)
  /** 是否使用万分位分隔(中文简体下数字) */
  const useWanSplit = ref(false)
  /** 是否使用页脚 */
  const useFooter = ref(false)
  /** 布局块边框样式，'', line, shadow, round */
  const layoutDivide = ref('line')
  /** 是否使用背景图片 */
  const useBg = ref(true)
  /** 背景图片，提供预设几张图，和自定义网络地址 */
  const bgImage = ref(import.meta.env.VITE_APP_CONTEXT_PATH + 'assets/page-bg-1.jpg')
  /** 背景模糊大小，0 - 50px */
  const bgBlur = ref(0)
  /** 背景透明度 0 - 1 */
  const bgOpacity = ref(0.2)

  /** 监听系统明暗主题实例 */
  const matchMediaInstance = window.matchMedia('(prefers-color-scheme: dark)')
  /** 当前是否已经监听 */
  let isWatchSysMode = false

  const { locale: l } = useI18n()

  /** 根据主题名称设置主题 */
  function setThemeByName(name?: string): void {
    if (!name) return
    const t = themes.find((item) => item.name === name)?.theme
    if (t) {
      bgImage.value = import.meta.env.VITE_APP_CONTEXT_PATH + 'assets/' + t.bgImage
      theme.value = t // { ...t, token: { ...t.token } }
      themeName.value = name
    }
  }

  /** 获取系统明暗色 */
  function getSystemMode(): ThemeMode {
    return matchMediaInstance.matches ? 'dark' : 'light'
  }

  /** 明暗模式：选择暗色 */
  function setDark(): void {
    if (mode.value !== 'dark') {
      mode.value = 'dark'
      if (bgOpacity.value > 0.15) {
        bgOpacity.value = 0.15
      }
      document.documentElement.setAttribute('theme', 'dark')
    }
  }

  /** 明暗模式：选择亮色 */
  function setLight(): void {
    if (mode.value !== 'light') {
      mode.value = 'light'
      if (bgOpacity.value < 0.2) {
        bgOpacity.value = 0.2
      }
      document.documentElement.setAttribute('theme', 'light')
    }
  }

  /** 明暗模式：选择跟随系统，将系统明暗色设置为当前明暗模式 */
  function setModeAuto(): void {
    const sysMode = getSystemMode()
    if (sysMode === 'light') {
      setLight()
    } else {
      setDark()
    }
  }

  /** 开启系统明暗主题监听 */
  function watchSysMode(): void {
    if (isWatchSysMode || !useAutoMode.value) return
    if (import.meta.env.VITE_APP_DEBUG_MODE === 'true') {
      console.log('开启监听系统明暗模式')
    }
    isWatchSysMode = true
    matchMediaInstance.addEventListener('change', setModeAuto)
  }

  /** 取消系统明暗主题监听 */
  function destroyWatchSysMode(): void {
    if (isWatchSysMode) {
      if (import.meta.env.VITE_APP_DEBUG_MODE === 'true') {
        console.log('关闭监听系统明暗模式')
      }
      matchMediaInstance.removeEventListener('change', setModeAuto)
      isWatchSysMode = false
    }
  }

  /** 从当前模式切换到另一种模式，非黑即白，不会切到跟随系统 */
  function toggleMode(): void {
    isDark.value ? setLight() : setDark()
  }

  /** 设置语言 */
  function setLocale(lang: string): void {
    locale.value = lang
    l.value = lang
  }

  /** 恢复默认设置 */
  function restoreSettings(): void {
    localStorage.removeItem('CZ_USER_SETTINGS')
    destroyWatchSysMode()
    window.location.reload()
  }

  const isLight = computed(() => mode.value === 'light')
  const isDark = computed(() => mode.value === 'dark')
  const themesGetter = computed(() => themes)
  const isCn = computed(() => locale.value === 'zh-cn')
  /** 背景混合模式：亮色时 multiply, 暗色时 hard-light */
  const bgMixMode = computed(() => (isLight.value ? 'multiply' : 'hard-light'))

  return {
    theme,
    themeName,
    mode,
    useAutoMode,
    modeAnimate,
    locale,
    componentSize,
    menuLayout,
    leftMenuWidth,
    topHeaderHeight,
    autoOpenChildMenu,
    useWeather,
    useTabs,
    useTabIcon,
    useTabClose,
    useTabFavorite,
    tabAnimate,
    tabType,
    useDynamicPageTitle,
    isDark,
    isLight,
    themes: themesGetter,
    isCn,
    useTableBorder,
    useThinLine,
    useBreadcrumbs,
    useWatermark,
    useWanSplit,
    useFooter,
    layoutDivide,
    firstMenuMode,
    firstMenuAlign,
    matchMediaInstance,
    useBg,
    bgImage,
    bgBlur,
    bgOpacity,
    bgMixMode,
    getSystemMode,
    setThemeByName,
    setDark,
    setLight,
    setModeAuto,
    toggleMode,
    setLocale,
    watchSysMode,
    destroyWatchSysMode,
    restoreSettings,
  }
},
{
  persist: {
    key: 'USER_SETTINGS',
  },
})
