<!-- 字典类型管理 -->
<template>
  <div class="dict-page">
    <CPage
      primary-key="dictId"
      :filter-config="filterConfig"
      :table-config="tableConfig"
      :modal-config="modalConfig"
    >
      <template #table_dictType="{ text, record, index, column }">
        <a href="javascript:;" @click="openDictData(text, record)">{{ text }}</a>
        <a href="javascript:;" v-copy="text" class="ml10"><CopyOutlined/></a>
      </template>
    </CPage>
    <CModal ref="cModal">
      <DictData v-if="currDictType" :dict-type="currDictType" />
    </CModal>
  </div>
</template>

<script setup>
import CPage from '@/components/crud/c-page.vue'
import DictData from './components/dict-data.vue'
import { CopyOutlined } from '@ant-design/icons-vue'

const cModal = ref()
const currDictType = ref()
const {t} = useI18n()

const filterConfig = computed(() => ({
  fields: [
    {
      label: t('system.dict.type'),
      fieldName: 'dictType',
      type: EControlType.eInput,
      props: {
        placeholder: t('system.dict.typePlaceholder')
      }
    },
    {
      label: t('system.dict.name'),
      fieldName: 'dictName',
      type: EControlType.eInput,
      props: {
        placeholder: t('system.dict.namePlaceholder')
      }
    }
  ]
}))
const tableConfig = computed(() => ({
  props: {},
  initSearch: true,
  columns: [
    {
      title: t('system.dict.id'),
      dataIndex: 'dictId',
      hidden: true
    },
    {
      title: t('system.dict.type'),
      dataIndex: 'dictType',
      slot: 'table_dictType',
    },
    {
      title: t('system.dict.name'),
      dataIndex: 'dictName'
    },
    {
      title: t('system.dict.remark'),
      dataIndex: 'remark'
    },
    {
      title: t('system.dict.isEnabled'),
      dataIndex: 'isEnabled',
      type: 'isEnabled'
    },
    {
      title: t('system.dict.createTime'),
      dataIndex: 'createTime'
    },
    {
      title: t('system.dict.operation'),
      actionShowNum: 5,
      action: ({ record }) => {
        return [
          {
            name: t('system.dict.manageItems'),
            callback: () => openDictData(record.dictType, record)
          },
          {
            name: record.isEnabled ? t('common.disabled') : t('common.enabled'),
            confirm: true,
            callback: 'toggle'
          },
          {
            name: t('system.dict.edit'),
            callback: 'edit'
          },
          {
            name: t('system.dict.detail'),
            callback: 'detail'
          },
          {
            name: t('system.dict.delete'),
            callback: 'delete'
          }
        ]
      }
    }
  ]
}))

const modalConfig = computed(() => ({
  title: t('system.dict.dictType'),
  width: 400,
  mode: 'modal',
  buttonConfig: ({ isAdd, isEdit, isView }) => ({
    confirmText: isEdit ? t('system.dict.confirmEdit') : t('system.dict.confirmSubmit')
  }),
  formConfig: ({ isAdd, isEdit, isView, detail }) => ({
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
    cols: 1,
    fields: [
      {
        label: t('system.dict.type'),
        fieldName: 'dictType',
        type: EControlType.eInput,
        tooltip: !isView ? t('system.dict.typeTooltip') : undefined,
        disabled: isEdit,
        required: true
      },
      {
        label: t('system.dict.name'),
        fieldName: 'dictName',
        type: EControlType.eInput,
        required: true
      },
      {
        label: t('system.dict.remark'),
        fieldName: 'remark',
        type: EControlType.eTextarea,
        props: {}
      },
      {
        label: t('system.dict.isEnabled'),
        fieldName: 'isEnabled',
        type: EControlType.eSwitch,
        none: !isView,
        props: {}
      },
      {
        label: t('system.dict.createTime'),
        fieldName: 'createTime',
        type: EControlType.eDate,
        none: !isView,
        props: {
          showTime: true
        }
      }
    ]
  })
}))

function openDictData (value, record) {
  currDictType.value = value
  cModal.value.open({
    title: t('system.dict.dictItemListTitle', { name: record.dictName }),
    width: 1000,
    mode: 'drawer',
    showConfirm: false
  })
}
</script>

<style lang="scss" scoped>
</style>
