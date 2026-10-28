<!-- 定时任务调度日志 -->
<template>
  <CPage
    ref="cPage"
    hasExport
    noAdd
    noDelete
    noSelect
    :filter-config="filterConfig"
    :before-search="beforeSearch"
    :table-config="tableConfig"
    :modal-config="modalConfig"
  />
</template>

<script setup>
  import CPage from '@/components/crud/c-page.vue'

  const cPage = ref()
  const { t } = useI18n()
  const route = useRoute()
  const jobId = route.query.jobId
  /** 查询条件配置 */
  const filterConfig = computed(() => ({
    col: { span: 5 },
    fields: [
      {
        label: '任务名称',
        fieldName: 'jobName',
      },
      {
        label: '任务组名',
        fieldName: 'jobGroup',
        type: EControlType.eSelect,
        props: {
          dictType: 'sys_job_group',
        }
      },
      {
        label: '调用目标字符串',
        fieldName: 'invokeTarget',
      },
      {
        label: '执行状态',
        fieldName: 'status',
        type: EControlType.eSelect,
        props: {
          dictType: 'sys_common_status',
        }
      },
    ]
  }))

  /** 数据列表配置 */
  const tableConfig = computed(() => ({
    columns: [
      {
        title: '任务名称',
        dataIndex: 'jobName',
        align: 'left',
      },
      {
        title: '任务组名',
        dataIndex: 'jobGroup',
        dictType: 'sys_job_group'
      },
      {
        title: '调用目标字符串',
        dataIndex: 'invokeTarget',
      },
      {
        title: '开始时间',
        dataIndex: 'startTime',
      },
      {
        title: '结束时间',
        dataIndex: 'stopTime',
      },
      {
        title: '运行时长',
        dataIndex: 'dateTimePoor',
      },
      {
        title: '执行状态',
        dataIndex: 'status',
        dictType: 'sys_common_status'
      },
      {
        title: '操作',
        actionShowNum: 3, // 展示操作按钮数量，剩余的将收进更多里
        action: ({ record }) => {
          const btns = [
            // 预设：edit, detail, delete, toggle
            {
              name: '详情',
              callback: 'detail'
            },
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
    title: '定时任务调度日志', // 弹窗标题，会自动根据类型拼上新增、编辑、详情关键字
    width: 700, // 弹窗宽度，默认 600
    mode: 'modal', // 弹窗模式, modal 或 drawer
    buttonConfig: ({ isAdd, isEdit, isView }) => ({
      confirmText: isEdit ? t('common.confirmUpdate') : t('common.confirmSubmit'), // 默认是确定
    }),
    // 表单配置 Object || ({ isAdd, isEdit, isView, detail }) => Object
    formConfig: ({ isAdd, isEdit, isView, detail }) => ({
      labelCol: { span: 8 },
      wrapperCol: { span: 16 },
      colSize: 2, // 一行显示几列
      // 表单字段
      fields: [
        {
          label: '任务名称',
          fieldName: 'jobName',
        },
        {
          label: '任务组名',
          fieldName: 'jobGroup',
          type: EControlType.eSelect,
          props: {
            dictType: 'sys_job_group'
          }
        },
        {
          label: '创建时间',
          fieldName: 'createTime',
        },
        {
          label: '调用目标字符串',
          fieldName: 'invokeTarget',
          type: EControlType.eTextarea,
          required: true,
          singleLine: true,
          labelCol: { span: 4 },
          wrapperCol: { span: 20 },
          props: {
          }
        },
        {
          label: '日志信息',
          fieldName: 'jobMessage',
          type: EControlType.eTextarea,
          required: true,
          singleLine: true,
          labelCol: { span: 4 },
          wrapperCol: { span: 20 },
          props: {
          }
        },
        {
          label: '执行状态',
          fieldName: 'status',
          type: EControlType.eSelect,
          props: {
            dictType: 'sys_common_status',
          }
        },
        {
          label: '异常信息',
          fieldName: 'exceptionInfo',
          type: EControlType.eTextarea,
          required: true,
          singleLine: true,
          labelCol: { span: 4 },
          wrapperCol: { span: 20 },
          props: {
          }
        },
      ]
    })
  }))

  /**
   * 查询前修改查询参数
   * @param {Object} searchParams 查询参数
   */
  function beforeSearch (searchParams) {
    searchParams.jobId = jobId
    return searchParams
  }
</script>

<style lang="scss" scoped>
</style>
