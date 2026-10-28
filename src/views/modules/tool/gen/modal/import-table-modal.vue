<!-- 代码生成-导入表弹窗 -->
<template>
  <CModal
    ref="cModal"
    title="导入表"
    width="800"
    :confirm-disabled="selectedNum < 1"
    :onConfirm="beforeConfirm"
    :confirm-text="`确定(${selectedNum})`"
    :onCancel="beforeCancel"
  >
    <CPage
      ref="cPage"
      noTools
      :api-config="{
        list: '/tool/gen/db/list'
      }"
      :api-option-config="{
        list: {
          headers: {
            datasource
          }
        }
      }"
      primary-key="tableName"
      :filter-config="filterConfig"
      :table-config="tableConfig"
    />
  </CModal>
</template>

<script setup>
import CPage from '@/components/crud/c-page.vue'

const _this = getCurrentInstance().proxy
const cPage = ref()
const cModal = ref()

const props = defineProps({
  datasource: String
})
const selectedNum = computed(() => cPage.value?.selectedIds?.length ?? 0)

const filterConfig = {
  fields: [
    {
      label: '表名称',
      fieldName: 'tableName',
      type: EControlType.eInput,
      col: { span: 8 },
      props: {
      }
    },
    {
      label: '表描述',
      fieldName: 'tableComment',
      type: EControlType.eInput,
      col: { span: 8 },
      props: {
      }
    }
  ]
}

const tableConfig = computed(() => ({
  props: {
    rowClick ({ key, record, selected, selectedIds, selectedObjs }) { // 配置数据行点击事件
      if (!selected) {
        selectedIds.value.push(key)
        selectedObjs.value.push(record)
      } else {
        selectedIds.value = selectedIds.value.filter(id => id !== key)
        selectedObjs.value = selectedObjs.value.filter(item => item.id !== key)
      }
    }
  },
  initSearch: true, // 默认 true，初始化时查询
  columns: [
    {
      title: '表名称',
      dataIndex: 'tableName'
    },
    {
      title: '表描述',
      dataIndex: 'tableComment'
    },
    {
      title: '创建时间',
      dataIndex: 'createTime'
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime'
    }
  ]
}))

async function beforeConfirm (close) {
  const selectedTableNames = cPage.value.selectedIds
  if (isEmpty(selectedTableNames)) {
    _this.$message.error('请先选择表')
    throw new Error('请先选择表')
  }
  await $axios.post('/tool/gen/importTable', { tables: selectedTableNames.join(',') }, {
    headers: {
      datasource: props.datasource
    }
  })
  close()
  emits('completed')
}

const emits = defineEmits(['completed'])

function open (options) {
  cModal.value.open()
}

function beforeCancel () {
  cPage.value.clearSelect()
}

function close () {
  cModal.value.close()
}

defineExpose({
  open,
  close
})
</script>

<style lang="scss" scoped>
</style>
