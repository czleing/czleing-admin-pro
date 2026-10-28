<template>
  <section>
    <a-tabs
      hide-add
      v-model:activeKey="currentTab"
      size="small"
      :type="tabType"
      class="nav-tabs"
      :class="{
        'is-tab': settingStore.tabType === 'tab',
        'is-card': settingStore.tabType === 'card',
        'is-line': settingStore.tabType === 'line',
      }"
      @tabClick="onTabClick"
      @edit="onDeleteHandle"
    >
      <a-tab-pane v-for="(tab, index) in tabsStore.tabList" :key="tab.fullPath" :closable="false">
        <template #tab>
          <a-dropdown placement="bottom" :trigger="['contextmenu']" arrow>
            <div>
              <a-icon v-if="settingStore.useTabIcon && tab.meta?.icon" :type="tab.meta.icon" />
              {{ tab.meta.title }}
              <CloseOutlined v-if="settingStore.useTabClose" class="close-icon em08 ml5" @click.stop="tabsStore.closeTab(index)" />
            </div>
            <template #overlay>
              <a-menu>
                <a-menu-item @click="tabsStore.closeTab(index)">
                  <CloseCircleFilled slot='icon' class="text-primary" />
                  <span class="ml6">{{ $t('frame.closeTab') }}</span>
                </a-menu-item>
                <a-menu-divider />
                <a-menu-item @click="tabsStore.refreshTab()" :disabled="currentTab !== tab.fullPath">
                  <SyncOutlined slot='icon' class="text-primary" />
                  <span class="ml6">{{ $t('frame.refreshTab') }}</span>
                </a-menu-item>
                <a-menu-item @click="openInNewWindow(tab.fullPath, tab.path)">
                  <SubnodeOutlined slot='icon' class="text-primary" />
                  <span class="ml6">{{ $t('frame.openInNewWindow') }}</span>
                </a-menu-item>
                <a-menu-item v-if="settingStore.useTabFavorite" @click="tabsStore.toogleFavorite(index)">
                  <template v-if="tabsStore.favoriteKeys.includes(tab.fullPath)">
                    <HeartFilled slot='icon' class="text-primary" />
                    <span class="ml6">{{ $t('frame.removeFavorite') }}</span>
                  </template>
                  <template v-else>
                    <HeartOutlined slot='icon' class="text-primary" />
                    <span class="ml6">{{ $t('frame.favorite') }}</span>
                  </template>
                </a-menu-item>
                <a-menu-divider />
                <a-menu-item @click="tabsStore.clearLeftTabs(index)" :disabled="index === 0">
                  <ArrowLeftOutlined slot='icon' class="text-primary" />
                  <span class="ml6">{{ $t('frame.closeLeft') }}</span>
                </a-menu-item>
                <a-menu-item @click="tabsStore.clearRightTabs(index)" :disabled="index === tabsStore.tabList.length - 1">
                  <ArrowRightOutlined slot='icon' class="text-primary" />
                  <span class="ml6">{{ $t('frame.closeRight') }}</span>
                </a-menu-item>
                <a-menu-item @click="tabsStore.clearOtherTabs(index)" :disabled="tabsStore.tabList.length === 1">
                  <SwapOutlined slot='icon' class="text-primary" />
                  <span class="ml6">{{ $t('frame.closeOther') }}</span>
                </a-menu-item>
                <a-menu-item @click="tabsStore.clearAllTabs()">
                  <CloseCircleTwoTone slot='icon' :twoToneColor="token.colorPrimary" />
                  <span class="ml6">{{ $t('frame.closeAll') }}</span>
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </template>
      </a-tab-pane>
      <template #rightExtra>
        <div class="pr8 flex-x x-middle">
          <template v-if="settingStore.useTabFavorite">
            <a-divider type="vertical" />
            <a-dropdown placement="bottomRight" arrow @click="tabsStore.toogleFavorite()">
              <div class="pointer">
                <HeartFilled v-if="tabsStore.currTab && tabsStore.favoriteKeys.includes(tabsStore.currTab.fullPath)" class="text-primary" :title="$t('frame.removeFavorite')" style="margin-right:0;" />
                <HeartOutlined v-else :title="$t('frame.favorite')" style="margin-right:0;" />
              </div>
              <template v-if="tabsStore.favoriteTabs.length" #overlay>
                <a-menu ref="listContainer" class="sortable">
                  <a-menu-item
                    v-for="(item, index) in tabsStore.favoriteTabs"
                    :key="item.path"
                  >
                    <div class="flex-x-between">
                      <span class="flex-auto" @click="router.push(item.path)">
                        <HeartFilled class="text-primary mr4" />
                        {{ item.meta.title }}
                      </span>
                      <a-divider type="vertical" />
                      <div class="draggable" @click.stop>
                        <HolderOutlined />
                      </div>
                      <a-divider type="vertical" />
                      <DeleteFilled class="text-danger" :title="$t('frame.remove')" @click.stop="tabsStore.removeFavorite(index)" />
                    </div>
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </template>
          <a-divider type="vertical" />
          <span class="pointer" @click="toggleFullScreen">
            <FullscreenExitOutlined v-if="isFullscreen" :title="$t('frame.exitFullscreen')" style="margin:0;" />
            <FullscreenOutlined v-else :title="$t('frame.fullscreen')" style="margin:0;" />
          </span>
        </div>
      </template>
    </a-tabs>
  </section>
</template>
<script setup>
import { useSortable } from '@/hooks/useSortable'
import { useSettingStore } from '@/stores/setting-store'
import { useTabsStore } from '@/stores/tabs-store.js'
import { DownOutlined, DownSquareFilled, FullscreenExitOutlined, FullscreenOutlined, HeartOutlined, StarOutlined } from '@ant-design/icons-vue'
import { theme } from 'ant-design-vue'
import { h } from 'vue'

const props = defineProps({
  isFullscreen: Boolean,
})
const router = useRouter()
const route = useRoute()
const tabsStore = useTabsStore()
const settingStore = useSettingStore()
const currentTab = ref(route.fullPath)
const { useToken } = theme
const { token } = useToken()
const tabType = computed(() => {
  return {
    'tab': 'editable-card',
    'card': 'line',
    'line': 'line',
  }[settingStore.tabType]
})
const showHeader = ref(true)

watchEffect(() => {
  currentTab.value = route.fullPath
})

function onTabClick(path) {
  router.push(path)
}

function onDeleteHandle(path) {
  tabsStore.removeTab(tabsStore.tabList.findIndex(tab => tab.fullPath === path))
}
function openInNewWindow (fullPath, path) {
  window.open('#' + fullPath, path)
}

// 拖拽排序
const listContainer = ref(null)
const { setEnabled } = useSortable(listContainer, tabsStore.favoriteTabs, {
  handle: '.draggable',
  direction: 'vertical',
  animation: 180,
})

const emits = defineEmits(['toggleFullScreen'])
function toggleFullScreen () {
  emits('toggleFullScreen')
}
</script>
<style lang="less">
.nav-tabs {
  &.is-line, &.is-card {
    .ant-tabs-nav-wrap {
      padding-inline: 10px;
    }
  }
  &.is-card .ant-tabs-ink-bar {
    background-color: var(--ant-colorPrimaryBg);
    height: revert !important;
    top: 2px;
    bottom: 3px !important;
    z-index: -1;
    border-radius: var(--ant-borderRadius);
  }
  &.is-line .ant-tabs-ink-bar {
    z-index: -1;
    box-shadow: 0 -10px 20px 10px var(--ant-colorPrimaryBg);
  }
  .ant-tabs-nav {
    margin: 0;
    .ant-tabs-tab-remove {
      margin-left: 0;
      margin-right: -8px;
      margin-bottom: -1px;
    }
    .anticon {
      margin-right: 4px;
    }
  }
  .ant-tabs-tab {
    padding-inline: 8px !important;
  }
  .ant-tabs-tab + .ant-tabs-tab {
    margin-left: 10px;
  }
  .close-icon {
    margin-right: 0 !important;
    color: rgba(155, 155, 155, .5);
    &:hover {
      color: var(--ant-colorPrimary);
    }
  }
}
.sortable .draggable {
  cursor: move;
}
</style>
