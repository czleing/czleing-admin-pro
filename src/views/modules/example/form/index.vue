<!-- 表单使用示例 -->
<template>
  <div class="">
    <div class="mb20 lh2">
      <div class="">表单可以使用 c-form 组件，通过传入配置自动渲染表单项，也可以使用 ant-design-vue 原生的 a-form，按传统方式编写表单</div>
      <div class="">c-form 内置确认取消按钮，可以隐藏，组件向外暴露了表单操作相关方法</div>
    </div>
    <h3>基础使用</h3>
    <div class="w50p border radius10 pa20 mt10">
      <c-form
        :show-cancel="false"
        :form-config="formConfig1"
        @submit-handle="onSubmitHandle"
      />
    </div>
    <h3 class="mt20">自由控制</h3>
    <div class="flex-x flex-wrap gap10 mt10">
      <a-button @click="validate">校验</a-button>
      <a-button @click="setData">设置数据</a-button>
      <a-button @click="setIsView">{{ isView ? '编辑模式' : '查看模式' }}</a-button>
      <a-button @click="getData1">获取转换前数据</a-button>
      <a-button @click="getData2">获取转换后数据</a-button>
      <a-button @click="submit">提交表单</a-button>
      <a-button @click="reset">重置表单</a-button>
    </div>
    <div class="w50p border radius10 pa20 mt10">
      <c-form
        ref="freeForm"
        :footer="null"
        :isView="isView"
        :form-config="formConfig2"
        :detail="initData"
        :onSubmitHandle="onSubmitHandle"
      />
    </div>
    <h3 class="mt20">弹窗表单</h3>
    <div class="flex-x gap10 mt10">
      <a-button @click="openModal">居中弹出</a-button>
      <a-button @click="openDrawer">右侧抽屉弹出</a-button>
    </div>
    <div class="mt50"></div>
    <CModal ref="modal1" title="弹窗+表单" :footer="null">
      <c-form
        :form-config="{ ...formConfig1, autoReset: true }"
        @submit-handle="onSubmitHandle"
      />
    </CModal>
    <CModal ref="modal2" title="抽屉+自由控制表单">
      <c-form
        ref="cForm2"
        :form-config="{ ...formConfig1, autoReset: true }"
        :footer="null"
      />
    </CModal>
    <h3 class="mt20">分组表单</h3>
    <div class="w60p border radius10 pa20 mt10">
      <c-form
        :show-cancel="false"
        :form-config="formConfigGroup"
        @submit-handle="onSubmitHandle"
      />
    </div>
    <h3 class="mt20">联动表单</h3>
    <div class="w60p border radius10 pa20 mt10">
      <c-form
        :show-cancel="false"
        :form-config="formConfig3"
        @submit-handle="onSubmitHandle"
      />
    </div>
    <h3 class="mt20">更多用法请查看：demo-page.vue</h3>
  </div>
</template>

<script setup>
import cComponent from '@/components/crud/components/c-component';
import cForm from '@/components/crud/components/c-form.vue';
import { Modal } from 'ant-design-vue';
import dayjs from 'dayjs';
import { EControlType } from '@/enum'
import IconSelect from '@/components/common/IconSelect/index.vue'
import ProvinceCityAreaSelect from '@/components/common/ProvinceCityAreaSelect/index.vue'

defineOptions({ name: 'FormExample' })

// 基础使用
const formConfig1 = {
  autoReset: false,
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
      defaultValue: '1',
      rules: { required: true, message: '请选择性别' },
      props: {
        dictType: 'sys_user_sex'
      }
    },
    {
      label: '年龄',
      fieldName: 'age',
      type: EControlType.eNumber,
      props: {
        min: 1,
        max: 150
      }
    },
    {
      label: '省市区',
      fieldName: 'area',
      type: EControlType.eCustom,
      defaultValue: '810011',
      props: {
        component: ProvinceCityAreaSelect,
        multiple: false,
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
            return list?.map(item => ({ id: item.postId, name: item.postName }))
          }
        }
      }
    },
  ]
}

// 自由控制
const formConfig2 = {
  cols: 1,
  autoReset: false,
  fields: [
    {
      label: '姓名',
      fieldName: 'name',
      required: true
    },
    {
      label: '图标',
      fieldName: 'icon',
      type: EControlType.eCustom,
      defaultValue: 'HeartFilled',
      props: {
        component: IconSelect
      }
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
      label: '出生日期',
      fieldName: 'birthday',
      type: EControlType.eDate,
    },
    {
      label: '日期范围',
      fieldName: 'dateRange',
      type: EControlType.eDateRange,
    }
  ]
}
const initData = { birthday: '2020-02-02' } // 表单默认填充数据
const freeForm = useTemplateRef('freeForm')
function validate () {
  freeForm.value.validate()
}
function setData () {
  freeForm.value.setFormData({
    name: '张三',
    sex: '1',
    dateRange: [dayjs('2026-01-01'), dayjs('2026-12-30')]
  })
}
const isView = ref(false)
function setIsView () {
  isView.value = !isView.value
}
async function getData1 () {
  const data = await freeForm.value.validate()
  Modal.success({
    title: '获取到的转换前的数据',
    content: JSON.stringify(data),
  })
}
async function getData2 () {
  const data = await freeForm.value.getSubmitData()
  Modal.success({
    title: '获取到的转换后的数据',
    content: JSON.stringify(data),
  })
}
function onSubmitHandle (submitData) {
  Modal.success({
    title: '提交的数据',
    content: JSON.stringify(submitData),
  })
}
function submit () {
  freeForm.value.submit()
}
function reset () {
  freeForm.value.reset()
}

// 弹出表单
const modal1 = useTemplateRef('modal1')
function openModal () {
  modal1.value.open({
    mode: 'modal',
    width: 600,
  })
}

const modal2 = useTemplateRef('modal2')
const form2 = useTemplateRef('cForm2')
function openDrawer () {
  modal2.value.open({
    mode: 'drawer',
    width: 600,
    onConfirm: async (close) => {
      const submitData = await form2.value.getSubmitData()
      Modal.success({
        title: '提交的数据',
        content: JSON.stringify(submitData),
        onOk: () => {
          form2.value.reset()
          close()
        }
      })
    },
    onCancel: () => {
      form2.value.reset()
    }
  })
}

// 分组
const formConfigGroup = {
  cols: 2,
  labelCol: { flex: '120px' },
  autoReset: false,
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
      title: '学历信息',
      subTitle: '第一个分组',
      fields: [
        {
          label: '学历',
          fieldName: 'level',
        },
        {
          label: '专业',
          fieldName: 'major',
        },
        {
          label: '毕业学校',
          fieldName: 'school',
        },
      ]
    },
    {
      title: '家庭信息',
      subTitle: '第二个分组',
      fields: [
        {
          label: '详细地址',
          fieldName: 'address',
        },
        {
          label: '家庭联系电话',
          fieldName: 'homeTel',
        },
      ]
    },
  ]
}

// 联动
const formConfig3 = computed(() => ({
  labelCol: { flex: '120px' },
  autoReset: false,
  fields: [
    {
      label: '菜单类型',
      fieldName: 'menuType',
      type: EControlType.eRadio,
      required: true,
      singleLine: true,
      defaultValue: EMenuType.eDir,
      props: {
        options: EMenuType._list,
        optionType: 'button', // option 类型， default | button
        buttonStyle: 'solid', // optionType 为 button 时，button 的风格样式, outline | solid
        onChange (val, option, formData) {
          if (formData.menuType == EMenuType.eDir) {
            formData.path = formData.path?.replace('http://', '')
            formData.isFrame = false
          }
        }
      }
    },
    {
      label: formData => EMenuType._of(formData.menuType) + '名称',
      fieldName: 'menuName',
      type: EControlType.eInput,
      required: true,
      props: {
      }
    },
    {
      label: formData => EMenuType._of(formData.menuType) + '图标',
      none: formData => formData.menuType === EMenuType.eBtn,
      fieldName: 'icon',
      type: EControlType.eCustom,
      props: {
        component: IconSelect
      }
    },
    {
      label: '是否外链',
      fieldName: 'isFrame',
      type: EControlType.eSwitch,
      singleLine: true,
      tooltip: '是外链则路由地址需要以`http(s)://`开头',
      defaultValue: false,
      none: formData => formData.menuType !== EMenuType.eMenu,
      props: {
        onChange (val, formData) {
          formData.path = formData.path ?? ''
          if (val) {
            if (!formData.path.includes('http')) {
              formData.path = 'http://' + formData.path
            }
          } else {
            formData.path = formData.path.replace('http://', '')
          }
        }
      }
    },
    {
      label: f => f.isFrame && f.menuType === EMenuType.eMenu ? '外链地址' : '路由地址',
      fieldName: 'path',
      none: formData => formData.menuType === EMenuType.eBtn,
      type: EControlType.eInput,
      tooltip: '访问的路由地址，如：`user`，如外网地址需内链访问则以`http(s)://`开头',
      required: true,
      props: {
      }
    },
  ]
}))
</script>

<style lang="scss" scoped>
</style>
