## 使用文档、手册

### 1、基础底座说明
- 框架使用了自动导入插件，vue、vue-router、vue-i18n、utils、Enum 内部 API 在开发中无需 import, 可直接用
- ant-design-vue 组件及图标在 vue template 中会自动导入，无需 import，在 script setup 中则需要手动导入，如：Modal, message...
- ant-design-vue 内部的 less 变量已注入到全局 less 环境，.less文件、《style lang="less" scoped》 中可直接使用
- antdv 的 less 变量为编译时变量，不会因页面上主题切换而变化，因主题而变化的变量需要换为 css 变量(运行时变量)，变量参考: src/layout/index.vue
- 图标使用 ant-design 图标，不够用时根据自己喜好引入第三方图标库即可
- 为保持基座干净简洁，本基座未添加 eslint、husky、prettier 等约束及格式化插件，如有必要请自行添加
- CPage 组件及相关子组件只为简化 CRUD 开发，本项目基础模块都是通过该组件实现，但非必选，不适用时使用传统模式开发即可

### 2、接口请求
为避免接口龙飞凤舞情况，前后端统一约定，method 统一使用 post，参数统一使用请求体传参，摒弃`restfull`规范及一接口一封装模式，采用通用的请求方式，如：
```javascript
import api from '@/api'
...
// 带参数，带分页，带排序示例
const xxxPager = await api.post('/xxx/xxx/list', {
  priceRange: [10, 100],
  createTimeBegin: 1784085277690,
  createTimeEnd: Date.now(),
  page: {
    pageSize: 10,
    pageNum: 1,
    orderByColumn: 'price',
    isAsc: 'asc'
  }
})
xxxPager.total
xxxPager.list

// 非分页列表情况
const xxxList = await api.post('/xxx/xxx/list', { xxx: 'xxx' })
// xxxList => [{...}, {...}]

// 单个对象情况
const xxxObj = await api.post('/xxx/xxx/getXXX', { xxx: 'xxx' })
// xxxObj => {...}

```
#### 请求
- 第一个参数为接口地址，第二个参数为请求参数，第三个参数为其他配置，可选，如 headers, content-type 的设置
- Content-Type 统一为 application/json，一般情况无需设置
- method 统一为 post
- 统一 post 的好处是在对接接口时，只需关注 url 和 参数，不用关注 method、content-type、传参位置等其他内容，以及省去数据来回的类型转换，提高沟通和开发效率

#### 响应
- 框架对 axios 的二次封装，简化了获取响应数据步骤，对全局异常统一拦截处理，使业务不需要关注全局异常处理
- 【局部异常：需要前端个别地方特殊处理的业务异常】后端请按正常状态(200)返回，将异常信息放在 data 里，避免被统一拦截
- 【全局异常：前端统一处理的异常】后端直接返回4xx,5xx,6xx等状态，在响应拦截器中统一处理，如重新登录、业务异常错误提示
- 返回结果就是业务数据，不用再每次请求都要通过一堆的 `.data` 去获取业务数据

### 3、样式
- 框架中自带了一套基础样式库(原子样式)：`@/assets/css/base.less`，基本可以覆盖90%的场景，无法覆盖的单独写样式即可
- less、组件中可使用 ant-design 的全局静态变量 @colorPrimary 等，但此变量不会跟随主题动态切换而变化，
需要跟随变化请使用动态方式获取或使用全局 css 变量，token 内部的变量名参考[官网](https://www.antdv.com/docs/vue/customize-theme-cn)，如下：
```js
import { useThemeToken } from '@/hooks/useThemeToken.js'
const { token } = useThemeToken()
// 获取动态颜色
token.value.colorPrimary
token.value.colorWarning
token.value.colorSuccess
...
```
或者使用全局 css 变量，css 变量根据主题切换动态变化，变量参考 `layout/index.vue`
```
--ant-colorText
--ant-borderRadius
...
```



### 4、获取当前登录用户
```javascript
import { useAuthStore } from '@/stores/auth-store.js'

const authStore = useAuthStore()
// 是否已登录
console.log('是否已登录：', authStore.hasLogin)
// 登录用户信息
console.log('当前登录用户：', authStore.userInfo)
```

### 5、权限控制
使用自定义指令 `v-hasPermi`、`v-noPermi`、`v-hasRole`

```html
<a-button v-hasPermi="'system:user:add'">新增</a-button>
<a-button v-hasPermi="['xxx:xxx:xxx1', 'xxx:xxx:xxx2']">新增</a-button>
```

使用 hook
```javascript
import usePermission from '@/hooks/usePermission'
const { hasPermission, hasRole } = usePermission()
if (hasPermission('system:user:add')) {
  // 有 system:user:add 权限
}
```

### 6、字典使用
- CRUD 配置中使用，系统CRUD各部分组件已经深度集成了字典功能，在首次需要时加载，加载过的字典会缓存在内存中，避免频繁、重复加载，更新策略：刷新页面、手动点击刷新按钮、通过 useDict 第三个参数配置强制加载，dict-store 中提供了手动刷新方法：getDatasByType
```javascript
  // 表单组件中使用
  {
    label: '字典下拉',
    fieldName: 'xxxStatus',
    type: EControlType.eSelect,
    props: {
      dictType: 'xxx_status' // 指定字典类型，自动查询出字典项数据
    }
  }
  // 列表 column 中使用
  {
    title: 'xx状态',
    dataIndex: 'status',
    width: 100,
    dictType: 'xxx_status' // 自动按指定的字典类型解析出名称
  },
```

- 独立使用，通过 `useDict`
```javascript
import { useDict } from '@/hooks/useDict.js'
// 用法一：
const dict = useDict(['is_delete', 'audit_status'])

dict['audit_status'] // 异步赋值 reactive 响应式对象 dict

// 用法二：
useDict(['audit_status'], dict => {
  console.log(dict['audit_status'])
})

<!-- 字典解析全局组件，支持多个值 -->
<DictView dictType="audit_status" value="1,2" />
```


### 7、弹出模态框（简化版）
全局组件 `/global/CModal` 对 a-modal、a-drawer 进行了合并封装，简化了使用，属性设置支持标签上设置和调用时设置
```html
<template>
  <div>
    xxx
    <CModal ref="cModal" title="xxx" width="800" :onConfirm="onConfirm"...>
      弹出框内部内容
    </CModal>
  </div>
</template>

<script setup>
const cModal = ref()
function openModal () {
  cModal.value.open({
    title: '弹窗标题',
    mode: 'modal', // 弹窗类型，modal | drawer
    width: 600, // 弹窗宽度
    showConfirm: true, // 是否需要确认按钮，默认需要
    // ... 其他属性，参考 src/components/global/CModal/index.vue
    async onConfirm (close) {}, // 点击确认按钮时执行，调用 close() 关闭弹窗
    async onCancel () {} // 点击取消时执行
  }, extraData)
  // 关闭弹窗
  // cModal.value.close()
}
// 也可以通过传入一个函数来执行确认操作，extraData 为调用open时传入的附加数据
function onConfirm (close, extraData) {
}
</script>
```


### 8、CRUD快速开发案例(可直接代码生成，菜单：开发中心->代码生成)
- 步骤一：先在数据库中设计表结构
- 步骤二：然后本地启动进入菜单‘开发中心->代码生成’导入表并编辑相关信息
- 步骤三：预览并一键生成菜单及CRUD前后端代码
- 步骤四：查看生成结果或对特殊字段、控件的属性进行自定义修改

#### 8.1、CRUD 简单案例：
组件 CPage 封装了查询、左侧树形筛选、列表、树形列表、新增、修改、详情、删除、导入、导出、启用、禁用等功能，通过配置选择使用，CPage 分为四块区域，查询区、工具栏区、表格区、新增\修改\详情弹窗区，每块区域对应独立配置，可以很快速很简单实现一个增删查改功能，也可以不传入配置，通过对应插槽自定义实现各个区域部分，接口地址、权限默认根据当前路由生成，可以不用设置

- filterConfig: 查询区域配置
- toolsConfig: 工具栏区域配置
- tableConfig: 表格区域配置
- modalConfig: 新增\修改\详情弹窗区域配置

```html
<!-- xxx管理 -->
<template>
  <!-- 预设功能 API、权限 默认根据路由动态生成，可不配 -->
  <!-- 如：/system/user 页面对应的新增接口及权限：/system/user/add, 权限：system:user:add -->
  <CPage
    :filter-config="filterConfig"
    :table-config="tableConfig"
    :modal-config="modalConfig"
  />
</template>

<script setup>
  import CPage from '@/components/crud/c-page.vue'

  /** 查询条件配置 */
  const filterConfig = {
    fields: [
      { label: '编码', fieldName: 'postCode' }, // 不写 type，默认 Input
      { label: '名称', fieldName: 'postName' },
      { label: '是否启用', fieldName: 'isEnabled', type: EControlType.eSelect, props: { options: EIsEnabled._list } }
    ]
  }

  /** 数据列表配置 */
  const tableConfig = {
    columns: [
      { title: '编码', dataIndex: 'postCode' },
      { title: '名称', dataIndex: 'postName' },
      { title: '是否启用', dataIndex: 'isEnabled', type: 'isEnabled' }, // type 指定预处理类型
      {
        title: '操作',
        actionShowNum: 2, // 展示操作按钮数量，剩余的将收进更多里
        action: ({ record }) => [
          // 预设：edit, detail, delete, toggle，预设功能 callback 可以直接写字符串
          { name: '详情', callback: 'detail' },
          { name: '编辑', callback: 'edit' },
          { name: '删除', callback: 'delete' }, // 删除操作默认带确认框
          { name: record.isEnabled ? '禁用' : '启用', confirm: true, callback: 'toggle' }
        ]
      }
    ]
  }

  /** 新增、修改、详情弹窗配置 */
  const modalConfig = {
    title: 'xx信息', // 弹窗标题，会自动根据类型拼上新增、编辑、详情关键字
    // width: 700, // 弹窗宽度，默认 600
    // mode: 'modal', // 弹窗模式, modal 或 drawer
    formConfig: {
      cols: 2, // 一行显示几列
      fields: [ // 表单字段，可分租
        { label: '编码', fieldName: 'postCode', required: true }, // 不写 type，默认 Input
        { label: '名称', fieldName: 'postName', required: true }, // 不写 type，默认 Input
      ]
    }
  }
</script>
```

#### 8.2、全配置参考案例：[demo-page](../views/demo/demo-page.vue)
既是案例也是文档，也可以访问[CPage 使用文档](./README.cpage.md)

#### 8.3、CRUD 里部分组件也可单独使用
如：src/components/crud/components 下的 c-form、c-component、c-import、c-tree、c-table、c-filter 等，如：
```html
<template>
  <c-form
    :show-cancel="false"
    :form-config="formConfig"
    @submit-handle="onSubmitHandle"
  />
</template>
<script setup>
import cForm from '@/components/crud/components/c-form.vue';
const formConfig = {
  autoReset: false, // 点击取消或提交表单后是否自动重置表单
  fields: [
    {
      label: '姓名',
      fieldName: 'name',
      required: true
    },
    {
      label: '性别',
      fieldName: 'sex',
      type: EControlType.eRadio,
      rules: { required: true, message: '请选择性别' },
      props: {
        dictType: 'sys_user_sex'
      }
    },
    {
      label: '职位',
      fieldName: 'post',
      type: EControlType.eSelect,
      props: {
        remote: {
          url: '/system/post/select',
          converter (list) {
            return list.map(item => ({
              id: item.postId,
              name: item.postName
            }))
          }
        }
      }
    },
  ]
}
async function onSubmitHandle (submitData) {
  console.log('校验通过，提交的数据为：', submitData)
}
</script>
```

#### 8.4、与传统开发模式对比：
```html
<!-- 传统的写法，需要编写大量 Dom 和 js，代码杂乱 -->
...
<el-form-item label="选择xxx" prop="xxxId" required :rules="[xxx]">
  <el-select
    v-model="formData.xxxId"
    placeholder="请选择xxx"
    @change="onXxxChange"
  >
    <el-option
      v-for="tem in xxxList"
      :key="tem.id"
      :label="tem.name"
      :value="tem.id"
    />
  </el-select>
</el-form-item>
...
<script setup>
import axios from '@/api'
const xxxList = ref()
const formData = reactive({
  xxxId: undefined
})
async function getXxxList (type) {
  if (type) {
    xxxList.value = await axios.post('/api/xxx/select', { type })
  }
}
// type 变化时，重新请求下拉框数据
function onTypeChange (type) {
  getXxxList(type)
}
function onXxxChange (e) {
}

/** --------------------------------------------------------- */

/**
 * 本框架写法，只需编写 js，并自动匹配新增、修改、详情三种模式
 * 字段越多，优势越明显
 */
...
{
  label: '选择xxx',
  fieldName: 'xxxId',
  type: EControlType.eSelect,
  rules: [xxx],
  required: true,
  props: {
    remote: { // 所有组件支持远程数据源配置
      url: '/api/xxx/select',
      params: {
        type: '{formData.type:required}' // 使用'{}'，自动监听表单的 type 字段，变化时，重新获取数据, 若添加:required 表示type有值时才获取数据
      },
      ...
    },
    onChange (id, option, formData) {}
  }
}
...
</script>
```
### 9、表单联动
#### 在表单配置中，大部分属性支持函数动态取值，属性从静态到动态只需将值换成函数，静态属性立刻动起来，无需引入新的属性、新的概念、新的配置即可实现复杂的表单联动，简洁就是王道
```javascript
/**
 * 新增、修改、详情弹窗配置
 */
const modalConfig = computed(() => ({
  // ... 省略其他配置
  // 表单配置 Object || ({ isAdd, isEdit, isView, detail }) => Object
  formConfig: ({ isAdd, isEdit, isView, detail }) => ({
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
    cols: 2, // 一行显示几列，默认 2 列
    // 表单字段
    fields: [ // 表单字段数组，可分组
      {
        label: formData => formData.type === 1 ? '商品名称' : '赠品名称', // String | formData => String
        fieldName: 'productName', // 字段名，暂不支持函数
        type: EControlType.eInput, // 控件类型，暂不支持函数，详情时组件会以纯文本渲染
        required: formData => formData.type === 1, // Boolean | (formData) => Boolean
        disabled: isEdit, // 是否禁用, Boolean | (formData) => Boolean
        hidden: formData => formData.type === 2, // 是否隐藏该字段，数据仍在表单中，Boolean | formData => Boolean
        none: formData => formData.type === 3, // 是否不需要该字段，数据不在表单中，Boolean | formData => Boolean
        rules: formData => [{}], // 通过函数，动态生成校验规则 Object | Array | (formData) => Object | Array
        extra: formData => 'xxx', // 字段额外说明， String | formData => String
        tooltip: formData => 'xxx', // 字段提示， String | formData => String
        defaultValue: 'xxx', // 默认值，暂不支持函数
        props: { // 控件属性配置，Object | formData => Object, 没有属性可以不配
          placeholder: formData => 'xxx', // 通过 formData 动态生成，String | formData => String
          onChange (val, formData) { // 所有控件都有 onChange 事件，都能拿到 formData，但是不同控件，入参个数及顺序有区别
            // 通过 formData 修改其他表单项的值，实现联动
            if (val.length > 5) {
              formData.xxx = 'xxx'
            }
          }
        }
      },
      // ...其他字段
    ]
  })
}))
```

### 10、规范
- 请保持项目目录/文件干净整洁、风格统一
- 编写组件或页面文件首行请注明该组件/页面的说明、用途、用法等
- 使用两个空格代替缩进符，避免不同系统下缩进宽度不一致
- 避免在模板中写复杂逻辑，应仅包含简单的属性绑定，避免写复杂的表达式或函数调用，保持模板清晰
- 给组件添加属性时，遵守一定的优先顺序，指令 > 动/静态属性 > 事件，
  如：`<input v-if="xxx" :maxlength="30" class="xxx" @input="onInputHandle" />`
- 组件中 style 标签尽可能添加 `scoped`，避免全局样式污染，如：`<style scoped>`
- 查询区域/表单区域使用日期/时间范围时，字段名设计统一使用'Begin'、'End'后缀，便于代码生成及使用默认值简化配置，如：xxxBegin, xxxEnd
- 相对独立的小模块，尽可能单独抽离成一个组件，避免一个文件代码过长过杂，同时也要避免过多的组件嵌套

#### 11、全配置参考案例：[demo-page](../views/demo/demo-page.vue)
既是案例也是文档，也可以访问 [CPage 组件使用文档](./README.cpage.md)