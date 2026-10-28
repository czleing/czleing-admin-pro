<!-- 部门管理页面 -->
<template>
  <CPage
    ref="cPage"
    primary-key="deptId"
    :filter-config="filterConfig"
    :after-search="afterSearch"
    :table-config="tableConfig"
    :modal-config="modalConfig"
  />
</template>

<script setup>
import CPage from '@/components/crud/c-page.vue'
import { listToTree } from '@/utils/index.js'

const cPage = ref()
const filterConfig = {
  fields: [
    { label: '部门名称', fieldName: 'deptName' },
    { label: '是否启用', fieldName: 'isEnabled', type: EControlType.eSelect, props: { options: EIsEnabled._list } }
  ]
}
const tableConfig = computed(() => ({
  props: { usePage: false },
  columns: [
    { title: '部门名称', dataIndex: 'deptName', align: 'left', resizable: true, width: 150 },
    { title: '负责人', dataIndex: 'leader', default: '-' },
    { title: '负责人电话', dataIndex: 'phone', default: '-' },
    { title: '是否启用', dataIndex: 'isEnabled', type: 'isEnabled' },
    { title: '更新时间', dataIndex: 'updateTime', isDateTime: true },
    { title: '操作', actionShowNum: 5, action: ({ record }) => [
      { name: '详情', callback: 'detail' },
      { name: '编辑', callback: 'edit' },
      { name: '新增', permission: 'system:dept:add', callback () { addChildren(record) } },
      { name: record.isEnabled ? '禁用' : '启用', confirm: true, callback: 'toggle' },
      { name: '删除', callback: 'delete' }
    ]}
  ]
}))
const modalConfig = computed(() => ({
  title: '部门',
  width: 800,
  formConfig: ({ isAdd, isEdit, isView, detail }) => ({
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
    fields: [
      {
        label: '上级部门',
        fieldName: 'parentId',
        type: EControlType.eTreeSelect,
        required: true,
        singleLine: true,
        labelCol: { span: 4 },
        wrapperCol: { span: 20 },
        props: {
          fieldNames: { value: 'id', label: 'label' },
          remote: {
            url: '/system/dept/tree',
            converter: result => [ { id: 0, label: '根级部门', parentId: '', children: result } ]
          }
        }
      },
      { label: '部门名称', fieldName: 'deptName', required: true, props: { allowClear: true } },
      { label: '负责人', fieldName: 'leader', props: { allowClear: true } },
      { label: '负责人电话', fieldName: 'phone', rules: {
          pattern: new RegExp(/^1[3456789]\d{9}$/),
          message: '请输入正确的手机号码',
          trigger: 'change'
        }, props: { maxlength: 11 }
      },
      { label: '邮箱地址', fieldName: 'email', rules: { type: 'email', message: '请输入正确的邮箱地址', trigger: 'change' } },
      {
        label: '排序',
        fieldName: 'sort',
        type: EControlType.eNumber,
        required: true,
        defaultValue: 1,
        props: { precision: 0, min: 1, max: 10000 }
      }
    ]
  })
}))

function addChildren (record) {
  cPage.value.onAddHandle({ parentId: record.deptId })
}

function afterSearch (list) {
  return listToTree(list, 0, 'deptId')
}
</script>
