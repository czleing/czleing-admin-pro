<!-- 表单示例·分组表单：通过分组配置按区块展示表单项 -->
<template>
  <c-form :show-cancel="false" :form-config="formConfig" @submit-handle="handleSubmit" />
</template>

<script setup lang="ts">
import cForm from '@/components/crud/components/c-form.vue'
import { EControlType } from '@/enum'
import type { CrudRecord, FormConfig } from '@/components/crud/types'

defineOptions({ name: 'ExampleGroupForm' })

const emit = defineEmits<{
  (e: 'submit', submitData: CrudRecord): void
}>()

const formConfig: FormConfig = {
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
          fieldName: 'level'
        },
        {
          label: '专业',
          fieldName: 'major'
        },
        {
          label: '毕业学校',
          fieldName: 'school'
        }
      ]
    },
    {
      title: '家庭信息',
      subTitle: '第二个分组',
      fields: [
        {
          label: '详细地址',
          fieldName: 'address'
        },
        {
          label: '家庭联系电话',
          fieldName: 'homeTel'
        }
      ]
    }
  ]
}

/** 提交表单，交由父组件统一提示 */
function handleSubmit(submitData: CrudRecord): void {
  emit('submit', submitData)
}
</script>
