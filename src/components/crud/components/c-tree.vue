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
      :tree-data="treeDataNodes"
      :fieldNames="config.replaceField"
      @select="onSelectHandle"
    />
  </div>
</template>

<script setup lang="ts">
import type { TreeProps } from 'ant-design-vue'
import { isNotEmpty } from '@/utils/index'
import { crudRequest } from '../utils/request'
import type { CrudRecord, TreeConfig } from '../types'

const props = defineProps<{
  /**
   * 树形配置
   * {
   *   url: '/system/org/tree', // 获取树形数据的接口地址
   *   method: 'get', // 接口请求方式
   *   params: { type: 1 }, // 请求参数
   *   replaceField: { key: 'id', title: 'label', children: 'children' } // 字段名映射
   * }
   */
  config: TreeConfig
}>()

const searchValue = ref('')
const treeData = ref<CrudRecord[]>([])
const currTreeData = ref<CrudRecord[]>(treeData.value)
const childrenField = props.config.replaceField?.children ?? 'children'
const titleField = props.config.replaceField?.title ?? 'title'
/** a-tree 需要的节点结构，业务数据通过 replaceField 做字段映射 */
const treeDataNodes = computed(() => currTreeData.value as unknown as TreeProps['treeData'])

onMounted(() => {
  if (props.config.url) {
    void getTreeData()
  } else {
    console.error('请配置树形组件的接口地址')
  }
})
async function getTreeData(): Promise<void> {
  const result = await crudRequest<CrudRecord[]>(
    props.config.method ?? 'get',
    props.config.url,
    props.config.params ?? {}
  )
  treeData.value = result ?? []
  currTreeData.value = result ?? []
}
function onChangeHandle(e: Event): void {
  const target = e.target as HTMLInputElement | null
  if (!target?.value) {
    onSearchHandle()
  }
}
function onSearchHandle(_searchValue?: string): void {
  if (_searchValue) {
    currTreeData.value = filterTreeData(treeData.value, _searchValue)
  } else {
    currTreeData.value = treeData.value
  }
}
// 递归过滤树形数据函数（不改变原始数据）
function filterTreeData(datas: CrudRecord[], _searchValue: string): CrudRecord[] {
  return datas.reduce<CrudRecord[]>((result, node) => {
    const newNode = { ...node } // 创建一个新的节点，避免直接修改原始数据
    // 如果当前节点匹配搜索关键字，则加入到结果中
    let nodeIsPush = false
    if (String(newNode[titleField]).indexOf(_searchValue) !== -1) {
      result.push(newNode)
      nodeIsPush = true
    }
    // 如果有子节点，则递归过滤子节点并加入到当前节点的子节点中
    const children = newNode[childrenField]
    if (children && Array.isArray(children)) {
      const filteredChildren = filterTreeData(children as CrudRecord[], _searchValue)
      if (isNotEmpty(filteredChildren)) {
        newNode[childrenField] = filteredChildren
        if (!nodeIsPush) result.push(newNode)
      }
    }
    return result
  }, [])
}
function onSelectHandle(selectedKeys: (string | number)[]): void {
  emits('selected', selectedKeys[0])
}

const emits = defineEmits<{
  (e: 'selected', key?: string | number): void
}>()
</script>

<style lang="scss" scoped>
</style>
