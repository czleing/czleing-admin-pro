<template>
  <a-watermark :content="settingStore.useWatermark ? watermark : ''" :rotate="-35" :zIndex="9000">
    <a-layout class="layout" style="height:100vh;">
      <a-layout-header
        v-show="!isFullScreen"
        class="layout-header"
        :class="{
          'is-line': settingStore.layoutDivide === 'line',
          'is-shadow': settingStore.layoutDivide === 'shadow',
          'is-radius mt6 ml6 mr6': settingStore.layoutDivide === 'round',
        }"
        :style="`height:${settingStore.topHeaderHeight}px;line-height:${settingStore.topHeaderHeight}px;`"
      >
        <!-- 头部 -->
        <Header />
      </a-layout-header>
      <a-layout>
        <a-layout-sider
          v-show="showLeft && !isFullScreen"
          :collapsed="!menuStore.isSidebarOpen"
          :trigger="null"
          :theme="settingStore.mode"
          :width="settingStore.leftMenuWidth"
          class="layout-sider"
          :class="{
            'is-line': settingStore.layoutDivide === 'line',
            'is-shadow': settingStore.layoutDivide === 'shadow',
            'is-radius mt6 ml6 mb6': settingStore.layoutDivide === 'round',
          }"
          collapsible
        >
          <!-- 左侧菜单 -->
          <MenuSide />
        </a-layout-sider>
        <a-layout-content class="layout-content" :class="{'is-radius': settingStore.layoutDivide === 'round'}">
          <div class="pa5 flex-y y-stretch h100p">
            <!-- 右侧 Tabs 栏 -->
            <div
              v-if="settingStore.useTabs"
              class="view-tabs"
              :class="{
                'is-tab-line': settingStore.layoutDivide !== 'round' && settingStore.tabType !== 'tab',
                'is-radius-line': settingStore.layoutDivide === 'round' && settingStore.tabType !== 'tab',
              }"
            >
              <Tabs :isFullscreen="isFullScreen" @toggleFullScreen="toggleFullScreen" />
            </div>
            <!-- 右侧工作区 -->
            <div
              class="view-main relative flex-auto pa10"
              :class="{
                'is-radius-bottom': settingStore.layoutDivide === 'round' && settingStore.useTabs,
                'is-radius-all': settingStore.layoutDivide === 'round' && !settingStore.useTabs,
              }"
              :style="{ 'overflow': isAnimating && settingStore.tabAnimate ? 'hidden' : 'auto' }"
            >
            <!-- {{ tabsStore.cachedViews }} -->
              <router-view v-slot="{ Component, route }">
                <Transition :name="settingStore.tabAnimate" :css="!!settingStore.tabAnimate" @before-enter="isAnimating = true" @after-leave="isAnimating = false">
                  <keep-alive :max="20" :include="tabsStore.cachedViews">
                    <component v-if="!tabsStore.refreshing" :is="Component" :key="route.fullPath" />
                  </keep-alive>
                </Transition>
              </router-view>
            </div>
            <!-- footer -->
            <footer v-if="settingStore.useFooter" v-show="!isFullScreen" class="pt5">
              <div class="tc">
                <a :href="setting.copyrightLink" target="_blank" class="text-gray">
                  <CopyrightOutlined />
                  {{ setting.copyright }}
                </a>
              </div>
            </footer>
          </div>
        </a-layout-content>
      </a-layout>
      <div class="bg-overlay" :style="bgVars" />
    </a-layout>
  </a-watermark>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth-store.js'
import { useMenuStore } from '@/stores/menu-store.js'
import { useSettingStore } from '@/stores/setting-store.js'
import { useTabsStore } from '@/stores/tabs-store.js'
import { computed, onMounted, watchEffect } from 'vue'
import { useThemeToken } from '../hooks/useThemeToken'
import { useWindowSize } from '../hooks/useWindowSize'
import Header from './components/header/index.vue'
import MenuSide from './components/side/index.vue'
import Tabs from './components/tabs/index.vue'
import settings from '@/config/setting.js'
import { setRootCssVars } from '@/utils'

const setting = settings.websiteInfo
const menuStore = useMenuStore()
const tabsStore = useTabsStore()
const settingStore = useSettingStore()
const authStore = useAuthStore()
const { token } = useThemeToken()
const isAnimating = ref(false)
const watermark = computed(() => {
  if (authStore.userInfo?.userName) {
    return authStore.userInfo.nickName + ' ' + authStore.userInfo.userName
  }
  return '演示用户'
})
const showLeft = computed(() => menuStore.leftNavRoutes?.length > 0)

const isFullScreen = ref(false)
function toggleFullScreen() {
  isFullScreen.value = !isFullScreen.value
}

onMounted(() => {
  document.documentElement.setAttribute('theme', settingStore.mode)
})

watchSyncEffect(() => {
  // 动态设置css变量，跟随 ant-design 主题，可根据需要扩展，参考： https://www.antdv.com/docs/vue/customize-theme-cn#api
  setRootCssVars('--ant-', {
    colorText: token.value.colorText,
    colorInfo: token.value.colorInfo,
    colorPrimary: token.value.colorPrimary,
    colorPrimaryHover: token.value.colorPrimaryHover, // 主色梯度下的悬浮态，使用频率很高。
    colorPrimaryBg: token.value.colorPrimaryBg, // 主色浅色背景颜色，一般用于视觉层级较弱的选中状态。
    colorPrimaryBgHover: token.value.colorPrimaryBgHover, // 与主色浅色背景颜色相对应的悬浮态颜色。
    colorPrimaryActive: token.value.colorPrimaryActive, // 主色梯度下的深色激活态
    colorSuccess: token.value.colorSuccess,
    colorWarning: token.value.colorWarning,
    colorError: token.value.colorError,
    colorBorder: token.value.colorBorder, // 边框颜色
    colorBorderSecondary: token.value.colorBorderSecondary, // 更淡的边框颜色
    colorBgContainer: token.value.colorBgContainer, // 组件的容器背景色，例如：默认按钮、输入框等。务必不要将其与 `colorBgElevated` 混淆。
    colorBgElevated: token.value.colorBgElevated, // 浮层容器背景色，在暗色模式下该 token 的色值会比 `colorBgContainer` 要亮一些。例如：模态框、弹出框、菜单等。
    colorBgLayout: token.value.colorBgLayout, // 该色用于页面整体布局的背景色，只有需要在页面中处于 B1 的视觉层级时才会使用该 token，其他用法都是错误的
    colorFillSecondary: token.value.colorFillSecondary, // 二级填充色可以较为明显地勾勒出元素形体，如 Rate、Skeleton 等。也可以作为三级填充色的 Hover 状态，如：menu-item hover 状态。
    controlHeight: token.value.controlHeight + 'px', // 基础控件高度
    borderRadius: token.value.borderRadius + 'px', // 基础控件圆角大小
    borderRadiusLG: token.value.borderRadiusLG + 'px', // 一般用于容器圆角大小
    lineWidth: token.value.lineWidth + 'px', // 边框线条宽度，1px or 0.55px
  }, 'ant-design-vars')
})

const bgVars = computed(() => {
  return {
    '--c-bgImage': settingStore.useBg ? `url(${settingStore.bgImage})` : 'none',
    '--c-bgBlur': `blur(${settingStore.bgBlur}px)`,
    '--c-bgInset': -settingStore.bgBlur + 'px',
    '--c-bgOpacity': settingStore.bgOpacity,
    '--c-bgMixMode': settingStore.bgMixMode,
  }
})

/**
 * 监听窗体大小变化，自动展开收起左侧菜单栏
 */
useWindowSize((width) => {
  if (width < 900 && menuStore.isSidebarOpen) {
    menuStore.isSidebarOpen = false
  } else if (width > 900 && !menuStore.isSidebarOpen) {
    menuStore.isSidebarOpen = true
  }
})
</script>
<style scoped lang="less">
::v-deep(.ant-layout-content.no-radius) {
  background: var(--ant-colorBgContainer) !important;
}
.layout {
  background: none;
  .bg-overlay {
    position: fixed;
    content: '';
    inset: var(--c-bgInset);
    pointer-events: none;
    z-index: 9999;
    background-image: var(--c-bgImage);
    background-size: 100% 100%;
    mix-blend-mode: var(--c-bgMixMode);
    opacity: var(--c-bgOpacity);
    filter: var(--c-bgBlur);
  }
  .layout-header, .layout-sider {
    &.is-radius {
      border-radius: var(--ant-borderRadiusLG);
      border: solid var(--ant-lineWidth) var(--ant-colorBorderSecondary);
      overflow: hidden;
    }
  }
  .layout-header {
    transition: margin .3s;
    padding: 0;
    height: 50px;
    line-height: revert;
    background: var(--ant-colorBgContainer);
    &.is-line {
      border-bottom: var(--ant-lineWidth) solid var(--ant-colorBorderSecondary);
    }
    &.is-shadow {
      z-index: 2;
      box-shadow: 0 0 10px rgba(155, 155, 155, .2);
    }
  }
  .layout-sider {
    background: var(--ant-colorBgContainer);
    transition: background .2s, min-width .3s, max-width .3s, margin .3s;
    &.is-line {
      border-right: var(--ant-lineWidth) solid var(--ant-colorBorderSecondary);
    }
    &.is-shadow {
      z-index: 1;
      box-shadow: 0 0 10px rgba(155, 155, 155, .2);
    }
  }
  .layout-content {
    background: var(--ant-colorBgContainer);
    &.is-radius {
      background: none;
    }
    .view-tabs {
      &.is-tab-line {
        margin: -5px -5px 0 -5px;
      }
      &.is-radius-line {
        background: var(--ant-colorBgContainer);
        border: var(--ant-lineWidth) solid var(--ant-colorBorderSecondary);
        border-bottom: none;
        border-radius: var(--ant-borderRadiusLG) var(--ant-borderRadiusLG) 0 0;
      }
    }
    .view-main {
      background-color: var(--ant-colorBgContainer);
      border-top: none !important;
      &.is-radius-bottom {
        border-radius: 0 0 var(--ant-borderRadiusLG) var(--ant-borderRadiusLG);
        border: solid var(--ant-lineWidth) var(--ant-colorBorderSecondary);
      }
      &.is-radius-all {
        border-radius: var(--ant-borderRadiusLG);
        border: solid var(--ant-lineWidth) var(--ant-colorBorderSecondary);
      }
    }
  }
}

/** Tab 切换动画相关样式定义在 src/assets/css/base.less */
</style>
