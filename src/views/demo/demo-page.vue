<!-- demo CRUD demo 页面 -->
<!-- CPage 封装了查询、列表、新增、修改、详情、删除、导入、导出、启用、禁用等功能，通过配置选择使用 -->
<template>
  <CPage
    ref="cPage"
    hasImport
    hasExport
    hasGoBack
    :has-fullscreen="true"
    :no-add="false"
    :no-delete="false"
    :no-select="false"
    :no-tools="false"
    primary-key="id"
    :api-config="{
      // 预设功能接口地址配置，默认根据当前路由生成，如：/system/user 页面下新增接口 => /system/user/add，配置了可进行覆盖
      // add: '/developer/demo/add',
      // update: '/developer/demo/update',
      // detail: '',
      // delete: '',
      list: getMockData, // 列表接口地址配置，list 支持函数, String | async (searchParams) => ({ list: [], total: Number, ... })
      // toggle: '',
      // import: '',
      // importTemplate: '',
      // export: ''
    }"
    :api-method-config="{
      // 预设功能接口请求方式设置，默认全部post
      // add: '',
      // ...
    }"
    :api-option-config="{
      // 预设功能接口请求额外其他设置，如：headers，设置 headers.Authorization 会覆盖系统默认的 token 设置
      // list: { headers: { Authorization: 'Bearer xxx', datasource: 'xxx' } }
      // ...
    }"
    :permission-config="{
      // 预设功能权限配置，默认根据当前路由生成，如新增权限：/system/user -> system:user:add
      // add: '',
      // ...
    }"
    :tree-config="treeConfig"
    :filter-config="filterConfig"
    :tools-config="toolsConfig"
    :table-config="tableConfig"
    :modal-config="modalConfig"
    :before-search="beforeSearch"
    :after-search="afterSearch"
    :before-submit="beforeSubmit"
    :after-submit="afterSubmit"
    :after-open-modal="afterOpenModal"
    :transform-detail="transformDetail"
  >
    <!-- 表格单元格内容过于复杂时，可以使用插槽，插槽名根据配置动态生成 -->
    <template #table_slotField="{ text, record, index, column }">
      插槽内容==={{ record.age }}
    </template>
    <!-- 其他插槽如：header、filter、tools、table -->
    <!-- 可以不传对应的配置，通过插槽自定义实现对应部分 -->
  </CPage>
</template>

<script setup>
import CPage from '@/components/crud/c-page.vue'
import { EControlType, EIsEnabled } from '@/enum/index.js'
import { message } from 'ant-design-vue'

const cPage = ref()
const { t } = useI18n()
defineOptions({ name: 'DemoPage' })

/** 左侧树形配置，不配置则不使用树 */
const treeConfig = {
  url: '/system/user/deptTree',
  params: {}, // 查询参数
  // method: 'post',
  replaceField: { key: 'id', children: 'children', title: 'label' },
  searchField: 'deptId', // 将选中节点的id作为列表的查询参数的参数名，默认orgId
}

/** 查询条件配置 */
const filterConfig = computed(() => ({
  useCache: true, // 使用查询条件暂存，默认 false
  // cacheBtnText: '记住查询', // 暂存按钮文字，默认 '记住查询'
  col: { sm: 8, lg: 6, xxl: 6 }, // 所有表单项栅格设置，默认：{ sm: 8, lg: 6, xxl: 4 }，参照 a-col
  labelCol: { flex: '80px' }, // 所有表单项文本部分栅格设置，默认：文本宽度，单行时可以不用设置，多行时建议设置统一宽度，参照 a-col
  // wrapperCol: { flex: '1 1 0' }, // 所有表单项控件部分栅格设置，默认：控件宽度，参照 a-col
  // buttonsCol: { flex: 'auto' }, // 查询重置等按钮栅格设置，默认：{ flex: '1 1 auto' }, 参照 a-col
  buttonsAlign: 'right', // 查询重置等按钮水平对齐方式，left(默认), center, right, 可以配合 buttonsCol 使用
  // 一行显示几列由每个字段的 col 决定，默认自适应列数，一行 24 格，每个字段可以设置占用格数，一行不够时自动换行
  // 字段配置
  fields: [
    {
      label: t('demo.keyword'), // '关键字',
      fieldName: 'key',
      // type: EControlType.eInput, // 默认 eInput 可以不设置
      // col: { flex: '280px' }, // 表单项(包含文本和控件)栅格设置，默认响应式分配：{ sm: 8, lg: 6, xxl: 4 }
      // 每个字段的宽度可以很灵活控制，固定宽度、同宽、自适应等 参照 ant-design-vue a-col 的属性
      // labelCol: { span: 7 }, // 表单项文本部分栅格设置，参照 a-col，默认继承 filterConfig.labelCol
      // wrapperCol: { span: 17 }, // 表单项控件部分栅格设置，参照 a-col，默认继承 filterConfig.wrapperCol
      props: {
        placeholder: t('demo.pleaseEnterKeyword'), // '请输入姓名/手机号/账号'
      }
    },
    {
      label: t('demo.isEnabled'), // '是否启用',
      fieldName: 'isEnabled',
      type: EControlType.eSelect,
      defaultValue: 1, // 给一个默认值，注：设置了默认值后，页面初始化时 c-filter 组件会自动提交一次查询，tableConfig.initSearch 将会默认关闭
      props: {
        options: EIsEnabled._list
      }
    },
    {
      label: t('demo.dictSelect'), // '字典下拉',
      fieldName: 'xxxStatus',
      type: EControlType.eSelect,
      props: {
        useRefresh: false, // 是否需要刷新按钮
        dictType: 'audit_status' // 指定字典类型，自动查询出字典项数据
      }
    },
    {
      label: t('demo.numRange'), // '数字范围',
      fieldName: 'numberRange', // 后端使用数组接收
      type: EControlType.eNumberRange,
      props: {
        // placeholders: ['范围起', '范围止'],
        // maxs: [100, 200],
        // mins: [1, 2],
        // 其他属性在 a-input-number 的属性名基础上加上s，并且以数组的方式设置
      }
    },
    {
      label: t('demo.selectDept'), // '选择部门',
      fieldName: 'deptId',
      type: EControlType.eTreeSelect,
      props: {
        fieldNames: { value: 'id', label: 'label' },
        remote: {
          url: '/system/dept/tree',
        }
      }
    },
    {
      label: t('demo.timeRange'), // 时间范围
      // col: { flex: '460px' }, // 宽度不够时，设置更大宽度
      fieldName: 'createTime', // 对应查询数据库中的字段，提交时会删掉，替换成 fieldNames 中设置的两个字段
      type: EControlType.eDateRange,
      props: {
        // showTime: true, // 是否显示时分秒
        // fieldNames: ['createTimeBegin', 'createTimeEnd'] // 默认是 fieldName 后面增加 'Begin', 'End'，可以不填
      }
    }
  ]
}))
const uploadFile = ref()
/** 自定义工具栏按钮配置 object | computed(() => object) */
const toolsConfig = computed(() => ({
  // addBtnText: '新增',
  // addInitData: { parentId: 0 }, // 新增时初始化表单的数据
  // backBtnText: '返回',
  otherTools: [
    {
      name: t('demo.diyBtn'), // 自定义按钮 String | ({ selectedIds, selectedObjs, pagination }) => String
      permission: 'system:user:diy',
      props: {
        type: 'link',
        icon: 'EditOutlined',
        disabled: ({ selectedIds, selectedObjs, pagination }) => selectedObjs.some(item => item.status === 1),
        onClick ({ selectedIds, selectedObjs, pagination }) {
          // console.log('我被点击了')
          // Modal.confirm({
          //   title: '温馨提示',
          //   content: '确认要xxx？',
          //   async onOk () {
          //     await axios.post(`/xx/xx`, {...})
          //     message.success('xx成功！')
          //     cPage.value.refresh()
          //     cPage.value.clearSelect()
          //   }
          // })
        }
      }
    },
    // 自定义其他组件
    // {
    //   component: 'FileUpload', // 全局组件，直接写组件名，如 'a-button', 非全局组件，可以在上面 import, 然后指定，如：component: MyComponent
    //   permission: 'system:user:diy',
    //   props: {
    //     value: uploadFile.value,
    //     maxCount: 1,
    //     accept: '.doc,.docx',
    //     showUploadList: false,
    //     btnText: '上传文件',
    //     btnProps: {
    //       // icon: false,
    //       type: 'primary'
    //     }
    //   },
    //   // 事件监听，对象方式
    //   on: {
    //     click () {
    //       // 我被点击了
    //     }
    //   },
    //   // 事件监听，函数方式，可以获取到页面相关信息
    //   // on: ({ selectedIds, selectedObjs, searchParams, pagination }) => {
    //   //   return {
    //   //     'update:value' (fileList) {
    //   //       uploadFile.value = fileList
    //   //       setTimeout(() => {
    //   //         uploadFile.value = undefined
    //   //       })
    //   //     }
    //   //   }
    //   // }
    // }
  ]
}))
/** 数据列表配置 */
const tableConfig = computed(() => ({
  props: {
    scroll: { x: 'max-content' }
    // 参考 a-table props
    // bordered: true, // 是否使用边框线，默认使用
    // size: 'small', // 组件尺寸，默认 small
    // pageSize: 22, // 重写分页大小选项
    // usePage: false, // 不使用分页，默认使用
    // rowClick ({ key, record, index, selected, selectedIds, selectedObjs }) { // 配置数据行点击事件
      // if (!selected) {
      //   selectedIds.value.push(key)
      //   selectedObjs.value.push(record)
      // } else {
      //   selectedIds.value = selectedIds.value.filter(id => id !== key)
      //   selectedObjs.value = selectedObjs.value.filter(item => item.id !== key)
      // }
    // }
  },
  // initSearch: true, // 默认 true，初始化时查询，如果查询条件中有默认值，则默认 false
  columns: [
    {
      title: t('demo.name'), // 姓名
      tooltip: t('demo.userRealName'), // '用户真实姓名',
      dataIndex: 'nickName',
      resizable: true,
      width: 100,
      // sorter: true, // 服务端排序
      sorter: (a, b) => (a.nickName ?? '').localeCompare(b.nickName ?? '', 'zh-CN') // 本地排序，中文排序
      // sorter: (a, b) => a.totalCount - b.totalCount, // 本地排序，非中文排序
    },
    {
      title: t('demo.age'), // 年龄
      dataIndex: 'age',
      resizable: true,
      width: 80,
      minWidth: 40,
      maxWidth: 200,
    },
    {
      title: t('demo.amount'), // 金额
      dataIndex: 'amount',
      resizable: true,
      width: 80,
      isAmount: true, // 格式化为金额格式，逗号分隔
      useTotal: true // 使用合计, 只有数字才设置，会在表格最下面添加合计行，汇总该列的值
    },
    {
      title: '带单位',
      dataIndex: 'withUnit',
      resizable: true,
      unit: '元', // 在后面拼上单位
      width: 100,
      useTotal: true // 使用合计, 会在表格最下面添加合计行，汇总该列的值
    },
    {
      title: '头像',
      dataIndex: 'avatar',
      resizable: true,
      width: 80,
      default: '-',
      isAvatar: true, // 格式化为头像，支持base64或地址
    },
    {
      title: '图片',
      dataIndex: 'image',
      resizable: true,
      width: 80,
      default: '-',
      isImage: true, // 格式化为图片，支持base64或地址 带放大预览功能
    },
    {
      title: '名称2',
      dataIndex: 'name2',
      resizable: true,
      width: 100,
      hidden: true // 该列暂时隐藏，可通过列筛选勾选显示
    },
    {
      title: '字典',
      dataIndex: 'dict',
      resizable: true,
      width: 100,
      dictType: 'sys_user_sex' // 自动按指定的字典类型解析出中文
    },
    {
      title: '自定义',
      dataIndex: 'status',
      resizable: true,
      width: 100,
      customRender: ({ value, record, index, column }) => { // 自定义渲染函数
        return h('span', {
          class: 'text-success'
        }, '状态:' + value)
      }
    },
    {
      title: '自定义组件',
      dataIndex: 'diy',
      width: 120,
      customRender: ({ value, record, index, column }) => {
        return h(resolveComponent('a-tag'), {
          bordered: false,
          color: record.color
        }, {
          default: () => value
        })
      }
    },
    {
      title: '是否启用',
      dataIndex: 'isEnabled',
      width: 100,
      type: 'isEnabled' // type 预处理类型，isEnabled、Boolean, 格式化为是否启用
    },
    {
      title: '字符串脱敏',
      dataIndex: 'phonenumber',
      width: 100,
      hideChar: [3, 4] // 字符串脱敏，第一个值为左边显示字符数，第二个值为右边显示字符数，剩下的使用第三个值代替，默认'*'可不传，第四个值为替换符显示长度，默认为实际替换字符数
    },
    {
      title: '地址',
      dataIndex: 'address',
      hidden: true,
      width: 180,
      default: '-', // 设置默认值，支持html，如：default: '<div class="text-gray">xxx</div>'
      ellipsis: true // ant-design 自带的超出宽度隐藏
    },
    {
      title: '插槽',
      dataIndex: 'slotField',
      resizable: true,
      width: 190,
      slot: 'table_slotField' // 使用插槽渲染
    },
    {
      title: '日期自动格式化',
      dataIndex: 'createTime',
      width: 150,
      // isDate: true, // 自动格式化为 YYYY-MM-DD
      isDateTime: true, // 或 自动格式化为 YYYY-MM-DD HH:mm
      // dateFormat: 'YYYY-MM-DD HH:mm:ss' // 或 自定义格式
    },
    {
      title: '操作',
      width: 180,
      fixed: 'right',
      actionShowNum: 2, // 展示操作按钮数量，剩余的将收进更多里
      actionMoreText: '更多', // 更多按钮名称，默认"更多"
      // action: 操作列配置，T[] || ({ record }) => T[]
      action: ({ record }) => {
        const btns = [
          // 预设：edit, detail, delete, toggle，预设功能的权限会自动绑定，无需手动设置
          // 名称和图标至少设置一个
          {
            name: t('crud.detail'), // 详情，按钮名称，可选，
            icon: 'SearchOutlined', // 图标，可选，仅限 /src/components/global/a-icon.js 中已导入的 ant-design 图标
            callback: 'detail' // 可以使用预设的字符串，也可以使用自定义函数，自定义则代表不使用系统自带的详情弹窗
          },
          {
            name: t('crud.edit'), // 编辑
            icon: 'EditOutlined',
            callback: 'edit'
          },
          {
            name: t('crud.delete'), // 删除
            icon: 'DeleteOutlined',
            class: 'text-danger', // 按钮class样式名
            callback: 'delete' // 删除操作默认带确认框
          },
          {
            name: record.isEnabled ? t('crud.disabled') : t('crud.enabled'),
            icon: record.isEnabled ? 'StopOutlined' : 'CheckCircleOutlined',
            class: record.isEnabled ? 'text-danger' : 'text-success',
            confirm: true,
            callback: 'toggle'
          },
          // {
          //   name: '自定义',
          //   permission: 'system:user:diy',
          //   confirm: true, // 该操作是否需要确认操作
          //   confirmContent: '', // 确认框提示内容，不填则使用默认模板
          //   callback ({}) {
          //     console.log('我被点击了', record)
          //   }
          // },
          // 更自由的自定义
          // {
          //   name: '自定义2', // 操作名称，当使用了 confirm: true 后，用于弹窗提示中显示，不使用 confirm 可不设置
          //   permission: 'system:user:diy2',
          //   confirm: true,
          //   customRender: data => {
          //     return h('span', { class: '' }, '自定义2') // 定义元素外观
          //   },
          //   callback () { // 点击事件还是使用 callback (方便确认框点击确定时调用)
          //     console.log('自定义2被点击了')
          //   }
          // }
        ]
        if (record.userId !== 1) {
          btns.push({
            name: '动态操作',
            permission: 'system:user:opt',
            confirm: true,
            confirmContent: `确认锁定[${record.nickName}]吗？`,
            async callback ({}) {
              // await axios.post('', { userId: record.userId })
              message.success(`[${record.nickName}]已锁定`)
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
  title: 'Demo', // 弹窗标题，会自动根据类型拼上新增、编辑、详情关键字
  // fullTitle: '', // 全称，不会自动拼接其他字符串
  width: 800, // 弹窗宽度，默认 600
  mode: 'modal', // 弹窗模式, modal 或 drawer
  props: { centered: true, maskClosable: true }, // 其他参数, 会直接绑定到 a-modal 或 a-drawer
  // 弹窗按钮属性修改 Object | ({ isAdd, isEdit, isView }) => Object
  buttonConfig: ({ isAdd, isEdit, isView }) => ({
    // showConfirm: !isEdit, // 确认按钮是否可见，默认可见
    confirmText: isEdit ? '确认修改' : '确认提交', // 默认是确定
    // confirmContinue: true, // true | (formData, submitData) => {}，提交之后是否继续，继续则不关闭弹窗，只清空数据，可传一个函数对继续后的表单数据初始化(如给排序序号+1)
    // showCancel: !isEdit // 取消按钮是否可见，默认可见
    cancelText: '关闭', // 默认是关闭
  }),
  // 表单配置 Object | ({ isAdd, isEdit, isView, detail }) => Object
  formConfig: ({ isAdd, isEdit, isView, detail }) => ({
    // layout: 'horizontal', // 表单布局 horizontal | vertical | inline 默认 horizontal
    // cols: 2, // 一行显示几列，默认 2 列
    // labelCol: { span: 6 }, // 如果需要固定label宽度，可设为 { flex: '120px' }, 默认 { flex: '0 0 100px' }，参考 ant-design-vue a-col 的属性设置
    // wrapperCol: { span: 18 }, // 如果需要固定控件宽度，可设为 { flex: '280px' }, 默认 撑满剩余空间={ flex: '1 1 0' }, 不会溢出换行，参考 ant-design-vue a-col 的属性设置
    // 表单字段
    fields: [ // 表单字段数组，可分组
      {
        label: '短文本',
        fieldName: 'shortText',
        // type: EControlType.eInput, // 控件类型，默认文本框
        // required: true, // 是否必填 Boolean | formData => Boolean
        // disabled: isEdit, // 是否禁用 Boolean | formData => Boolean
        // hidden: isView, // 是否隐藏该字段，数据仍在表单中，Boolean | formData => Boolean
        // none: isView, // 是否不需要该字段，数据不在表单中，Boolean | formData => Boolean
        // extra: formData => '222', // 字段额外说明， String | formData => String
        // tooltip: formData => '111', // 字段(?)提示， String | formData => String
        // defaultValue: 'xxx', // 默认值
        // rules: [], // 校验规则，与 <a-form-item> 一致， object | array | formData => { return {} || [] }
        // singleLine: true, // 单独占一行，优先级高于 col
        // col: { span: 12 }, // 当前表单项(包含文本和控件)栅格设置，固定宽度可以设置为 { flex: '280px' }，参照 a-col 属性，默认根据 formConfig.cols 计算
        // labelCol: { span: 3 }, // 当前表单项文本部分栅格设置，会覆盖 formConfig.labelCol, 参照 a-col，默认继承 formConfig.labelCol
        // wrapperCol: { span: 21 }, // 当前表单项控件部分栅格设置，会覆盖 formConfig.wrapperCol, 参照 a-col，默认继承 formConfig.wrapperCol
        props: formData => { // 控件属性配置，Object | formData => Object, 没有属性可以不配
          // 根据 type 继承自对应 ant-design-vue 控件的属性和事件
          // placeholder 会默认生成，可以不配
          allowClear: true
        }
      },
      {
        label: '隐藏字段', // 类似隐藏域，可以放置一些提交时需要的额外信息，可以在表单联动时动态设置值
        fieldName: 'hidden1',
        hidden: true, // 强制隐藏
        defaultValue: '默认值'
      },
      {
        label: formData => '整数', // 字段描述 String | formData => String
        fieldName: 'int',
        type: EControlType.eNumber,
        tooltip: formData => '111', // 字段提示， String | formData => String
        defaultValue: 23,
        props: { // 控件属性配置，Object | formData => Object, 没有属性可以不配
          precision: 0,
          min: 1,
          max: 100
          // placeholder: '请输入年龄', // 默认"请输入+label"， String || formData => String
          // onChange (val, formData) {}
        } // 控件其他属性，所有控件都支持 onChange 事件
      },
      {
        // 字段分组
        title: '分组标题', // String || formData => String
        subTitle: '分组副标题', // String || formData => String
        // hidden: formData => !formData.userName, // true表示隐藏该组(数据仍在)，Boolean || formData => Boolean
        // none: formData => !formData.userName, // true表示不需要该组(从表单中移除)，Boolean || formData => Boolean
        fields: [
          {
            label: '密码',
            fieldName: 'password',
            type: EControlType.eInput,
            rules: { pattern: /^[\d\w!@#$%\^&*()]{8,16}$/, message: '密码格式错误，应8-16位数字、字母、!@#$%^&*()特殊符号' },
            none: isView, // 详情时不展示该字段
            props: {
              type: 'password',
              maxlength: 16
            }
          },
          {
            label: '确认密码',
            fieldName: 'confirmPassword',
            type: EControlType.eInput,
            required: true,
            rules: (formData) => [ // 为函数时，可以获取到 formData 数据
              { required: true, message: '请输入确认密码' },
              { min: 8, message: '密码至少8位' },
              {
                validator (field, value) {
                  if (value !== formData.password) {
                    return Promise.reject('密码和确认密码不一致')
                  }
                  return Promise.resolve()
                }
              }
            ],
            props: {
              type: 'password',
              maxlength: 20
            }
          },
          {
            label: '百分数',
            fieldName: 'persent',
            type: EControlType.eNumber,
            // required: true,
            props: {
              addonAfter: '%',
              precision: 2,
              min: 0,
              max: 100
            }
          },
          {
            label: '金额',
            fieldName: 'amount',
            type: EControlType.eNumber,
            // required: true,
            tooltip: '描述XXXXXXXX',
            props: {
              addonAfter: '元',
              precision: 2,
              max: 100,
              min: 0
            }
          },
          {
            label: '手机号码',
            fieldName: 'mobile',
            type: EControlType.eInput,
            // required: true,
            rules: {
              pattern: new RegExp(/^1[3456789]\d{9}$/),
              message: '请输入正确的手机号码',
              trigger: 'change'
            },
            props: {
              maxlength: 11
            }
          },
          {
            label: '邮箱地址',
            fieldName: 'email',
            type: EControlType.eInput,
            // required: true,
            rules: {
              type: 'email',
              message: '请输入正确的邮箱地址',
              trigger: 'change'
            },
            props: {
            }
          },
          {
            label: '单位名称',
            fieldName: 'unitName',
            type: EControlType.eInput,
            singleLine: true, // 单独占一行
            props: {},
            detailConfig: { // detailConfig 详情时的配置，可对上面(详情时有效的属性)覆盖
              labelCol: undefined,
              wrapperCol: undefined,
              singleLine: false // 如：详情时不单独占一行，或者更换控件类型等
            }
          },
        ]
      },
      {
        label: '单选按钮',
        fieldName: 'radio1',
        type: EControlType.eRadio,
        props: {
          options: [{ id: 1, name: 'name1' }, { id: 2, name: 'name2' }],
          // optionType: '', // option 类型， default | button
          // buttonStyle: '' // optionType 为 button 时，button 的风格样式, outline | solid
        }
      },
      {
        label: '字典单选按钮',
        fieldName: 'radio2',
        type: EControlType.eRadio,
        props: {
          dictType: 'sys_user_sex'
          // optionType: '', // option 类型， default | button
          // buttonStyle: '' // optionType 为 button 时，button 的风格样式, outline | solid
        }
      },
      {
        label: '多选框',
        fieldName: 'checkbox',
        type: EControlType.eCheckbox,
        props: {
          options: [{ id: 1, name: 'name1' }, { id: 2, name: 'name2' }]
        }
      },
      {
        label: '字典多选框',
        fieldName: 'checkbox2',
        type: EControlType.eCheckbox,
        props: {
          dictType: 'sys_user_sex'
        }
      },
      {
        label: '静态下拉',
        fieldName: 'staticSelect',
        type: EControlType.eSelect,
        props: {
          useAll: true, // 是否在前面添加全部
          // allowClear: true,
          options: [{ id: 1, name: 'name1', other: 'other1' }, { id: 2, name: 'name2', other: 'other2' }],
          // mode: '', // 下拉模式 'multiple' | 'tags' | 'combobox'
          // onChange (val, option, formData) {
          //   console.log(val, option, formData)
          // }
        }
      },
      {
        label: '字典下拉',
        fieldName: 'dictSelect',
        type: EControlType.eSelect,
        props: {
          useAll: false, // 是否在前面添加全部，默认 false
          useRefresh: false, // 是否开启手动刷新功能，默认 true，会在控件后面添加刷新图标，点击刷新控件的数据源
          dictType: 'sys_user_sex',
          // allowClear: true,
          // mode: '', // 下拉模式 'multiple' | 'tags' | 'combobox'
        }
      },
      {
        label: '动态下拉',
        fieldName: 'dmSelect',
        type: EControlType.eSelect,
        props: {
          // useRefresh: false, // 有动态数据源的组件特有的属性，是否开启手动刷新功能，默认 true，会在控件后面添加刷新图标，点击刷新控件的数据源
          remote: { // 远程数据源配置，配置了 remote 就不需要配置 options，所有组件都支持 remote 配置
            url: '/system/user/selectUser',
            // method: 'get', // 默认 post
            params: {
              // type: 1,
              // type: '{formData.radio1:required}' // 动态参数，formData代表表单数据，required代表是否必填，必填时，有值才获取数据源
            },
            // autoRefresh: true, // 每次弹窗后自动刷新远程数据
            converter (result) { // 对接口返回数据进行修改，转成 [{id, name, xxx}] 格式
              return result.list?.map(item => ({ id: item.userId, name: item.nickName }))
            }
          }
        }
      },
      {
        label: '选择用户',
        fieldName: 'userIds',
        type: EControlType.eUserSelect,
        props: {
          maxCount: 5
        }
      },
      {
        label: '选择部门',
        fieldName: 'deptId',
        type: EControlType.eTreeSelect,
        required: true,
        props: {
          fieldNames: { value: 'id', label: 'label' },
          remote: {
            url: '/system/dept/tree',
          }
        }
      },
      {
        label: '树形单选',
        fieldName: 'tree',
        type: EControlType.eTreeSelect,
        props: {
          // useRefresh: false, // 有动态数据源的组件特有的属性，是否开启手动刷新功能，默认 true，会在控件后面添加刷新图标，点击刷新控件的数据源
          remote: {
            url: '/system/user/deptTree',
            // method: 'get', // 默认 post
            // params: {}, // 额外请求参数
            // autoRefresh: true, // 每次弹窗后自动刷新远程数据
            // converter
          },
          fieldNames: { // 与默认值一致时可以不用配
            // value: 'id', // value 对应的字段名，默认 id
            label: 'label', // 名称 对应的字段名，默认 name
            // children: 'children' // 子集列表对应的字段名，默认 children
          }
        }
      },
      {
        label: '树形多选',
        fieldName: 'treeMul',
        type: EControlType.eTreeSelect,
        props: {
          // useRefresh: false,
          remote: {
            url: '/system/user/deptTree',
            // method: 'get', // 默认 post
            // params: {}, // 额外请求参数
            // autoRefresh: true, // 每次弹窗后自动刷新远程数据
            // converter
          },
          treeCheckable: true,
          fieldNames: {
            value: 'id',
            label: 'label',
            children: 'children'
          }
        }
      },
      {
        label: '日期',
        fieldName: 'date',
        type: EControlType.eDate,
        props: {
          // showTime: true // 是否需要时分秒
          // onChange (val, formData) { } // 改变事件
        }
      },
      {
        label: '日期范围',
        // 范围类字段，后端一般是设置为起、止两个字段，此处设置的字段名提交时会删掉，替换成 fieldNames 中设置的两个字段，编辑时会反向解析到该字段
        fieldName: 'dateRange',
        type: EControlType.eDateRange,
        props: {
          // 是否需要时分秒
          // showTime: true
          // 可选，默认是 fieldName 后面增加 'Begin', 'End'
          // fieldNames: ['dateRangeBegin', 'dataRangeEnd']
        }
      },
      {
        label: '是否',
        fieldName: 'switch',
        type: EControlType.eSwitch,
        props: {
        }
      },
      {
        label: '文件上传',
        fieldName: 'fileUpload',
        type: EControlType.eFileUpload,
        tooltip: '仅支持 zip/rar 文件',
        props: {
          valueType: 'String', // 值类型，文件对象数组，或图片地址逗号分隔字符串 Array | String
          accept: '.zip,.rar',
          // btnText: '上传文件', // 上传按钮文字
          // maxCount: 5, // 最大上传文件数量
          // fileSize: 2 * 1024, // kb
          // disabled: false,
          // data: { prefix: 'temp' }, // 文件服务根目录下的子文件夹名，不带 '/'，默认 temp
          // name: 'file', // 定义文件上传字段名，默认 file
          // multiple: false, // 是否可一次选择多个文件，默认 false
          // ... 其他继承自 a-upload 的属性
        }
      },
      {
        label: '图片上传',
        fieldName: 'imageUpload',
        type: EControlType.eImageUpload,
        props: {
          // valueType: 'String', // 值类型，文件对象数组，或图片地址逗号分隔字符串 Array | String
          // maxCount: 10, // 文件数量限制
          // fileSize: 1024 * 10, // 文件大小限制，单位KB
          // btnText: '上传图片', // 上传按钮文字
          // accept: 'image/*',
          // disabled: false,
          // data: { prefix: 'temp' }, // 文件服务根目录下的子文件夹名，不带 '/'，默认 temp
          // name: 'file', // 定义文件上传字段名，默认 file
          // multiple: false, // 是否可一次选择多个文件，默认 false
          // ... 其他继承自 a-upload 的属性
        }
      },
      {
        label: '文本域',
        fieldName: 'remark',
        type: EControlType.eTextarea,
        required: true,
        singleLine: true,
        props: {
          // rows: 5,
          // maxlength: 100
        }
      },
      {
        label: '富文本',
        fieldName: 'editor',
        type: EControlType.eEditor,
        required: true,
        singleLine: true,
        props: {
          height: '400px'
        }
      },
      {
        label: '动态表格',
        fieldName: 'table',
        type: EControlType.eTable,
        singleLine: true,
        // disabled: true,
        // required: true, // 无效配置，请配置在 props.columns 的每一项里
        // rules: {}, // 无效配置，请配置在 props.columns 的每一项里
        // 动态表格的校验规则，全部配置在 columns 内，只要有一个 column 的 required 为 true，则表示该项为必填项
        // 校验规则 只支持 required, validator: (index, value, record) => {} ()
        props: {
          // primaryKey: 'id',
          // maxCount: 10,
          useAddDefault: true, // 是否在初始化时默认新增一行
          useTextOCR: true, // 是否使用文本识别
          // ... 更多属性参考 DynamicTable 的 props
          columns: [
            {
              title: '序号',
              dataIndex: 'sort',
              type: EControlType.eCustom,
              width: 50,
              align: 'center',
              ocrIgnore: true, // 在 OCR 识别时，忽略这一列
              props: {
                component: { // table 内的组件拥有单元格相关信息： cellInfo = { text, record, index, column }
                  render ({ $attrs }) {
                    return h('span', $attrs.cellInfo.index + 1)
                  }
                }
              },
            },
            {
              // 表格列字段参考 DynamicTable 的 props.columns
              title: '字段1',
              tooltip: '字段1描述',
              dataIndex: 'field1',
              type: EControlType.eInput,
              // isView: true, // 查看模式
              disabled: (record, records) => record.field2 === 2, // Boolean | (record, records) => Boolean
              required: (record, records) => record.field2 === 1, // Boolean | (record, records) => Boolean
              // defaultValue: 'xxxxxx', // 默认值
              // rules: [], // 不生效，请用 validator
              validator: (index, value, record, records) => { // record: 当前行的数据对象，records: 所有行数据
                if (value && value.length < 3) {
                  // 错误时，return 'message'
                  return `第${ index + 1 }行字段1长度不能小于3`
                }
                // 正确时无需返回
              },
              props: { // 组件属性配置，支持对象和函数，没有可以不配，Object | (record, records) => Object
                // placeholder: '', // 默认根据 title 生成; 支持字符串和函数，string | (record, records) => string
                // onChange (val, record, records) {
                //   console.log(val, record, records)
                // }
              }
            },
            {
              title: '隐藏域',
              dataIndex: 'fieldHidden',
              hidden: true
            },
            {
              title: '字段2',
              dataIndex: 'field2',
              type: EControlType.eSelect,
              props: {
                useAll: true,
                options: [
                  { id: 1, name: 1 },
                  { id: 2, name: 2 }
                ],
                // dictType: 'xxx_xxx' // 或者使用字典为数据源
                // remote: {...} // 或者使用远程数据源
                onChange (val, record, records) {
                  // 通过修改 record.xxx 联动其他列
                  console.log(val, record, records)
                  // if (val === 2 && !record.field1) {
                  //   record.fieldHidden = '赋值给隐藏域'
                  //   record.field1 = '联动修改了这里'
                  // }
                }
              }
            }
          ]
        }
      },
      {
        label: '自定义组件',
        fieldName: 'custom',
        type: EControlType.eCustom,
        // singleLine: true,
        props: {
          diyProp: '自定义属性',
          // component：vue组件，对象或返回对象的函数 Object || (formData) => Object
          component: {
            render (ctx) {
              return h('span', {}, ['自定义组件8888', ctx.$attrs.diyProp])
            }
          }
          // 或者 使用全局组件, import { resolveComponent } from 'vue'
          // component: resolveComponent('DictView'),
          // 或者 外部引入的单文件组件 import MyComponent from 'xxx'
          // component: MyComponent,
          // 其他属性在同级设置
          // props1: ''
          // modelProps: 'checkedKeys', // 自定义组件的 v-model:value 字段 默认是 value
          // modelEvent: 'onCheck', // 自定义组件的 v-model 事件字段，默认是 'onUpdate:value'
          // modelData: 'treeData', // 自定义组件的 dataSource 字段
          // renderNeedDataSource: true // 需要有数据源才渲染
        }
      }
    ]
  })
}))

function getMockData (searchParams) {
  console.log('searchParams', searchParams)
  return {
    list: [
      { id: 1, nickName: '张静', age: '24', avatar: 'https://lf-flow-web-cdn.doubao.com/obj/flow-doubao/doubao/web/doubao_avatar_new.png', image: 'https://gips1.baidu.com/it/u=4056832123,214617935&fm=3074&app=3074&f=PNG?w=2560&h=1440', amount: 12345, withUnit: 33, name2: '对对对', dict: '2', status: 1, diy: 'd', color: 'red', isEnabled: true, phonenumber: '13112341234', address: '广州市黄埔区xxx', slotField: 'x', createTime: '2026-08-08 12:12:12' },
      { id: 2, nickName: '顾云绡', age: '22', avatar: 'https://lf-flow-web-cdn.doubao.com/obj/flow-doubao/doubao/web/doubao_avatar_new.png', image: 'https://gips1.baidu.com/it/u=4056832123,214617935&fm=3074&app=3074&f=PNG?w=2560&h=1440', amount: 1357.66, withUnit: 22, name2: '是是是', dict: '2', status: 2, diy: 'u', color: 'green', isEnabled: false, phonenumber: '15512341234', address: '广州市黄埔区xxx', slotField: 'x', createTime: '2026-08-08 12:12:12' },
      { id: 3, nickName: '温桃纾', age: '23', avatar: '', image: '', amount: 1857.66, withUnit: 12, name2: '是是是', dict: '2', status: 2, diy: 'ee', color: 'green', isEnabled: true, phonenumber: '13313131313', address: '北京市朝阳区xxx', slotField: 'x', createTime: '2026-08-08 12:12:12' },
      { id: 4, nickName: '楚晚棠', age: '23', avatar: '', image: '', amount: 1857.66, withUnit: 12, name2: '是是是', dict: '2', status: 2, diy: 'ee', color: 'green', isEnabled: true, phonenumber: '13313131313', address: '北京市朝阳区xxx', slotField: 'x', createTime: '2026-08-08 12:12:12' },
      { id: 5, nickName: '沈知绯', age: '23', avatar: '', image: '', amount: 1857.66, withUnit: 12, name2: '是是是', dict: '2', status: 2, diy: 'ee', color: 'green', isEnabled: true, phonenumber: '13313131313', address: '北京市朝阳区xxx', slotField: 'x', createTime: '2026-08-08 12:12:12' },
      { id: 6, nickName: '顾云绡', age: '23', avatar: '', image: '', amount: 1857.66, withUnit: 12, name2: '是是是', dict: '1', status: 2, diy: 'ee', color: 'green', isEnabled: true, phonenumber: '13313131313', address: '北京市朝阳区xxx', slotField: 'x', createTime: '2026-08-08 12:12:12' },
      { id: 7, nickName: '谢景珩', age: '23', avatar: '', image: '', amount: 1857.66, withUnit: 12, name2: '是是是', dict: '1', status: 2, diy: 'ee', color: 'green', isEnabled: true, phonenumber: '13313131313', address: '北京市朝阳区xxx', slotField: 'x', createTime: '2026-08-08 12:12:12' },
      { id: 8, nickName: '傅清晏', age: '23', avatar: '', image: '', amount: 1857.66, withUnit: 12, name2: '是是是', dict: '1', status: 2, diy: 'ee', color: 'green', isEnabled: true, phonenumber: '13313131313', address: '北京市朝阳区xxx', slotField: 'x', createTime: '2026-08-08 12:12:12' },
      { id: 9, nickName: '陆屿川', age: '23', avatar: '', image: '', amount: 1857.66, withUnit: 12, name2: '是是是', dict: '1', status: 2, diy: 'ee', color: 'green', isEnabled: true, phonenumber: '13313131313', address: '北京市朝阳区xxx', slotField: 'x', createTime: '2026-08-08 12:12:12' },
      { id: 10, nickName: '萧叙白', age: '23', avatar: '', image: '', amount: 1857.66, withUnit: 12, name2: '是是是', dict: '1', status: 2, diy: 'ee', color: 'green', isEnabled: true, phonenumber: '13313131313', address: '北京市朝阳区xxx', slotField: 'x', createTime: '2026-08-08 12:12:12' },
      { id: 11, nickName: '江亦澄', age: '23', avatar: '', image: '', amount: 1857.66, withUnit: 12, name2: '是是是', dict: '1', status: 2, diy: 'ee', color: 'green', isEnabled: true, phonenumber: '13313131313', address: '北京市朝阳区xxx', slotField: 'x', createTime: '2026-08-08 12:12:12' },
    ],
    total: 11
  }
}
/**
 * 查询前修改查询参数
 * @param {object} searchParams 查询参数
 */
function beforeSearch (searchParams) {
  return searchParams
}

/**
 * 查询后修改查询结果
 * @param {Array} list 查询结果列表
 */
function afterSearch (list) {
  return list
}

/**
 * 提交表单数据前对提交的数据修改
 * @param {Object} submitData 提交的数据
 * @param {Object} param 其他参数
 * @returns 修改后的数据
 */
function beforeSubmit (submitData, { isAdd, isEdit, isView, detail }) {
  return submitData
}

/**
 * 提交表单数据成功后执行
 * @param {Object} formData 提交的数据
 * @param {Object} param 其他参数
 * @returns 修改后的数据
 */
function afterSubmit ({ isAdd, isEdit, formData, detail }) {
}

/**
 * 弹窗(新增、修改、详情弹窗)后执行
 * @param {Object} param 其他参数
 */
function afterOpenModal ({ isAdd, isEdit, isView, record, detail, cForm }) {
  // const formRemotes = cForm.value.remotes()
  // formRemotes['有远程数据源的字段的字段名']?.() // 手动触发获取某个字段的远程数据源
}

/**
 * 编辑、详情时，对详情数据修改
 * @param {Object} detail 详情数据
 * @param {Object} param 其他参数
 */
function transformDetail (detail, { isEdit, isView }) {
  return detail
}
</script>

<style lang="scss" scoped>
</style>
