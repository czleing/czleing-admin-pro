<!-- 岗位管理 -->
<template>
  <CPage primary-key="postId" :filter-config="filterConfig" :table-config="tableConfig" :modal-config="modalConfig" />
</template>

<script setup>
  import CPage from '@/components/crud/c-page.vue'

  /** 查询条件配置 */
  const filterConfig = {
    fields: [
      { label: '岗位编码', fieldName: 'postCode' },
      { label: '岗位名称', fieldName: 'postName' },
      {
        label: '是否启用',
        fieldName: 'isEnabled',
        type: EControlType.eSelect,
        props: { options: EIsEnabled._list }
      }
    ]
  }

  /** 数据列表配置 */
  const tableConfig = computed(() => ({
    columns: [
      { title: '岗位编码', dataIndex: 'postCode' },
      { title: '岗位名称', dataIndex: 'postName' },
      { title: '显示顺序', dataIndex: 'postSort' },
      { title: '是否启用', dataIndex: 'isEnabled', type: 'isEnabled' },
      { title: '更新时间', dataIndex: 'updateTime' },
      { title: '备注', dataIndex: 'remark' },
      {
        title: '操作',
        actionShowNum: 2, // 展示操作按钮数量，剩余的将收进更多里
        action: ({ record }) => {
          const btns = [
            { name: '详情', callback: 'detail' },
            { name: '编辑', callback: 'edit' },
            { name: '删除', callback: 'delete' },
            {
              name: record.isEnabled ? '禁用' : '启用',
              confirm: true,
              callback: 'toggle'
            }
          ]
          return btns
        }
      }
    ]
  }))

  /**
   * 新增、修改、详情弹窗配置
   */
  const modalConfig = computed(() => ({
    title: '岗位信息', // 弹窗标题，会自动根据类型拼上新增、编辑、详情关键字
    width: 700, // 弹窗宽度，默认 600
    mode: 'modal', // 弹窗模式, modal 或 drawer
    buttonConfig: ({ isAdd, isEdit, isView }) => ({
      confirmText: isEdit ? '确认修改' : '确认提交', // 默认是确定
    }),
    // 表单配置 Object || ({ isAdd, isEdit, isView, detail }) => Object
    formConfig: ({ isAdd, isEdit, isView, detail }) => ({
      labelCol: { span: 8 },
      wrapperCol: { span: 16 },
      cols: 2, // 一行显示几列
      // 表单字段
      fields: [
        { label: '岗位编码', fieldName: 'postCode', required: true },
        { label: '岗位名称', fieldName: 'postName', required: true },
        {
          label: '显示顺序',
          fieldName: 'postSort',
          type: EControlType.eNumber,
          required: false,
          props: { precision: 0, min: 1, max: 100 }
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
