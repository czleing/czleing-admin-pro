<!-- 通知公告 -->
<template>
  <CPage
    hasExport
    :filter-config="filterConfig"
    :table-config="tableConfig"
    :modal-config="modalConfig"
  />
</template>

<script setup>
  import CPage from '@/components/crud/c-page.vue'
  import { EControlType, EIsEnabled } from '@/enum/index.js'

  /** 查询条件配置 */
  const filterConfig = {
    fields: [
      { label: '通告标题', fieldName: 'noticeTitle' },
      {
        label: '通告类型',
        fieldName: 'noticeType',
        type: EControlType.eSelect,
        props: { dictType: 'sys_notice_type' }
      },
      {
        label: '是否启用',
        fieldName: 'isEnabled',
        type: EControlType.eSelect,
        props: { options: EIsEnabled._list }
      },
    ]
  }

  /** 数据列表配置 */
  const tableConfig = computed(() => ({
    columns: [
      { title: '通告标题', dataIndex: 'noticeTitle' },
      { title: '通告类型', dataIndex: 'noticeType', dictType: 'sys_notice_type' },
      { title: '是否启用', dataIndex: 'isEnabled', type: 'isEnabled' },
      {
        title: '操作',
        actionShowNum: 4, // 展示操作按钮数量，剩余的将收进更多里
        action: ({ record }) => [
          { name: '详情', callback: 'detail' },
          { name: '编辑', callback: 'edit' },
          { name: '删除', callback: 'delete' },
          { name: record.isEnabled ? '禁用' : '启用', confirm: true, callback: 'toggle' }
        ]
      }
    ]
  }))

  /** 新增、修改、详情弹窗配置 */
  const modalConfig = computed(() => ({
    title: '通知公告', // 弹窗标题，会自动根据类型拼上新增、编辑、详情关键字
    width: 900, // 弹窗宽度，默认 600
    mode: 'modal', // 弹窗模式, modal 或 drawer
    buttonConfig: ({ isAdd, isEdit, isView }) => ({
      confirmText: isEdit ? '确认修改' : '确认提交', // 默认是确定
    }),
    // 表单配置 Object || ({ isAdd, isEdit, isView, detail }) => Object
    formConfig: ({ isAdd, isEdit, isView, detail }) => ({
      labelCol: { span: 8 },
      wrapperCol: { span: 16 },
      colSize: 2, // 一行显示几列
      // 表单字段
      fields: [
        { label: '通告标题', fieldName: 'noticeTitle', required: true },
        {
          label: '通告类型',
          fieldName: 'noticeType',
          type: EControlType.eSelect,
          required: true,
          props: { dictType: 'sys_notice_type' }
        },
        {
          label: '通告内容',
          fieldName: 'noticeContent',
          type: EControlType.eEditor,
          singleLine: true,
          labelCol: { span: 4 },
          wrapperCol: { span: 20 },
          required: true,
          props: { height: '300px' }
        },
        {
          label: '备注',
          fieldName: 'remark',
          type: EControlType.eTextarea,
          required: false,
          singleLine: true,
          labelCol: { span: 4 },
          wrapperCol: { span: 20 },
        },
      ]
    })
  }))
</script>
