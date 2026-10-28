<!-- 代码生成-编辑配置 -->
<template>
  <CModal ref="cModal" title="代码生成-编辑" mode="drawer" width="1200" :mask-closable="false" :body-style="{padding: '0 15px 10px 15px'}">
    <a-tabs v-model:activeKey="activeKey">
      <a-tab-pane key="1" tab="基本信息">
        <CForm
          ref="basicForm"
          is-edit
          primary-key="tableId"
          :detail="detail"
          :form-config="basicFormConfig"
          :show-confirm="false"
          :show-cancel="false"
        />
      </a-tab-pane>
      <a-tab-pane key="2" tab="字段信息" forceRender>
        <CForm
          ref="columnForm"
          is-edit
          :detail="detail"
          :form-config="columnFormConfig"
          :show-confirm="false"
          :show-cancel="false"
        />
      </a-tab-pane>
      <a-tab-pane key="3" tab="生成信息" forceRender>
        <CForm
          ref="genForm"
          is-edit
          primary-key="tableId"
          :detail="detail"
          :form-config="genFormConfig"
          :show-confirm="false"
          :show-cancel="false"
        />
      </a-tab-pane>
    </a-tabs>
  </CModal>
</template>

<script setup>
import { EControlType } from '@/enum/index.js'
import axios from '@/api/index.js'
import CForm from '@/components/crud/components/c-form.vue'

const props = defineProps({
  datasource: String
})

const _this = getCurrentInstance().proxy
const cModal = ref()
const basicForm = ref()
const columnForm = ref()
const genForm = ref()
const activeKey = ref('1')
const record = ref({}) // 从列表中带过来的列表项 item
const detail = ref({}) // 详情-导入表格的详细信息
const genTables = ref([]) // 详情-已导入的表格列表，用于选择子表
const columns = ref([]) // 详情-代码生成的字段行配置数据
const subColumns = ref([]) // 通过选择字表关联出来的字表字段，用于选择主外键关联字段
const dictTypeList = ref([]) // 字典类型列表
const columnOptions = ref([]) // 主表字段列表，用于主子表下拉选择
const subTableOptions = ref([]) // 字表表名列表，用于主子表下拉选择
const genUiPathCacheKey = 'CZ_GENUIPATHLIST'

onMounted(() => {
  getDictTypeList()
})

async function getDictTypeList () {
  const types = await axios.post('/system/dict/optionselect')
  dictTypeList.value = types.map(item => ({ id: item.dictType, name: `${item.dictName}(${item.dictType})` }))
}

async function getDetail () {
  const result = await axios.post('/tool/gen/detail/' + record.value?.tableId, null, {
    headers: { datasource: props.datasource }
  })
  detail.value = result.detail
  genTables.value = result.genTables
  columns.value = result.detail.columns.map(item => ({ ...item }))
  columnOptions.value = detail.value?.columns?.map(item => ({ id: item.columnName, name: item.columnName + '：' + item.columnComment })) ?? []
  subTableOptions.value = genTables.value?.map(item => ({ id: item.tableName, name: item.tableName + '：' + item.tableComment })) ?? []
}

/** 基础信息表单配置 */
const basicFormConfig = computed(() => ({
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
  cols: 2,
  fields: [
    {
      label: '表名称',
      fieldName: 'tableName',
      type: EControlType.eInput,
      required: true
    },
    {
      label: '表描述',
      fieldName: 'tableComment',
      type: EControlType.eInput,
      required: true
    },
    {
      label: '实体类名称',
      fieldName: 'className',
      type: EControlType.eInput,
      required: true
    },
    {
      label: '作者',
      fieldName: 'functionAuthor',
      type: EControlType.eInput,
      required: true
    },
    {
      label: '备注',
      fieldName: 'remark',
      type: EControlType.eTextarea
    }
  ]
}))

/** 生成信息表单配置 */
const genFormConfig = computed(() => ({
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
  cols: 2,
  fields: [
    {
      label: '生成模板',
      fieldName: 'tplCategory',
      type: EControlType.eRadio,
      required: true,
      props: {
        options: [
          { id: 'crud', name: '单表' },
          { id: 'tree', name: '树表' },
          { id: 'sub', name: '主子表' }
        ],
        optionType: 'button',
        buttonStyle: 'solid'
      }
    },
    {
      label: '生成包路径',
      tooltip: '生成在哪个java包下，例如 “com.admin.system” 中的 “admin”',
      fieldName: 'packageName',
      type: EControlType.eInput,
      disabled: formData => !!formData.packageName,
      required: true
    },
    {
      label: '生成模块名',
      tooltip: '大模块英文名，如系统管理 “com.admin.system” 中的 “system”',
      fieldName: 'moduleName',
      type: EControlType.eInput,
      required: true,
      props: {
        placeholder: '如：系统管理 “com.admin.system” 中的 “system”'
      }
    },
    {
      label: '生成业务名',
      tooltip: '小模块英文名，如用户管理 “com.admin.system.user” 中的 “user”',
      fieldName: 'businessName',
      type: EControlType.eInput,
      required: true
    },
    {
      label: '生成功能名',
      tooltip: '小模块中文名，用作类描述，如用户管理 “com.admin.system.user” 中与 user 对应的 “用户”',
      fieldName: 'functionName',
      type: EControlType.eInput,
      required: true
    },
    {
      label: '上级菜单',
      tooltip: '分配到指定菜单下，例如用户管理分配在“系统管理”下',
      fieldName: 'parentMenuId',
      type: EControlType.eTreeSelect,
      required: true,
      props: {
        remote: {
          url: '/system/menu/tree',
          params: {
            menuType: 'M'
          }
        },
        fieldNames: {
          label: 'label'
        }
      }
    },
    {
      label: '生成代码方式',
      tooltip: 'zip压缩包可下载，自定义路径生成到项目中',
      fieldName: 'genType',
      type: EControlType.eRadio,
      defaultValue: '1',
      props: {
        options: [
          { id: '1', name: '自定义路径' },
          { id: '0', name: 'zip压缩包' }
        ]
      }
    },
    // {
    //   label: '后端代码生成路径',
    //   tooltip: '项目根目录地址',
    //   none: formData => formData.genType !== '1',
    //   fieldName: 'genPath',
    //   singleLine: true,
    //   labelCol: { span: 4 },
    //   wrapperCol: { span: 20 },
    //   type: EControlType.eInput,
    //   required: true,
    //   props: { maxlength: 100 }
    // },
    {
      label: '前端代码生成路径',
      tooltip: '项目根目录绝对路径，如：/Users/xxx/xxx/czleing-admin',
      fieldName: 'genUiPath',
      singleLine: true,
      labelCol: { span: 4 },
      wrapperCol: { span: 20 },
      none: formData => formData.genType !== '1',
      type: EControlType.eAutoComplete,
      required: true,
      props: {
        options: JSON.parse(localStorage.getItem(genUiPathCacheKey))
      }
    },
    {
      label: '生成Controller',
      fieldName: 'genController',
      type: EControlType.eSwitch,
      props: { checkedValue: 1, unCheckedValue: 0 }
    },
    {
      label: '生成Service',
      tooltip: '包括 Service, Mapper, 实体类',
      fieldName: 'genService',
      type: EControlType.eSwitch,
      props: { checkedValue: 1, unCheckedValue: 0 }
    },
    {
      label: '生成页面',
      fieldName: 'genPage',
      type: EControlType.eSwitch,
      props: { checkedValue: 1, unCheckedValue: 0 }
    },
    {
      label: '生成菜单',
      fieldName: 'genMenu',
      type: EControlType.eSwitch,
      props: { checkedValue: 1, unCheckedValue: 0 }
    },
    {
      label: '树编码字段',
      tooltip: '树编码字段名， 如：“dept_id”',
      fieldName: 'treeCode',
      none: formData => formData.tplCategory !== 'tree',
      type: EControlType.eSelect,
      props: {
        options: columnOptions.value
      }
    },
    {
      label: '树父编码字段',
      tooltip: '树父编码字段名， 如：“parent_Id”',
      fieldName: 'treeParentCode',
      none: formData => formData.tplCategory !== 'tree',
      type: EControlType.eSelect,
      props: {
        options: columnOptions.value
      }
    },
    {
      label: '树名称字段',
      tooltip: '树节点显示的名称字段名， 如：“dept_name”',
      fieldName: 'treeName',
      none: formData => formData.tplCategory !== 'tree',
      type: EControlType.eSelect,
      props: {
        options: columnOptions.value
      }
    },
    {
      label: '关联子表的表名',
      tooltip: '关联子表的表名， 如：“sys_user”',
      none: formData => formData.tplCategory !== 'sub',
      fieldName: 'subTableName',
      type: EControlType.eSelect,
      props: {
        options: subTableOptions.value,
        onChange (tableName, table, formData) {
          formData.subTableFkName = ''
          subColumns.value = table.columns
        }
      }
    },
    {
      label: '子表关联的外键名',
      tooltip: '子表关联的外键名， 如：“user_id”',
      none: formData => formData.tplCategory !== 'sub',
      fieldName: 'subTableFkName',
      type: EControlType.eSelect,
      props: {
        options: subColumns.value?.map(item => ({ id: item.columnName, name: item.columnName + '：' + item.columnComment })) ?? []
      }
    }
  ]
}))

/** 字段信息配置表单 */
const columnFormConfig = computed(() => ({
  labelCol: { span: 0 },
  wrapperCol: { span: 24 },
  cols: 1,
  fields: [
    {
      label: '',
      fieldName: 'columns',
      type: EControlType.eTable,
      required: true,
      props: {
        maxCount: 0, // 最多0条，表示不要新增按钮
        useDelete: false, // 不要删除功能
        scroll: { x: 1400 },
        primaryKey: 'columnId',
        columns: [
          {
            title: '序号',
            dataIndex: 'sort',
            align: 'center',
            type: EControlType.eInput,
            isView: true,
            width: 50
          },
          {
            title: '字段列名',
            dataIndex: 'columnName',
            type: EControlType.eInput,
            isView: true
          },
          {
            title: '字段描述',
            dataIndex: 'columnComment',
            type: EControlType.eInput,
            width: 150,
            props: { size: 'small' }
          },
          {
            title: '物理类型',
            dataIndex: 'columnType',
            type: EControlType.eInput,
            isView: true
          },
          {
            title: 'Java类型',
            dataIndex: 'javaType',
            type: EControlType.eSelect,
            width: 150,
            props: {
              size: 'small',
              options: [
                { id: 'Long', name: 'Long' },
                { id: 'String', name: 'String' },
                { id: 'Integer', name: 'Integer' },
                { id: 'Double', name: 'Double' },
                { id: 'BigDecimal', name: 'BigDecimal' },
                { id: 'Date', name: 'Date' },
                { id: 'Boolean', name: 'Boolean' }
              ]
            }
          },
          {
            title: 'java属性',
            dataIndex: 'javaField',
            type: EControlType.eInput,
            props: { size: 'small' }
          },
          {
            title: '新增',
            dataIndex: 'isInsert',
            type: EControlType.eSwitch,
            props: {
              size: 'small',
              checkedValue: '1',
              unCheckedValue: '0'
            }
          },
          {
            title: '编辑',
            dataIndex: 'isEdit',
            type: EControlType.eSwitch,
            props: {
              size: 'small',
              checkedValue: '1',
              unCheckedValue: '0'
            }
          },
          {
            title: '必填',
            dataIndex: 'isRequired',
            type: EControlType.eSwitch,
            props: {
              size: 'small',
              checkedValue: '1',
              unCheckedValue: '0'
            }
          },
          {
            title: '列表',
            dataIndex: 'isList',
            type: EControlType.eSwitch,
            props: {
              size: 'small',
              checkedValue: '1',
              unCheckedValue: '0'
            }
          },
          {
            title: '查询',
            dataIndex: 'isQuery',
            type: EControlType.eSwitch,
            props: {
              size: 'small',
              checkedValue: '1',
              unCheckedValue: '0'
            }
          },
          {
            title: '查询方式',
            dataIndex: 'queryType',
            type: EControlType.eSelect,
            width: 120,
            props: {
              size: 'small',
              options: [
                { id: 'EQ', name: '=' },
                { id: 'NE', name: '!=' },
                { id: 'GT', name: '>' },
                { id: 'GT', name: '>=' },
                { id: 'LT', name: '<' },
                { id: 'LE', name: '<=' },
                { id: 'LIKE', name: 'LIKE' },
                { id: 'BETWEEN', name: 'BETWEEN' }
              ]
            }
          },
          {
            title: '显示类型',
            dataIndex: 'htmlType',
            type: EControlType.eSelect,
            width: 110,
            props: {
              size: 'small',
              dropdownMatchSelectWidth: false,
              options: EControlType._list.map(type => ({ id: type.data.htmlType, name: type.name }))
            }
          },
          {
            title: '字典类型',
            dataIndex: 'dictType',
            type: EControlType.eSelect,
            width: 130,
            tooltip: '显示类型为：单选框、复选框、下拉框时有效',
            props: {
              size: 'small',
              options: dictTypeList.value,
              dropdownMatchSelectWidth: false,
              allowClear: true
            }
          }
        ]
      }
    }
  ]
}))

async function beforeConfirm (close) {
  // 表单校验，并获取到数据
  let basicData, columnData, genData
  try {
    basicData = await basicForm.value.validate()
  } catch {
    activeKey.value = '1'
    return
  }
  try {
    columnData = await columnForm.value.validate()
  } catch {
    activeKey.value = '2'
    return
  }
  try {
    genData = await genForm.value.validate()
  } catch {
    activeKey.value = '3'
    return
  }
  const genTable = Object.assign({ tableId: detail.value.tableId }, basicData, genData)
  genTable.columns = columnData.columns
  genTable.params = {
    treeCode: genTable.treeCode,
    treeName: genTable.treeName,
    treeParentCode: genTable.treeParentCode,
    parentMenuId: genTable.parentMenuId
  }
  const result = await axios.post('/tool/gen/update', genTable, {
    headers: { datasource: props.datasource }
  })
  _this.$message.success('编辑成功')
  let cacheUiPaths = localStorage.getItem(genUiPathCacheKey)
  cacheUiPaths = cacheUiPaths ? JSON.parse(cacheUiPaths) : []
  cacheUiPaths.push({
    id: genData.genUiPath,
    name: genData.genUiPath
  })
  if (cacheUiPaths.length > 3) {
    cacheUiPaths.splice(0, 1)
  }
  localStorage.setItem(genUiPathCacheKey, JSON.stringify(cacheUiPaths))
  close()
}

const emits = defineEmits(['completed'])

function open (options) {
  record.value = options
  cModal.value.open({
    onConfirm: beforeConfirm
  })
  getDetail()
}

function close () {
  cModal.value.close()
}

defineExpose({
  open,
  close
})
</script>

<style lang="scss" scoped>
</style>
