<template>
  <CPage
    ref="cPage"
    primary-key="dictCode"
    :api-config="{
      add: '/system/dict/data/add',
      update: '/system/dict/data/update',
      detail: '/system/dict/data/detail/:id',
      delete: '/system/dict/data/delete/:ids',
      list: '/system/dict/data/list',
      toggle: '/system/dict/data/toggle'
    }"
    :permission-config="{
      list: 'system:dict:list',
      add: 'system:dict:add',
      detail: 'system:dict:detail',
      update: 'system:dict:update',
      delete: 'system:dict:delete',
      toggle: 'system:dict:toggle'
    }"
    :filter-config="filterConfig"
    :table-config="tableConfig"
    :modal-config="modalConfig"
    :before-search="beforeSearch"
    :before-submit="beforeSubmit"
    @added="refreshCache"
    @updated="refreshCache"
    @deleted="refreshCache"
  >
    <template #table_dictLabel="{ text, record }">
      <a-tag :bordered="false" :color="record.tagType" :class="record.cssClass">{{ text }}</a-tag>
    </template>
  </CPage>
</template>

<script setup>
import CPage from '@/components/crud/c-page.vue'
import { EControlType } from '@/enum/index.js'
import { useDictStore } from '@/stores/dict-store.js'

const props = defineProps({
  dictType: String
})

const { t } = useI18n()
const cPage = ref()
const dictStore = useDictStore()

watch(
  () => props.dictType,
  async () => {
    await nextTick()
    cPage.value?.refresh()
  }
)

const filterConfig = computed(() => ({
  fields: [
    {
      label: t('system.dict.name'),
      col: { span: 8 },
      fieldName: 'dictLabel',
      type: EControlType.eInput,
      props: {
        placeholder: t('system.dict.namePlaceholder')
      }
    }
  ]
}))
const tableConfig = computed(() => ({
  initSearch: true,
  columns: [
    {
      title: t('system.dict.code'),
      dataIndex: 'dictCode',
      hidden: true
    },
    {
      title: t('system.dict.sort'),
      dataIndex: 'dictSort'
    },
    {
      title: t('system.dict.type'),
      dataIndex: 'dictType'
    },
    {
      title: t('system.dict.value'),
      dataIndex: 'dictValue'
    },
    {
      title: t('system.dict.name'),
      dataIndex: 'dictLabel',
      slot: 'table_dictLabel'
    },
    {
      title: t('system.dict.isEnabled'),
      dataIndex: 'isEnabled',
      type: 'isEnabled'
    },
    {
      title: t('system.dict.operation'),
      actionShowNum: 4,
      action: ({ record }) => {
        return [
          {
            name: t('system.dict.detail'),
            callback: 'detail'
          },
          {
            name: t('system.dict.edit'),
            callback: 'edit'
          },
          {
            name: record.isEnabled ? t('common.disabled') : t('common.enabled'),
            confirm: true,
            callback: 'toggle'
          },
          {
            name: t('system.dict.delete'),
            confirmContent: t('system.dict.deleteConfirm'),
            callback: 'delete'
          }
        ]
      }
    }
  ]
}))

const modalConfig = computed(() => ({
  title: t('system.dict.dictData'),
  width: 400,
  mode: 'modal',
  buttonConfig: ({ isAdd, isEdit, isView }) => ({
    confirmText: isEdit ? t('system.dict.confirmEdit') : t('system.dict.confirmSubmitContinue'),
    confirmContinue: isEdit ? undefined : (formData, submitData) => {
      formData.dictSort = submitData.dictSort + 1
    }
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
        defaultValue: props.dictType,
        disabled: true
      },
      {
        label: t('system.dict.value'),
        fieldName: 'dictValue',
        type: EControlType.eInput,
        // disabled: isEdit,
        required: true
      },
      {
        label: t('system.dict.name'),
        fieldName: 'dictLabel',
        type: EControlType.eInput,
        required: true
      },
      {
        label: t('system.dict.tagType'),
        fieldName: 'tagType',
        type: EControlType.eSelect,
        props: {
          options: [
            { id: 'default', name: t('system.dict.tagTypeDefault'), class: '' },
            { id: 'processing', name: t('system.dict.tagTypeProcessing'), class: 'text-primary' },
            { id: 'success', name: t('system.dict.tagTypeSuccess'), class: 'text-success' },
            { id: 'warning', name: t('system.dict.tagTypeWarning'), class: 'text-warning' },
            { id: 'error', name: t('system.dict.tagTypeError'), class: 'text-danger' },
            { id: 'red', name: t('system.dict.tagTypeRed'), style: 'color:red;' },
            { id: 'pink', name: t('system.dict.tagTypePink'), class: 'text-pink' },
            { id: 'gold', name: t('system.dict.tagTypeGold'), class: 'text-gold' },
            { id: 'cyan', name: t('system.dict.tagTypeCyan'), class: 'text-cyan' },
            { id: 'blue', name: t('system.dict.tagTypeBlue'), class: 'text-blue' },
            { id: 'purple', name: t('system.dict.tagTypePurple'), class: 'text-purple' },
            { id: '#f50', name: t('system.dict.tagTypeRedInverse'), style: 'color:white;background-color:#f50;' },
            { id: '#2db7f5', name: t('system.dict.tagTypeBlueInverse'), style: 'color:white;background-color:#2db7f5;' },
            { id: '#2DB24A', name: t('system.dict.tagTypeGreenInverse'), style: 'color:white;background-color:#2DB24A;' },
            { id: '#FF944D', name: t('system.dict.tagTypeOrangeInverse'), style: 'color:white;background-color:#FF944D;' },
            { id: '#bbb', name: t('system.dict.tagTypeGrayInverse'), style: 'color:white;background-color:#bbb;' },
          ]
        }
      },
      {
        label: t('system.dict.cssClass'),
        fieldName: 'cssClass',
        type: EControlType.eInput
      },
      {
        label: t('system.dict.sort'),
        fieldName: 'dictSort',
        type: EControlType.eNumber,
        defaultValue: 1,
        props: {
          precision: 0,
          min: 1,
          max: 999
        }
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

function beforeSearch (searchParams) {
  searchParams.dictType = props.dictType
  return searchParams
}

function beforeSubmit (submitData, { isAdd, isEdit, isView, detail }) {
  submitData.dictType = props.dictType
  return submitData
}

function refreshCache () {
  dictStore.initDictByTypes([props.dictType], { [props.dictType]: { force: true } })
}
</script>

<style lang="scss" scoped>
</style>
