import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// ant-design-vue4.x 主题定义
const themes = [
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
      }
    }
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
      }
    }
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
        colorInfo: '#56a0d2'
      }
    }
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
      }
    }
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
      }
    }
  }
]

/**
 * 主题、语言、设置相关 store
 */
export const useSettingStore = defineStore('setting', () => {
  const theme = ref({ token: { ...themes.find(item => item.inUse)?.theme?.token } }) // 当前主题色系
  const themeName = ref(themes.find(item => item.inUse)?.name) // 当前主题名称
  const mode = ref('light') // 明暗模式 light or dark
  const useAutoMode = ref(false) // 明暗是否跟随系统，是则开启监听，自动根据系统设置明暗模式
  const modeAnimate = ref('fade') // 切换明暗模式的动画 fade, circle, line
  const locale = ref('zh-cn') // 当前语言 zh-cn, zh-hk, en
  const componentSize = ref('middle') // 当前组件尺寸
  const menuLayout = ref('top-left') // 菜单布局方式，top: 全部显示在顶部，left: 全部显示在左侧，top-left: 顶部一级菜单，左侧子菜单
  const leftMenuWidth = ref(200) // 左侧菜单宽度 px
  const topHeaderHeight = ref(50) // 顶部宽度 px
  const firstMenuMode = ref('card') // 顶部菜单模式，card, line
  const firstMenuAlign = ref('start') // 顶部菜单位置，start, center, end
  const autoOpenChildMenu = ref(true) // 自动打开子菜单(菜单 top-left 布局时，点击一级菜单，自动打开最后一次打开的子菜单或第一个子菜单)
  const useWeather = ref(false) // 是否使用天气组件
  const useTabs = ref(true) // 是否使用 tabs 栏
  const useTabIcon = ref(true) // tabs 栏是否使用图标
  const useTabClose = ref(true) // tabs 栏是否使用关闭按钮
  const useTabFavorite = ref(true) // 是否启用 Tab 收藏功能
  const tabAnimate = ref('slide-right') // tab 页签动画，'', 'slide-right', 'fade', 'scale'
  const tabType = ref('line') // tab 页签样式， 'tab', 'card', 'line'
  const useDynamicPageTitle = ref(true) // 是否动态设置浏览器标签名，设置为路由上的 meta.title
  const useTableBorder = ref(true) // 表格是否使用竖向边框
  const useThinLine = ref(false) // 是否使用细线边框，需显示器、浏览器支持，由用户决定
  const useBreadcrumbs = ref(true) // 是否使用面包屑目录层级
  const useWatermark = ref(false) // 是否使用水印
  const useWanSplit = ref(false) // 是否使用万分位分隔(中文简体下数字)
  const useFooter = ref(false) // 是否使用页脚
  const layoutDivide = ref('line') // 布局块边框样式，'', line, shadow, round
  const useBg = ref(true) // 是否使用背景图片
  const bgImage = ref(import.meta.env.VITE_APP_CONTEXT_PATH + 'assets/page-bg-1.jpg') // 背景图片，提供预设几张图，和自定义网络地址
  const bgBlur = ref(0) // 背景模糊大小，0 - 50px
  const bgOpacity = ref(0.2) // 背景透明度 0 - 1

  const matchMediaInstance = window.matchMedia('(prefers-color-scheme: dark)') // 监听系统明暗主题实例
  let isWatchSysMode = false // 当前是否已经监听

  const { locale: l } = useI18n()

  /** 根据主题名称设置主题 */
  function setThemeByName (name) {
    if (!name) return
    const t = themes.find(item => item.name === name)?.theme
    if (t) {
      bgImage.value = import.meta.env.VITE_APP_CONTEXT_PATH + 'assets/' + t.bgImage
      theme.value = t // { ...t, token: { ...t.token } }
      themeName.value = name
    }
  }

  /** 获取系统明暗色 */
  function getSystemMode () {
    return matchMediaInstance.matches ? 'dark' : 'light'
  }

  /** 明暗模式：选择暗色 */
  function setDark () {
    if (mode.value !== 'dark') {
      mode.value = 'dark'
      if (bgOpacity.value > 0.15) {
        bgOpacity.value = 0.15
      }
      document.documentElement.setAttribute('theme', 'dark')
    }
  }

  /** 明暗模式：选择亮色 */
  function setLight () {
    if (mode.value !== 'light') {
      mode.value = 'light'
      if (bgOpacity.value < 0.2) {
        bgOpacity.value = 0.2
      }
      document.documentElement.setAttribute('theme', 'light')
    }
  }

  /** 明暗模式：选择跟随系统，将系统明暗色设置为当前明暗模式 */
  function setModeAuto () {
    const sysMode = getSystemMode()
    if (sysMode === 'light') {
      setLight()
    } else {
      setDark()
    }
  }

  /** 开启系统明暗主题监听 */
  function watchSysMode () {
    if (isWatchSysMode || !useAutoMode.value) return;
    if (import.meta.env.VITE_APP_DEBUG_MODE === 'true') {
      console.log('开启监听系统明暗模式')
    }
    isWatchSysMode = true
    matchMediaInstance.addEventListener('change', setModeAuto)
  } 
  
  /** 取消系统明暗主题监听 */
  function destroyWatchSysMode () {
    if (isWatchSysMode) {
      if (import.meta.env.VITE_APP_DEBUG_MODE === 'true') {
        console.log('关闭监听系统明暗模式')
      }
      matchMediaInstance.removeEventListener('change', setModeAuto)
      isWatchSysMode = false
    }
  }

  /** 从当前模式切换到另一种模式，非黑即白，不会切到跟随系统 */
  function toggleMode () {
    isDark.value ? setLight() : setDark()
  }

  /** 设置语言 */
  function setLocale (lang) {
    locale.value = lang
    l.value = lang
  }

  /** 恢复默认设置 */
  function restoreSettings () {
    localStorage.removeItem('CZ_USER_SETTINGS')
    destroyWatchSysMode()
    window.location.reload()
  }

  const isLight = computed(() => mode.value === 'light')
  const isDark = computed(() => mode.value === 'dark')
  const themesGetter = computed(() => themes)
  const isCn = computed(() => locale.value === 'zh-cn')
  const bgMixMode = computed(() => isLight.value ? 'multiply' : 'hard-light') // 背景混合模式：亮色时multiply, 暗色时hard-light

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
    restoreSettings
  }
},
{
  persist: {
    key: 'CZ_USER_SETTINGS'
  }
})
