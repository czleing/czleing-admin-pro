<!-- 角色管理 -->
<template>
  <div class="role-page">
    <CPage
      ref="cPage"
      primary-key="roleId"
      :filter-config="filterConfig"
      :table-config="tableConfig"
      :modal-config="modalConfig"
      :after-open-modal="afterOpenModal"
    />
    <!-- 数据权限分配 -->
    <CModal ref="cModal" :footer="null">
      <CForm
        ref="cForm"
        :detail="scopeDetail"
        :form-config="formConfig"
        :onSubmitHandle="onSubmitHandle"
      />
    </CModal>
  </div>
</template>

<script setup>
import CPage from '@/components/crud/c-page.vue'
import axios from '@/api/index.js'
import { message } from 'ant-design-vue'

const { t } = useI18n()
const filterConfig = computed(() => ({
  fields: [
    {
      label: t('system.role.name'),
      fieldName: 'dictName',
      type: EControlType.eInput,
      props: {
        placeholder: t('system.role.namePlaceholder')
      }
    }
  ]
}))
const tableConfig = computed(() => ({
  columns: [
    {
      title: t('system.role.sort'),
      dataIndex: 'roleSort'
    },
    {
      title: t('system.role.code'),
      dataIndex: 'roleId',
      hidden: true
    },
    {
      title: t('system.role.name'),
      dataIndex: 'roleName'
    },
    {
      title: t('system.role.key'),
      dataIndex: 'roleKey'
    },
    {
      title: t('system.role.status'),
      dataIndex: 'isEnabled',
      type: 'isEnabled'
    },
    {
      title: t('system.role.createTime'),
      dataIndex: 'createTime'
    },
    {
      title: t('system.role.actions'),
      actionShowNum: 4,
      action: ({ record }) => {
        return [
          {
            name: t('system.role.dataPermission'),
            permission: 'system:role:edit',
            callback () {
              openDataScope(record)
            }
          },
          {
            name: t('system.role.edit'),
            callback: 'edit'
          },
          {
            name: record.isEnabled ? t('system.role.disable') : t('system.role.enable'),
            confirm: true,
            callback: 'toggle'
          },
          {
            name: t('system.role.delete'),
            callback: 'delete' // 删除操作默认带确认框
          }
        ]
      }
    }
  ]
}))
/**
 * 新增、修改、详情配置
 */
const modalConfig = computed(() => ({
  title: t('system.role.title'),
  width: 800,
  mode: 'modal',
  buttonConfig: ({ isAdd, isEdit, isView }) => ({
    confirmText: isEdit ? t('system.role.confirmEdit') : t('system.role.confirmSubmit')
  }),
  formConfig: ({ isAdd, isEdit, isView, detail }) => ({
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
    cols: 2,
    fields: [
      {
        label: t('system.role.name'),
        fieldName: 'roleName',
        type: EControlType.eInput,
        required: true
      },
      {
        label: t('system.role.key'),
        fieldName: 'roleKey',
        type: EControlType.eInput,
        disabled: isEdit,
        required: true
      },
      {
        label: t('system.role.sort'),
        fieldName: 'roleSort',
        type: EControlType.eNumber,
        required: true,
        defaultValue: 1,
        props: {
          precision: 0,
          min: 1,
          max: 10000
        }
      },
      {
        label: t('system.role.remark'),
        fieldName: 'remark',
        type: EControlType.eTextarea,
        props: {
          rows: 2
        }
      },
      {
        label: t('system.role.menuPermission'),
        fieldName: 'menuIds',
        type: EControlType.eCustom,
        required: true,
        singleLine: true,
        labelCol: { span: 3 },
        wrapperCol: { span: 21 },
        props: {
          useRefresh: false,
          style: { maxHeight: '400px', overflow: 'auto', border: 'solid var(--ant-lineWidth) rgba(128, 128, 128, .2)', padding: '6px', borderRadius: '6px' },
          component: 'a-tree',
          checkable: true,
          remote: {
            url: '/system/menu/tree',
            params: { isEnabled: true }
          },
          fieldNames: {
            key: 'id',
            title: 'label',
            children: 'children'
          },
          defaultExpandAll: false,
          modelProps: 'checkedKeys', // 自定义组件的 v-model:value 字段
          modelEvent: 'onCheck', // 自定义组件的 v-model 事件字段
          modelData: 'treeData', // 自定义组件的 dataSource 字段
          renderNeedDataSource: true // 需要有数据源才渲染
        }
      },
      {
        label: t('system.role.status'),
        fieldName: 'isEnabled',
        type: EControlType.eSwitch,
        none: !isView
      },
      {
        label: t('system.role.createTime'),
        fieldName: 'createTime',
        type: EControlType.eDate,
        none: !isView,
        props: {
          showTime: true // 是否需要时分秒
        }
      }
    ]
  })
}))

// 弹出 modal 后执行
async function afterOpenModal ({ record, detail }) {
  detail.value.menuIds = []
  if (record?.roleId) {
    const result = await axios.post('/system/menu/roleMenuTreeselect/' + record.roleId)
    detail.value.menuIds = result?.checkedKeys ?? []
  }
}

/** 数据权限配置 */
const cPage = ref()
const cModal = ref()
const cForm = ref()
const roleId = ref()
const scopeDetail = ref({})
async function openDataScope (record) {
  roleId.value = record.roleId
  scopeDetail.value.roleName = record.roleName
  scopeDetail.value.roleKey = record.roleKey
  scopeDetail.value.dataScope = record.dataScope
  cModal.value.open({
    title: t('system.role.assignDataPermission'),
    width: 600,
  })
  await nextTick()
  if (record.dataScope === '2') {
    scopeDetail.value.deptIds = await axios.post('/system/role/deptTree/' + record.roleId)
  }
}
async function onSubmitHandle (submitData) {
  submitData.roleId = roleId.value
  await axios.post('/system/role/dataScope', submitData)
  message.success(t('system.role.saveSuccess'))
  cPage.value.refresh()
}
const formConfig = computed(() => ({
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
  cols: 1,
  fields: [
    {
      label: t('system.role.name'),
      fieldName: 'roleName',
      disabled: true
    },
    {
      label: t('system.role.key'),
      fieldName: 'roleKey',
      disabled: true
    },
    {
      label: t('system.role.permissionScope'),
      fieldName: 'dataScope',
      type: EControlType.eSelect,
      props: {
        options: [
          { id: '1', name: t('system.role.allDataPermission') },
          { id: '2', name: t('system.role.customDataPermission') },
          { id: '3', name: t('system.role.deptDataPermission') },
          { id: '4', name: t('system.role.deptAndBelowDataPermission') },
          { id: '5', name: t('system.role.selfDataPermission') },
        ]
      }
    },
    {
      label:   t('system.role.dataPermission') ,
      fieldName: 'deptIds',
      type: EControlType.eCustom,
      none: (formData) => formData.dataScope !== '2',
      props: {
        useRefresh: false,
        style: { maxHeight: '400px', overflow: 'auto', border: 'solid var(--ant-lineWidth) rgba(128, 128, 128, .2)', padding: '6px', borderRadius: '6px' },
        component: 'a-tree',
        checkable: true,
        remote: {
          url: '/system/dept/tree'
        },
        fieldNames: {
          key: 'id',
          title: 'label',
          children: 'children'
        },
        defaultExpandAll: true,
        modelProps: 'checkedKeys', // 自定义组件的 v-model:value 字段
        modelEvent: 'onCheck', // 自定义组件的 v-model 事件字段
        modelData: 'treeData', // 自定义组件的 dataSource 字段
        renderNeedDataSource: true // 需要有数据源才渲染
      }
    },
  ]
}))
</script>
