<!-- 搜索菜单按钮，点击弹出搜索框 -->
<template>
  <div @click="open">
    <a-tooltip placement="bottom" :title="$t('frame.search')">
      <SearchOutlined class="font18 pointer" />
    </a-tooltip>
  </div>
  <div v-if="isShow" :class="`search-modal ${ isOpen ? 'is-open' : ''}`" @click="close">
    <div class="search-container c-overlay pa10" @click.stop>
      <a-input-search
        ref="searchInput"
        v-model:value="searchValue"
        :placeholder="$t('crud.pleaseEnterKeywordToSearch')"
        allowClear
        class="search-input"
        :maxLength="30"
      />
      <div class="search-result mt10" @click.stop>
        <a-tree
          v-if="currTreeData.length"
          auto-expand-parent
          block-node
          default-expand-all
          :tree-data="currTreeData"
          :fieldNames="{ key: 'path', title: 'title', children: 'children' }"
          style="max-height:500px;overflow:auto;"
          @select="onSelectHandle"
        >
          <template #title="{ path, title, meta }">
            <div class="flex-x x-middle gap8 pl5 lh2_5">
              <a-icon v-if="meta?.icon" :type="meta.icon" />
              <div v-if="title">
                <span v-for="(segment, index) in splitTitleByKeyword(String(title))" :key="`${index}_${segment.text}`" :class="{ 'text-danger bold': segment.matched }">{{ segment.text }}</span>
              </div>
              <span class="text-gray em09">{{ path }}</span>
            </div>
          </template>
        </a-tree>
        <div v-else-if="searchValue" class="tc em09 py10 text-gray">{{ $t('frame.noSearchResult') }} "<span class="bold">{{ searchValue }}</span>"</div>
        <div v-if="!currTreeData.length && cacheStore.searchedMenus.length" class="cache">
          <div class="em08 text-gray">{{ $t('frame.searchRecord') }}</div>
          <div class="cache-list mt10">
            <div v-for="(cache, index) in cacheStore.searchedMenus" :key="cache.path" class="cache-item radius-ant pa10 flex-x-between gap10 pointer" @click="toPath(cache)">
              <div class="flex-x x-middle gap8">
                <a-icon v-if="cache.icon" :type="cache.icon" />
                <span>{{ cache.title }}</span>
              </div>
              <close-outlined class="close em08" @click.stop="removeCache(index)" />
            </div>
          </div>
        </div>
        <a-empty v-if="!currTreeData.length && !cacheStore.searchedMenus.length && !searchValue" :description="$t('crud.pleaseEnterKeywordToSearch')" />
      </div>
    </div>
  </div>
</template>
 <script setup>
  import { useCacheStore } from '@/stores/cache-store'
  import { useMenuStore } from '@/stores/menu-store'
  import { useTabsStore } from '@/stores/tabs-store'
  import { CloseOutlined, SearchOutlined } from '@ant-design/icons-vue'
  import { useDebounceFn } from '@vueuse/core'

  defineOptions({ inheritAttrs: false })
  const tabsStore = useTabsStore()
  const menuStore = useMenuStore()
  const cacheStore = useCacheStore()
  const searchValue = ref()
  const searchInput = ref()
  const currTreeData = ref([])
  const isShow = ref(false)
  const isOpen = ref(false)
  const router = useRouter()

  watch(
    () => searchValue.value,
    () => {
      onSearchHandle()
    }
  )

  const onSearchHandle = useDebounceFn(() => {
    if (searchValue.value) {
      currTreeData.value = filterTreeData(menuStore.navRoutes, searchValue.value)
    } else {
      currTreeData.value = []
    }
  }, 200)

  function filterTreeData (datas, _searchValue) {
    return datas.reduce((result, node) => {
      const newNode = { ...node, title: node.meta?.title }
      let nodeIsPush = false
      const searchStr = newNode.path + '_' + (newNode.title ?? '')
      if (searchStr.toLowerCase().includes(_searchValue.toLowerCase()) && newNode.meta?.hidden !== true && newNode.meta?.hiddenTab !== true) {
        result.push(newNode)
        nodeIsPush = true
      }
      if (newNode.children) {
        const filteredChildren = filterTreeData(newNode.children, _searchValue)
        if (filteredChildren?.length) {
          newNode.children = filteredChildren
          !nodeIsPush && result.push(newNode)
        }
      }
      return result
    }, [])
  }

  /**
   * 按搜索关键字将标题切分为片段数组，关键字片段标记 matched
   * 以文本插值 + 片段样式替代 v-html 字符串拼接，避免用户输入注入 HTML 造成 XSS
   * @param {string} title 菜单标题
   * @returns {Array<{ text: string, matched: boolean }>} 渲染片段数组
   */
  function splitTitleByKeyword (title) {
    const keyword = searchValue.value ?? ''
    if (!keyword || !title) return [{ text: title, matched: false }]
    const segments = []
    const lowerTitle = title.toLowerCase()
    const lowerKeyword = keyword.toLowerCase()
    let start = 0
    let index = lowerTitle.indexOf(lowerKeyword, start)
    while (index > -1) {
      if (index > start) {
        segments.push({ text: title.slice(start, index), matched: false })
      }
      segments.push({ text: title.slice(index, index + keyword.length), matched: true })
      start = index + keyword.length
      index = lowerTitle.indexOf(lowerKeyword, start)
    }
    if (start < title.length) {
      segments.push({ text: title.slice(start), matched: false })
    }
    return segments
  }

  function onSelectHandle (selectedKeys, { node }) {
    if (node.path) {
      if (node.meta?.target) {
        window.open(node.path, node.meta?.target)
      } else if (node.meta?.isLeaf) {
        router.push(node.path)
      } else {
        return
      }
      addCache({ path: node.path, title: node.title, icon: node.meta?.icon, target: node.meta?.target })
      searchValue.value = ''
      close()
    }
  }

  /** 添加缓存 */
  function addCache (menu) {
    const list = cacheStore.searchedMenus
    if (list.some(item => item.path === menu.path)) return
    list.unshift(menu)
    if (list.length > 10) {
      list.pop()
    }
  }
  function removeCache (index) {
    cacheStore.searchedMenus.splice(index, 1)
  }
  function toPath (cache) {
    if (cache.target) {
      window.open(cache.path, cache.target)
    } else {
      router.push(cache.path)
    }
    close()
  }

  function open () {
    isShow.value = true
    setTimeout(() => {
      isOpen.value = true
      searchInput.value?.focus()
    })
  }

  function close () {
    isOpen.value = false
    setTimeout(() => {
      isShow.value = false
    }, 300)
  }

</script>

<style scoped lang="less">
  .search-modal {
    position: fixed;
    z-index: 999;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.6);
    transition: opacity .3s;
    opacity: 0;
    &.is-open {
      opacity: 1;
      .search-container {
        margin-top: 200px !important;
      }
    }
    .search-container {
      width: 450px;
      margin: 100px auto 0;
      transition: margin-top .3s;
      line-height: 1.2;
      .search-input {
        // ::v-deep(.ant-input, .ant-btn) {
        //   background-color: transparent !important;
        // }
      }
      .search-result {
        .cache {
          .cache-list {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
            gap: 10px;
            .cache-item {
              background-color: rgba(133, 133, 133, .1);
              transition: background-color .3s;
              .close {
                visibility: hidden;
              }
              &:hover {
                background-color: rgba(188, 188, 188, .1);
                .close {
                  visibility: visible;
                }
              }
            }
          }
        }
      }
    }
  }
</style>