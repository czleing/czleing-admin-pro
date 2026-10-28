<!-- 定时任务调度 -->
<template>
  <CPage
    ref="cPage"
    :filter-config="filterConfig"
    :table-config="tableConfig"
    :modal-config="modalConfig"
  />
</template>

<script setup>
  import CPage from '@/components/crud/c-page.vue'
  import { EControlType, EIsEnabled } from '@/enum/index.js'
  import { message } from 'ant-design-vue'

  const cPage = ref()
  const { t } = useI18n()

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
        label: '是否启用',
        fieldName: 'isEnabled',
        type: EControlType.eSelect,
        props: {
          options: EIsEnabled._list
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
        dictType: 'sys_job_group',
      },
      {
        title: '调用目标字符串',
        dataIndex: 'invokeTarget',
      },
      {
        title: 'cron执行表达式',
        dataIndex: 'cronExpression',
      },
      {
        title: '失火策略',
        dataIndex: 'misfirePolicy',
        customRender: ({ text }) => EMisfirePolicy._of(text)
      },
      {
        title: '是否并发执行',
        dataIndex: 'concurrent',
        type: 'Boolean'
      },
      {
        title: '是否启用',
        dataIndex: 'isEnabled',
        width: 90,
        type: 'isEnabled'
      },
      // {
      //   title: '备注信息',
      //   dataIndex: 'remark',
      // },
      {
        title: '操作',
        actionShowNum: 5, // 展示操作按钮数量，剩余的将收进更多里
        action: ({ record }) => {
          const btns = [
            // 预设：edit, detail, delete, toggle
            {
              name: record.isEnabled ? '禁用' : '启用',
              confirm: true,
              callback: 'toggle'
            },
            {
              name: '编辑',
              callback: 'edit'
            },
            {
              name: '详情',
              callback: 'detail'
            },
            {
              name: '删除',
              callback: 'delete' // 删除操作默认带确认框
            },
          ]
          if (record.isEnabled) {
            btns.unshift({
              name: '运行',
              async callback () {
                await $axios.post('/system/job/run', { id: record.id })
                message.success('运行成功')
              }
            })
          }
          return btns
        }
      }
    ]
  }))
  /**
   * 新增、修改、详情弹窗配置
   */
  const modalConfig = computed(() => ({
    title: '定时任务调度', // 弹窗标题，会自动根据类型拼上新增、编辑、详情关键字
    width: 900, // 弹窗宽度，默认 600
    mode: 'modal', // 弹窗模式, modal 或 drawer
    buttonConfig: ({ isAdd, isEdit, isView }) => ({
      confirmText: isEdit ? t('common.confirmUpdate') : t('common.confirmSubmit'), // 默认是确定
    }),
    // 表单配置 Object || ({ isAdd, isEdit, isView, detail }) => Object
    formConfig: ({ isAdd, isEdit, isView, detail }) => ({
      labelCol: { span: 8 },
      wrapperCol: { span: 16 },
      cols: 2, // 一行显示几列
      // 表单字段
      fields: [
      {
        label: '任务名称',
        fieldName: 'jobName',
        type: EControlType.eInput,
        required: true,
      },
      {
        label: '任务组名',
        fieldName: 'jobGroup',
        type: EControlType.eSelect,
        required: true,
        props: {
          dictType: 'sys_job_group',
        }
      },
      {
        label: '调用目标字符串',
        fieldName: 'invokeTarget',
        type: EControlType.eInput,
        tooltip: '类名+方法名，如：com.admin.task.TestTask.testNoParams',
        required: true,
        props: {
        }
      },
      {
        label: 'cron执行表达式',
        fieldName: 'cronExpression',
        type: EControlType.eInput,
        defaultValue: '0 0 3 * * ?',
        required: true,
        props: {
        }
      },
      {
        label: '失火策略',
        fieldName: 'misfirePolicy',
        type: EControlType.eSelect,
        required: true,
        defaultValue: EMisfirePolicy.eDefault,
        tooltip: '之前因未知原因没有执行的补救策略',
        props: {
          options: EMisfirePolicy._list
        }
      },
      {
        label: '是否并发执行',
        fieldName: 'concurrent',
        type: EControlType.eSwitch,
        required: true,
        defaultValue: false,
        props: {
        }
      },
      {
        label: '备注信息',
        fieldName: 'remark',
        type: EControlType.eTextarea,
        required: false,
        singleLine: true,
        labelCol: { span: 4 },
        wrapperCol: { span: 20 },
        props: {
        }
      },
    ]
  })
}))
</script>

<style lang="scss" scoped>
</style>
