<!-- 表单示例·自由控制：通过表单组件暴露的方法操作表单 -->
<template>
  <div>
    <div class="lh2">
      <div>表单提交时会自动对日期、日期范围的数据进行格式化，转为时间戳格式</div>
    </div>
    <div class="flex-x flex-wrap gap10 mt10 border-bottom pb10">
      <a-button @click="handleValidate">校验</a-button>
      <a-button @click="handleSetData">设置数据</a-button>
      <a-button @click="handleToggleView">{{ isView ? '编辑模式' : '查看模式' }}</a-button>
      <a-button @click="handleGetData">获取转换前数据</a-button>
      <a-button @click="handleGetSubmitData">获取转换后数据</a-button>
      <a-button @click="handleSubmitForm">提交表单</a-button>
      <a-button @click="handleReset">重置表单</a-button>
    </div>
    <c-form
      ref="freeForm"
      :footer="null"
      :is-view="isView"
      :form-config="formConfig"
      :detail="initData"
      :onSubmitHandle="handleSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import cForm from '@/components/crud/components/c-form.vue'
import IconSelect from '@/components/common/IconSelect/index.vue'
import dayjs from 'dayjs'
import { Modal } from 'ant-design-vue'
import { EControlType } from '@/enum'
import type { CrudFormExpose, CrudRecord, FormConfig } from '@/components/crud/types'

defineOptions({ name: 'ExampleFreeForm' })

const emit = defineEmits<{
  (e: 'submit', submitData: CrudRecord): void
}>()

const formConfig: FormConfig = {
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
      type: EControlType.eDate
    },
    {
      label: '日期范围',
      fieldName: 'dateRange',
      type: EControlType.eDateRange
    }
  ]
}
const initData = { birthday: '2020-02-02' } // 表单默认填充数据
const freeForm = useTemplateRef<CrudFormExpose>('freeForm')
const isView = ref(false)

/** 校验表单 */
function handleValidate(): void {
  freeForm.value?.validate()
}

/** 设置表单数据 */
function handleSetData(): void {
  freeForm.value?.setFormData({
    name: '张三',
    sex: '1',
    dateRange: [dayjs('2026-01-01'), dayjs('2026-12-30')]
  })
}

/** 切换编辑/查看模式 */
function handleToggleView(): void {
  isView.value = !isView.value
}

/** 获取转换前的数据 */
async function handleGetData(): Promise<void> {
  const data = await freeForm.value?.validate()
  Modal.success({
    title: '获取到的转换前的数据',
    content: JSON.stringify(data)
  })
}

/** 获取转换后的数据 */
async function handleGetSubmitData(): Promise<void> {
  const data = await freeForm.value?.getSubmitData()
  Modal.success({
    title: '获取到的转换后的数据',
    content: JSON.stringify(data)
  })
}

/** 提交表单，交由父组件统一提示 */
function handleSubmit(submitData: CrudRecord): void {
  emit('submit', submitData)
}

/** 提交表单 */
function handleSubmitForm(): void {
  freeForm.value?.submit()
}

/** 重置表单 */
function handleReset(): void {
  freeForm.value?.reset()
}
</script>
