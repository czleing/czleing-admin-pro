<!-- 登录日志 -->
<template>
  <CPage
    noAdd
    hasExport
    primary-key="infoId"
    ref="cPage"
    :filter-config="filterConfig"
    :tools-config="toolsConfig"
    :table-config="tableConfig"
    :modal-config="modalConfig"
  />
</template>

<script setup>
  import CPage from '@/components/crud/c-page.vue'
  import { EControlType } from '@/enum/index.js'
  import axios from '@/api'
  import { Modal, message } from 'ant-design-vue'
  import dayjs from 'dayjs'

  const cPage = ref()
  /** 查询条件配置 */
  const filterConfig = {
    fields: [
      {
        label: '用户账号',
        fieldName: 'userName',
        type: EControlType.eInput,
        col: { span: 4 },
        props: {
        }
      },
      {
        label: '登录IP',
        fieldName: 'ipaddr',
        type: EControlType.eInput,
        col: { span: 4 },
        props: {
        }
      },
      {
        label: '登录状态',
        fieldName: 'status',
        type: EControlType.eSelect,
        col: { span: 4 },
        props: {
          dictType: 'sys_common_status',
        }
      },
      {
        label: '登录时间',
        fieldName: 'loginTime',
        type: EControlType.eDateRange,
        col: { span: 7 },
        props: {
        }
      },
    ]
  }
  /** 自定义工具栏按钮配置 */
  const toolsConfig = {
    otherTools: [
      {
        name: '账户解锁',
        permission: 'system:loginlog:unlock',
        props: {
          type: 'primary',
          icon: 'UnlockOutlined',
          disabled: ({ selectedIds }) => selectedIds.length !== 1,
          onClick ({ selectedObjs }) {
            Modal.confirm({
              title: '温馨提示',
              content: '确认要解锁该用户？',
              async onOk () {
                await axios.post(`/system/log/login-log/unlock/${selectedObjs[0].userName ?? ''}`)
                message.success('解锁成功！')
                cPage.value.refresh()
                cPage.value.clearSelect()
              }
            })
          }
        }
      }
    ]
  }
  /** 数据列表配置 */
  const tableConfig = computed(() => ({
    columns: [
      {
        title: '用户账号',
        dataIndex: 'userName',
      },
      {
        title: '登录IP地址',
        dataIndex: 'ipaddr',
      },
      {
        title: '登录地点',
        dataIndex: 'loginLocation',
      },
      {
        title: '浏览器类型',
        dataIndex: 'browser',
      },
      {
        title: '操作系统',
        dataIndex: 'os',
      },
      {
        title: '登录状态',
        dataIndex: 'status',
        dictType: 'sys_common_status',
      },
      {
        title: '提示消息',
        dataIndex: 'msg',
      },
      {
        title: '登录时间',
        dataIndex: 'loginTime',
      }
    ]
  }))
  /**
   * 新增、修改、详情弹窗配置
   */
  const modalConfig = computed(() => ({
    title: '登录日志',
    width: 700,
    mode: 'modal',
    buttonConfig: ({ isAdd, isEdit, isView }) => ({
      confirmText: isEdit ? '确认修改' : '确认提交',
    }),
    formConfig: ({ isAdd, isEdit, isView, detail }) => ({
      labelCol: { span: 8 },
      wrapperCol: { span: 16 },
      cols: 2,
      fields: [
        {
          label: '用户账号',
          fieldName: 'userName',
          type: EControlType.eInput,
          required: true,
          props: {
          }
        },
        {
          label: '登录IP地址',
          fieldName: 'ipaddr',
          type: EControlType.eInput,
          required: true,
          props: {
          }
        },
        {
          label: '登录地点',
          fieldName: 'loginLocation',
          type: EControlType.eInput,
          required: true,
          props: {
          }
        },
        {
          label: '浏览器类型',
          fieldName: 'browser',
          type: EControlType.eInput,
          required: true,
          props: {
          }
        },
        {
          label: '操作系统',
          fieldName: 'os',
          type: EControlType.eInput,
          required: true,
          props: {
          }
        },
        {
          label: '登录状态',
          fieldName: 'status',
          type: EControlType.eSelect,
          required: true,
          props: {
            dictType: 'sys_common_status',
          }
        },
        {
          label: '提示消息',
          fieldName: 'msg',
          type: EControlType.eTextarea,
          required: true,
          singleLine: true,
          labelCol: { span: 4 },
          wrapperCol: { span: 20 },
          props: {
          }
        },
        {
          label: '登录时间',
          fieldName: 'loginTime',
          type: EControlType.eDate,
          required: true,
          props: {
          }
        },
      ]
    })
  }))
</script>
