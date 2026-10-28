<!-- 代码生成-模型列表 -->
<template>
  <div class="gen-page">
    <CPage
      ref="cPage"
      noAdd
      primary-key="tableId"
      :api-option-config="{
        list: { headers: { datasource } },
        update: { headers: { datasource } },
        delete: { headers: { datasource } },
        detail: { headers: { datasource } }
      }"
      :tools-config="toolsConfig"
      :filter-config="filterConfig"
      :table-config="tableConfig"
    />
    <!-- 导入表格 -->
    <ImportTableModal ref="importTableModal" :datasource="datasource" @completed="refresh" />
    <!-- 编辑表格 -->
    <EditModal ref="editModal" :datasource="datasource" />
    <!-- 预览 -->
    <PreviewModal ref="previewModal" :datasource="datasource" />
  </div>
</template>

<script setup>
import CPage from '@/components/crud/c-page.vue'
import ImportTableModal from './modal/import-table-modal.vue'
import EditModal from './modal/edit-modal.vue'
import PreviewModal from './modal/preview-modal.vue'
import axios from '@/api/index.js'
import { message } from 'ant-design-vue'

const cPage = ref()
const importTableModal = ref()
const editModal = ref()
const previewModal = ref()
const datasource = 'master'
defineOptions({
  name: 'ToolGenPage'
})

const filterConfig = computed(() => ({
  fields: [
    {
      label: '表名称',
      fieldName: 'tableName',
      type: EControlType.eInput,
      props: {
      }
    },
    {
      label: '表描述',
      fieldName: 'tableComment',
      type: EControlType.eInput,
      props: {
      }
    }
  ]
}))
const toolsConfig = computed(() => ({
  otherTools: [
    {
      name: '导入表',
      permission: 'tool:gen:import',
      props: {
        type: 'primary',
        icon: 'ImportOutlined',
        onClick ({ selectedIds, selectedObjs, pagination }) {
          importTableModal.value.open()
        }
      }
    }
  ]
}))
const tableConfig = computed(() => ({
  props: {
    // rowClick (record, index, selected) { // 配置数据行点击事件
    //   selectedObj.value = selected ? record : undefined
    // }
  },
  initSearch: true, // 默认 true，初始化时查询
  columns: [
    {
      title: 'ID',
      dataIndex: 'tableId',
      hidden: true
    },
    {
      title: '表名称',
      dataIndex: 'tableName'
    },
    {
      title: '表描述',
      dataIndex: 'tableComment'
    },
    {
      title: '实体',
      dataIndex: 'className'
    },
    {
      title: '状态',
      dataIndex: 'status',
      dictType: 'gen_status'
    },
    {
      title: '创建时间',
      dataIndex: 'createTime'
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime'
    },
    {
      title: '操作',
      actionShowNum: 5,
      action: ({ record }) => {
        const btns = [
          {
            name: '预览',
            permission: 'tool:gen:preview',
            callback () {
              handlePreview(record)
            }
          }
        ]
        if (record.status === '0') { // 未生成
          btns.push(...[
            {
              name: '编辑',
              permission: 'edit',
              callback () {
                editModal.value.open(record)
              }
            },
            {
              name: '删除',
              callback: 'delete' // 删除操作默认带确认框
            },
            {
              name: '同步',
              permission: 'tool:gen:edit',
              confirm: true,
              callback () {
                handleSyncDb(record)
              }
            },
            {
              name: '生成代码',
              permission: 'tool:gen:code',
              confirm: true,
              callback () {
                handleGenTable(record)
              }
            }
          ])
        }
        return btns
      }
    }
  ]
}))

/**
 * 预览
 * @param {Object} record 
 */
function handlePreview (record) {
  previewModal.value.open(record)
}

/**
 * 同步
 * @param {Object} record 
 */
async function handleSyncDb (record) {
  await axios.post('/tool/gen/synchDb/' + record.tableName, {}, { headers: { datasource } })
  message.success('同步成功')
}

/**
 * 生成代码
 * @param {Object} record 
 */
async function handleGenTable (record) {
  if (record.genType === '1') {
    await axios.post('/tool/gen/genCode/' + record.tableName, {}, { headers: { datasource } })
    message.success('成功生成到自定义路径')
    refresh()
  } else {
    await axios.download('/tool/gen/download/' + record.tableName, {}, { headers: { datasource } })
  }
}

function refresh () {
  cPage.value?.refresh()
}
</script>

<style lang="scss" scoped>
</style>

