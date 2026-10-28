<!-- 树形控件 -->
<template>
  <div class="c-tree">
    <a-input-search
      v-model:value="searchValue"
      :placeholder="$t('crud.pleaseEnterKeywordToSearch')"
      allowClear
      @change="onChangeHandle"
      @search="onSearchHandle"
    />
    <a-tree
      v-if="currTreeData.length"
      auto-expand-parent
      block-node
      default-expand-all
      class="mt10"
      :tree-data="currTreeData"
      :fieldNames="config.replaceField"
      @select="onSelectHandle"
    />
  </div>
</template>

<script setup>
import { isNotEmpty } from '@/utils/index.js'
import axios from '@/api/index.js'

const props = defineProps({
  /**
   * 树形配置
   * {
   *   url: '/system/org/tree', // 获取树形数据的接口地址
   *   method: 'get', // 接口请求方式
   *   params: { type: 1 }, // 请求参数
   *   replaceField: { key: 'id', title: 'label', children: 'children' } // 字段名映射
   * }
   */
  config: {
    type: Object,
    required: true
  }
})

const searchValue = ref()
const treeData = ref([])
const currTreeData = ref(treeData.value)
const childrenField = props.config.replaceField?.children ?? 'children'
const titleField = props.config.replaceField?.title ?? 'title'

onMounted(() => {
  if (props.config.url) {
    getTreeData()
  } else {
    console.error('请配置树形组件的接口地址')
  }
})
async function getTreeData () {
  const result = await axios[props.config.method ?? 'post'](props.config.url, props.config.params ?? {})
  treeData.value = result ?? []
  currTreeData.value = result ?? []
}
function onChangeHandle (e) {
  if (!e.target.value) {
    onSearchHandle()
  }
}
function onSearchHandle (_searchValue) {
  if (_searchValue) {
    currTreeData.value = filterTreeData(treeData.value, _searchValue)
  } else {
    currTreeData.value = treeData.value
  }
}
// 递归过滤树形数据函数（不改变原始数据）
function filterTreeData (datas, _searchValue) {
  return datas.reduce((result, node) => {
    const newNode = { ...node } // 创建一个新的节点，避免直接修改原始数据
    // 如果当前节点匹配搜索关键字，则加入到结果中
    let nodeIsPush = false
    if (newNode[titleField].indexOf(_searchValue) !== -1) {
      result.push(newNode)
      nodeIsPush = true
    }
    // 如果有子节点，则递归过滤子节点并加入到当前节点的子节点中
    if (newNode[childrenField]) {
      const filteredChildren = filterTreeData(newNode[childrenField], _searchValue)
      if (isNotEmpty(filteredChildren)) {
        newNode[childrenField] = filteredChildren
        !nodeIsPush && result.push(newNode)
      }
    }
    return result
  }, [])
}
function onSelectHandle (selectedKeys) {
  emits('selected', selectedKeys[0])
}

const emits = defineEmits(['selected'])
</script>

<style lang="scss" scoped>
</style>
