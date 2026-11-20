<!-- 表单示例·基础使用：通过 formConfig 配置自动渲染表单 -->
<template>
  <c-form :show-cancel="false" :form-config="formConfig" @submit-handle="handleSubmit" />
</template>

<script setup lang="ts">
import ProvinceCityAreaSelect from '@/components/common/ProvinceCityAreaSelect/index.vue'
import cForm from '@/components/crud/components/c-form.vue'
import type { CrudRecord, FormConfig } from '@/components/crud/types'
import { EControlType } from '@/enum'
import { Modal } from 'ant-design-vue'

/** 岗位接口返回项 */
interface PostItem {
  postId: number
  postName: string
}

const formConfig: FormConfig = {
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
        multiple: false
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
            return (list as PostItem[] | undefined)?.map(item => ({ id: item.postId, name: item.postName })) ?? []
          }
        }
      }
    }
  ]
}

/** 提交表单 */
function handleSubmit(submitData: CrudRecord): void {
  Modal.success({
    title: '提交的数据',
    content: JSON.stringify(submitData)
  })
}
</script>
