# CPage 组件使用文档
AI 基于 [demo-page](../views/demo/demo-page.vue) 总结
## 目录
- 概览（CPage 顶级 Props / Events）
- treeConfig（左侧筛选树配置）
- filterConfig（查询区配置）
- toolsConfig（工具栏配置）
- tableConfig（表格配置）
- modalConfig（弹窗与表单）
- 其它回调函数（生命周期钩子）
- 常见属性参考（表格列、表单字段类型枚举说明）

```html
  <CPage
    hasImport
    hasExport
    hasGoBack
    primary-key="id"
    :no-add="false"
    :no-delete="false"
    :no-select="false"
    :no-tools="false"
    :api-config="{}"
    :api-option-config="{}"
    :permission-config="{}"
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
  />
```

## 一、CPage 顶级 Props / Events
| 属性 | 类型 | 说明 | 默认 |
|---|---:|---|---|
| ref (组件引用) | ref | 页面组件引用，常用方法：refresh(), clearSelect() | — |
| hasImport | Boolean | 是否显示导入按钮 | false |
| hasExport | Boolean | 是否显示导出按钮 | false |
| hasGoBack | Boolean | 是否显示返回按钮 | false |
| primary-key | String | 主键字段名 | "id" |
| :no-add | Boolean | 禁用新增按钮（true 则隐藏） | false |
| :no-delete | Boolean | 禁用批量删除（true 则隐藏） | false |
| :no-select | Boolean | 禁用行选择（true 则不显示选择列） | false |
| :no-tools | Boolean | 禁用工具栏（true 则隐藏工具区） | false |
| :api-config | Object | 预设功能接口地址配置，支持：list, add, update, detail, delete, toggle, import, importTemplate, export | 根据路由自动生成 |
| :api-method-config | Object | 预设功能请求方式配置 | 默认全部 post |
| :api-option-config | Object | 预设功能请求额外选项（如 headers） | {} |
| :permission-config | Object | 预设功能权限配置 | 根据路由生成 |
| :tree-config | Object | 左侧树配置（不传则不显示树） | undefined |
| :filter-config | Object | 查询条件配置（表单） | undefined |
| :tools-config | Object | 工具栏配置 | undefined |
| :table-config | Object | 表格配置 | undefined |
| :modal-config | Object | 新增/编辑/详情弹窗 + 表单配置 | undefined |
| :before-search | Function | 查询前处理 (searchParams) => searchParams | 返回传入参数 |
| :after-search | Function | 查询后处理 (list) => list | 返回传入列表 |
| :before-submit | Function | 提交前处理 (submitData) => submitData | 返回传入数据 |
| :after-submit | Function | 提交成功后执行 ({...}) => void | — |
| :after-open-modal | Function | 弹窗打开后 ({...}) => void | — |
| :transform-detail | Function | 编辑/详情时转换接口返回 detail (detail, {...}) => detail | 返回原 detail |
| header | slot | 头部插槽 | - |
| filter | slot | 查询区插槽 | - |
| tools | slot | 工具栏插槽 | - |
| table | slot | 表格区插槽 | - |
| table_xxx | slot | 表格单元格动态插槽，插槽参数：{ text, record, index, column } | - |
| ... | - | 其他属性可以根据需要自由扩展 | - |

---

## 二、treeConfig（左侧树配置）
| 属性 | 类型 | 说明 | 默认 |
|---|---:|---|---|
| url | String | 获取树数据的接口地址 | 必填 |
| params | Object | 额外请求参数 | {} |
| method | String | 请求方法（post\|get） | post |
| replaceField | Object | 字段替换：{ key, children, title } | { key:'id', children:'children', title:'title' } |
| searchField | String | 选中节点用于列表查询的字段名（默认 orgId） | "orgId" |
| ... | - | 其他属性可以根据需要自由扩展 | - |

示例：
```javascript
const treeConfig = {
  url: '/system/user/deptTree',
  replaceField: { key: 'id', children: 'children', title: 'label' },
  searchField: 'deptId'
}
```
---

## 三、filterConfig（查询区域配置）
| 属性 | 类型 | 说明 | 默认 |
|---|---:|---|---|
| useCache | Boolean | 是否显示暂存按钮 | false |
| cacheBtnText | String | 暂存按钮文本 | "记住查询" |
| col | Object | 全局栅格设置（a-col） | { sm:8, lg:6, xxl:4 } |
| labelCol | Object | 全局 label 栅格 { flex: '80px' }（示例） | 文本宽度 |
| wrapperCol | Object | 全局控件栅格 { flex: 'auto' }（示例） | 撑满剩余空间 |
| buttonsCol | Object | 按钮列栅格 { flex: 'auto' }（示例） | { span: 4 } |
| buttonsAlign | String | 按钮对齐 left\|center\|right | 'left' |
| fields | Array | 字段数组，每项为 FieldConfig | 必填（视需求） |
| ... | - | 其他属性可以根据需要自由扩展 | - |

**filterConfig.fields** 数据项属性说明：
| 属性 | 类型 | 说明 | 默认值 |
|---|---:|---|---|
| label | String \| Function | 标签文本 | - |
| fieldName | String | 字段名（提交 key） | - |
| type | Enum(EControlType) | 控件类型（不填为输入框 eInput） | EControlType.eInput |
| col | Object | 表单项栅格配置 | - |
| labelCol | Object | 表单项布局覆盖，参考 a-form-item | - |
| wrapperCol | Object | 表单项布局覆盖，参考 a-form-item | - |
| props | Object | 传给控件的属性（如 placeholder、options、remote、dictType 等） | - |
| defaultValue | any | 默认值（设置则会触发初始化查询） | - |
| ... | - | 其他属性可以根据需要自由扩展 | - |

---

## 四、toolsConfig（工具栏配置）
**toolsConfig** 属性说明：
| 属性 | 类型 | 说明 |
|---|---:|---|
| addBtnText | String | 新增按钮文本 |
| addInitData | Object | 新增时初始化数据 |
| backBtnText | String | 返回按钮文本 |
| otherTools | Array | 工具栏上其他自定义按钮配置 |
| ... | - | 其他属性可以根据需要自由扩展 |

**toolsConfig.otherTools** 数据项属性说明：
| 属性 | 类型 | 说明 |
|---|---:|---|
| name | String \| Function | 与component二选一，按钮文本或返回文本的函数:(options) => String |
| component | String \| Component | 与name二选一，非按钮时，指定全局组件名或组件对象，如：'a-button'\| MyComponent |
| permission | String | 权限点 |
| props | Object | 组件/按钮属性 |
| on | Object \| (options) = Object | component时事件监听（支持函数形式获取页面上下文），返回一个对象: on: (options) => ({ click: (e) => {...}, 'update:value': (val) => {...} }) |
| ... | - | 其他属性可以根据需要自由扩展 |

示例：
```javascript
const toolsConfig = computed(() => ({
  addBtnText: '新增根节点',
  addInitData: { parentId: 0 },
  otherTools: [{
    name: '自定义按钮', // String | ({ selectedIds, selectedObjs, pagination }) => String
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
        //     cPage.value.refresh() // 刷新列表
        //     cPage.value.clearSelect() // 清空选中
        //   }
        // })
      }
    }
  }]
}))
```

---

## 五、tableConfig（表格区配置）
表格顶层：
| 属性 | 类型 | 说明 |
|---|---:|---|
| props | Object | a-table 的 props（如 scroll, bordered, size 等） |
| initSearch | Boolean | 是否在初始化时自动查询 | true |
| columns | Array | 列定义数组（必填） |
| ... | - | 其他属性可以根据需要自由扩展 |

---

**tableConfig.props** 属性说明：
在 a-table 的基础上扩展了如下属性：
| 属性 | 类型 | 说明 | 默认值 |
|---|---:|---|---|
| pageSize | Number | 默认分页大小 | 10 |
| usePage | Boolean | 是否使用分页 | true |
| rowClick | Function | 行点击事件 (options) => {} | - |
| ... | - | 其他属性可以根据需要自由扩展 | - |

**tableConfig.columns** 属性说明：
带 * 号表示基于 a-table.columns 扩展的属性，重点关注带 * 号的属性
| 属性 | 类型 | 说明 |
|---|---:|---|
| title | String | 列标题 |
| dataIndex | String | 字段名 |
| key | String | 列 key |
| width / minWidth / maxWidth | Number\|String | 宽度\|最小宽度\|最大宽度 |
| resizable | Boolean | 是否可拖拽调整宽度，默认 false |
| sorter | Boolean \| Function | 服务端排序或本地排序函数，为true，表示服务端排序，为函数则表示本地排序：(a, b) => a.xxx - b.xxx，汉字或某些英文需要使用 (a, b) = > (a.xxx ?? '').localeCompare(b.xxx ?? '', 'zh-Hans-CN') |
| customRender | Function | 自定义渲染 (ctx) => vnode/string |
| ellipsis | Boolean | 是否超出省略 |
| fixed | String | 固定列 'left'\|'right' |
| tooltip | String | * 标题提示 |
| unit | String | * 单位，会拼在值后面（例如 '20 元'） |
| useTotal | Boolean | * 该列是否使用合计，会在表格底部增加一栏合计，汇总该列的值 |
| hidden | Boolean | * 该列是否暂时隐藏，可通过列筛选器勾选显示 |
| dictType | String | * 按字典解析显示 |
| slot | String | * 插槽名，为避免和其他插槽冲突，建议使用 `table_` + dataIndex 格式命名, 在 CPage 内通过 <template #table_xxx="{ text, record, index, column }"> 使用 |
| type | String | * 预处理类型，自动解析（可选值：isEnabled、Boolean）其他类型可自行扩展 |
| isAmount | Boolean | * 是否金额，格式化为 12,345.00 |
| isAvatar | Boolean | * 是否头像，格式化为 a-avatar，支持base64(有前缀和无前缀)、http地址、相对路径 |
| isImage | Boolean | * 是否图片，格式化为 a-image，支持base64(有前缀和无前缀)、http地址、相对路径 |
| isDate | Boolean | * 日期类型转换为 YYYY-MM-DD |
| isDateTime | Boolean | * 日期类型转换为 YYYY-MM-DD HH:mm |
| dateFormat | String | * dayjs日期格式化字符串，日期类型转换为自定义格式 |
| hideChar | Array | * 脱敏配置 [leftNum,rightNum,replacement] |
| default | any | * 默认值，如 '-' 或 HTML 字符串 |
| action | Array \| Function | * 操作列配置或生成配置的函数: (options) => Array |
| actionShowNum | Number | * 操作列显示几个按钮，超出的将收进更多 |
| actionMoreText | String | * 更多按钮文本，默认"更多" |
| ... | - | 其他属性可以根据需要自由扩展 | - |

**tableConfig.columns.action** 数据项属性说明：
| 属性 | 类型 | 说明 |
|---|---|---|
| name | String | 操作按钮文本 |
| callback | String\|Function | 点击回调，'edit'\|'detail'\|'delete'\|'toggle' 或 自定义函数 |
| permission | String | 权限标识，如：'system:user:add' |
| confirm | Boolean | 该操作是否需要确认弹窗 |
| confirmContent | String | 自定义确认文本 |
| customRender | Function | 自定义渲染函数，data => { return h('span', { class: '' }, '自定义组件')} |
| ... | - | 其他属性可以根据需要自由扩展 | - |

 **callback** 点击回调，预设功能直接写字符串：edit、detail、delete、toggle, 自定义功能则指定一个函数，(options) => {}

---

## 六、modalConfig（新增/编辑/详情弹窗与表单配置）
| 属性 | 类型 | 说明 | 默认 |
|---|---:|---|---|
| title | String | 弹窗标题，组件会自动拼接新增/编辑/详情关键字 | — |
| fullTitle | String | 弹窗标题全称，不自动拼接，与title二选一即可 | — |
| width | Number | 弹窗宽度 | 600 |
| mode | String | 弹窗模式 'modal'\|'drawer' | 'modal' |
| props | Object | 直接透传给 a-modal 或 a-drawer 的属性 | — |
| buttonConfig | Object \| Function | 页脚按钮配置，支持 ({isAdd,isEdit,isView}) => Object | — |
| formConfig | Object \| Function | 表单配置：({isAdd,isEdit,isView,detail}) => { fields: [...] } | — |
| ... | - | 其他属性可以根据需要自由扩展 | - |

**modalConfig.buttonConfig** 属性说明：按钮的加载状态根据表单提交的 promise 状态自动切换
| 属性 | 类型 | 说明 |
|---|---:|---|
| showConfirm | Boolean | 是否显示确认按钮 |
| confirmText | String | 确认按钮文本 |
| confirmContinue | Boolean \| Function | 提交后是否继续（只清空不关闭），或自定义行为 (formData, submitData) => {}, 如序号自增1：(formData, submitData) => { formData.sort = submitData.sort + 1 } |
| showCancel | Boolean | 是否显示取消按钮 |
| cancelText | String | 取消按钮文本 |
| ... | - | 其他属性可以根据需要自由扩展 | - |

**modalConfig.formConfig** 表单配置属性：
| 属性 | 类型 | 说明 | 默认值 |
|---|---:|---|---|
| layout | String | 表单布局方式，'horizontal' \| 'vertical' \| 'inline' | 'horizontal' |
| cols | Number | 一行显示几列 | 2 |
| labelCol | Object | 全局表单项文本部分栅格配置，参考 a-form | { flex: '0 0 100px' } |
| wrapperCol | Object | 全局表单项文本部分栅格配置，参考 a-form | 撑满剩余空间 |
| fields | Array\<Field> | 表单项字段数组配置 | - |
| ... | - | 其他属性可以根据需要自由扩展 | - |

---

**modalConfig.formConfig.fields** 表单字段数组每项属性：
- 功能比 filterConfig.fields 强大

| 属性 | 类型 | 说明 | 默认值 |
|---|---:|---|---|
| label | String \| formData => String | 字段标签 | - |
| fieldName | String | 字段名，必填 | - |
| title | String | 分组时组名 | - |
| subTitle | String | 分组时副组名 | - |
| fields | Array\<Field> | 分组时该组的字段数组 | - |
| type | String | 控件类型，EControlType 指定的类型或全局组件名 | EControlType.eInput |
| required | Boolean \| formData => Boolean | 是否必填 | false |
| hidden | Boolean \| formData => Boolean | 是否隐藏该字段，数据仍在表单中 | false |
| none | Boolean\ | formData => Boolean | 是否不需要该字段，数据不在表单中 | false |
| disabled | Boolean \| formData => Boolean | 是否禁用 | false |
| singleLine | Boolean | 是否单独占一行 | false |
| col | Object | 表单项(包含文本和控件)栅格设置，固定宽度可以设置为 { flex: '280px' }，参照 a-col 属性 | 默认根据列数计算 |
| labelCol | Object | 表单项文本部分栅格设置，参照 a-col，{ flex: '120px' }、{ span: 6 } | - |
| wrapperCol | Object | 表单项控件部分栅格设置，参照 a-col，{ flex: '1 1 0' }、{ span: 18 } | - |
| defaultValue | any | 初始值 | - |
| rules | Object \| Array \| formData => { return {} \|\| [] } | 校验规则，与 \<a-form-item> rules 一致 | - |
| tooltip | String \| Function | 额外浮窗提示 | - |
| extra | String \| Function | 额外底部提示 | - |
| props | Object \| formData => Object | 透传给控件的 props（包括 remote 配置） | - |
| detailConfig | Object | 详情模式覆盖配置 | - |
| ... | - | 其他属性可以根据需要自由扩展 | - |

**分组用法** 只支持嵌套一层
```js
fields: [
  {
    label: '名称',
    fieldName: 'name',
  },
  {
    title: '组1',
    subTitle: '副标题',
    hidden: formData => formData.type === 1, // type = 1 时，隐藏该组
    none: formData => formData.type === 2, // type = 2 时，移除该组
    fields: [...] // 该组字段数组
  }
]
```

**所有表单控件 Field.props 的特殊属性**
| 属性 | 类型 | 说明 | 默认值 |
|---|---:|---|---|
| isView | Boolean | 是否查看模式，是则只展示文本，在表单中会自动根据当前模式设置，正常无需设置 | - |
| useAll | Boolean | 带数据源的组件(select,radio,checkbox,autoComplete等)是否在前面添加全部，{ label: '全部', value: null } | - |
| useRefresh | Boolean | 带动态数据源的组件，是否在组件后面添加刷新按钮 | - |
| dictType | String | 对应字典类型，自动根据该类型查询出字典数据绑定到控件上，仅 select、autoComplete、radio、checkbox 等需要字典数据源的控件支持 | - |
| remote | Object | 远程数据源配置，仅需要动态数据源的控件支持 | - |
| onChange | Function | 值改变事件，经过框架重写，回调函数中能拿到表单数据对象进行表单联动，(val, ...args, formData) => {}，注：控件类型不同，入参的个数及顺序会有差异 | - |
| ... | - | 其他属性可以根据需要自由扩展 | - |

```javascript
{
  label: 'xxx',
  fieldName: 'xxx',
  type: EControlType.eSelect,
  props: {
    useAll: true,
    useRefresh: false,
    dictType: 'sys_user_sex',
    onChange (val, option, formData) {}
  }
}
```

**field.props.remote** 属性说明：
| 属性 | 类型 | 说明 | 默认值 |
|---|---:|---|---|
| url | String | 接口地址，必填 | - |
| method | String | 接口请求方式 | 'post' |
| params | Object | 接口参数 | - |
| autoRefresh | Boolean | 是否每次弹窗后自动请求一次 | - |
| converter | Function | 数据源数据转换器 (res) => res | - |

示例：
```js
{
  label: '动态下拉',
  fieldName: 'dmSelect',
  type: EControlType.eSelect,
  props: {
    // useRefresh: false,
    remote: {
      url: '/system/user/selectUser',
      // method: 'get', // 默认 post
      params: {
        // type: 1,
        // type: '{formData.radio1:required}'
      },
      // autoRefresh: true,
      converter (result) {
        return result.list?.map(item => ({ id: item.userId, name: item.nickName }))
      }
    }
  }
},
```


自定义组件特有属性（type: EControlType.eCustom）：
| 属性 | 说明 |
|---|---|
| props.component | 可传 render 函数、全局组件名 或 单文件组件对象 |
| props.modelProps | 自定义 v-model 字段与事件映射，默认 'value' |
| props.modelEvent | 自定义 v-model 字段与事件映射，默认 'onUpdate:value' |
| props.modelData | 自定义数据源字段名，默认 'dataSource' |
| props.renderNeedDataSource | 是否需要有数据源数据才渲染 |

---

## 七、CPage 回调与钩子说明
| 函数名 | 参数 | 返回值 | 说明 |
|---|---|---|---|
| beforeSearch(searchParams) | Object | Object | 查询前对参数修改，返回最终参数 |
| afterSearch(list) | Array | Array | 查询后处理列表 |
| beforeSubmit(submitData, {isAdd,isEdit,isView,detail}) | Object, ctx | Object | 提交前处理表单提交数据 |
| afterSubmit({isAdd,isEdit,formData,detail}) | Object | — | 提交成功后的回调 |
| afterOpenModal({isAdd,isEdit,isView,record,detail,cForm}) | Object | — | 弹窗打开后 |
| transformDetail(detail, {isEdit,isView}) | Object | Object | 编辑/详情时对接口返回 detail 做转换后返回 |

---

## 八、建议与注意事项（精简）
- remote 配置常用于动态数据源，支持 converter 转换返回结果为 {id,name} 格式。
- 设置字段 defaultValue 会在页面初始化时触发一次查询（表单会自动提交）。
- formConfig 可为函数，以便根据 isAdd/isEdit/isView/detail 返回不同字段配置。
- 动态表格校验仅支持在列内使用 validator 或 required 标识。
- 操作列 callback 可返回 async 函数并在执行后调用 cPage.value.refresh() 刷新列表。

---

### 更多参考及全配置使用示例请参考：[demo-page](../views/demo/demo-page.vue)，demo-page 永远是最好最全的文档