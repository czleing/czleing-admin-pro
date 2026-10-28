<template>
  <div class="header flex-x-between px20 nowrap">
    <Logo />
    <span v-if="settingStore.menuLayout !== 'top'" class="pointer ml20" @click="menuStore.toggleSidebar">
      <MenuFoldOutlined v-if="menuStore.isSidebarOpen" />
      <MenuUnfoldOutlined v-else />
    </span>
    <div class="header__menu flex-auto mx20" :class="{ 'btn-mode': settingStore.firstMenuMode === 'card' }">
      <template v-if="settingStore.menuLayout === 'left'">
        <transition name="slide-right">
          <HeaderBreadcrumb v-if="settingStore.useBreadcrumbs" />
        </transition>
      </template>
      <a-menu
        v-else
        class="menu-side__list"
        v-model:selectedKeys="selectedKeys"
        v-model:openKeys="openKeys"
        mode="horizontal"
        :style="`justify-content:${settingStore.firstMenuAlign};line-height:${settingStore.topHeaderHeight - 1}px;`"
      >
        <template v-for="item in menuStore.headerNavRoutes">
          <template v-if="item.meta?.hidden !== true && !item.children">
            <a-menu-item :key="item.path" @click="onMenuItemClick(item)">
              <a-icon v-if="item.meta?.icon" :type="item.meta?.icon" />
              <span>{{ item.meta?.title }}</span>
            </a-menu-item>
          </template>
          <template v-else-if="item.meta?.hidden !== true">
            <SideItem
              :key="item.path"
              :menu-info="item"
              @menu-click="onMenuItemClick"
            />
          </template>
        </template>
      </a-menu>
    </div>
    <iframe
      v-if="settingStore.useWeather"
      src="http://i.tianqi.com/?c=code&id=26"
      width="180"
      height="25"
      frameborder="0"
      marginwidth="0"
      marginheight="0"
      scrolling="no"
      :style="settingStore.isDark ? 'filter:invert(1);' : ''"
    ></iframe>
    <div class="flex-x x-middle gap15">
      <HeaderSearch />
      <HeaderMessage />
      <HeaderFullscreen />
      <HeaderSetting />
      <div style="transform: scale(0.7);transform-origin: 50% 20%;margin: 0 -8px;">
        <ModeSwitch />
      </div>
      <HeaderLang />
      <HeaderUser />
    </div>
  </div>
</template>

<script setup>
import Logo from './logo.vue'
import SideItem from '../side/SideItem.vue'
import { useMenuStore } from '@/stores/menu-store.js'
import { useSettingStore } from '@/stores/setting-store.js'
import HeaderUser from './header-user.vue'
import HeaderMessage from './header-message.vue'
import HeaderFullscreen from './header-fullscreen.vue'
import HeaderSetting from './header-setting.vue'
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons-vue'
import ModeSwitch from './mode-switch.vue'
import HeaderBreadcrumb from './header-breadcrumb.vue'
import HeaderLang from './header-lang.vue'
import HeaderSearch from './header-search.vue'

const menuStore = useMenuStore()
const settingStore = useSettingStore()
const selectedKeys = ref([])
const openKeys = ref([])
const route = useRoute()
const router = useRouter()

watchEffect(() => {
  selectedKeys.value = route.meta.matchedPaths ?? [route.path]
  openKeys.value = route.meta?.matchedPaths?.slice(1) ?? [route.path]
  menuStore.firstRoutePath = route.meta?.matchedPaths?.[0] ?? route.path
})

function onMenuItemClick (item) {
  menuStore.handleMenuClick(router, item)
  // 点击一级菜单时，自动激活最后一次打开的子菜单或第一个子菜单
  if (item.meta?.isFirst && settingStore.menuLayout === 'top-left' && settingStore.autoOpenChildMenu && menuStore.leftNavRoutes.length > 0) {
    const latestChildPath = menuStore.latestChildPathMap[menuStore.firstRoutePath] ?? findFirstChild(menuStore.leftNavRoutes[0])?.path
    latestChildPath && router.push(latestChildPath)
  }
}

function findFirstChild (route) {
  if (!route.children || route.children.length === 0) {
    return route
  }
  return findFirstChild(route.children[0])
}

</script>

<style lang="less" scoped>
.header {
  height: 100%;
  &__menu {
    overflow: auto;
  }
}
</style>
<style lang="less">
.header__menu.btn-mode {
  .ant-menu {
    & > .ant-menu-item, & > .ant-menu-submenu {
      border-radius: var(--ant-borderRadius);
      height: calc(var(--ant-controlHeight) + 5px);
      line-height: calc(var(--ant-controlHeight) + 5px);
      margin: 0 4px;
      padding-inline: 12px;
      transition: background-color .3s, color .3s, transform .3s;
      // transform: skewX(-8deg);
      &:hover {
        color: var(--ant-colorPrimary);
        background-color: rgba(155, 155, 155, .1);
      }
      &:active {
        background-color: rgba(155, 155, 155, .2);
      }
      &::after {
        display: none !important;
      }
      // .ant-menu-title-content {
      //   display: inline-block;
      //   transform: skewX(8deg);
      // }
      &.ant-menu-item-selected, &.ant-menu-submenu-selected {
        background-color: var(--ant-colorPrimaryBg);
        color: var(--ant-colorPrimary);
        .ant-menu-submenu-title {
          color: inherit;
        }
      }
    }
  }
}
</style>
