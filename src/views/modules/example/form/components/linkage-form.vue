<!-- 表单示例·联动表单：通过字段动态属性实现表单项联动 -->
<template>
  <c-form :show-cancel="false" :form-config="formConfig" @submit-handle="handleSubmit" />
</template>

<script setup lang="ts">
import cForm from '@/components/crud/components/c-form.vue'
import IconSelect from '@/components/common/IconSelect/index.vue'
import { EControlType, EMenuType } from '@/enum'
import type { CrudRecord, FormConfig } from '@/components/crud/types'

defineOptions({ name: 'ExampleLinkageForm' })

const emit = defineEmits<{
  (e: 'submit', submitData: CrudRecord): void
}>()

const formConfig = computed<FormConfig>(() => ({
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
            formData.path = (formData.path as string | undefined)?.replace('http://', '')
            formData.isFrame = false
          }
        }
      }
    },
    {
      label: formData => EMenuType._of(formData.menuType as string) + '名称',
      fieldName: 'menuName',
      type: EControlType.eInput,
      required: true
    },
    {
      label: formData => EMenuType._of(formData.menuType as string) + '图标',
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
          let path = String(formData.path ?? '')
          if (val) {
            if (!path.includes('http')) {
              path = 'http://' + path
            }
          } else {
            path = path.replace('http://', '')
          }
          formData.path = path
        }
      }
    },
    {
      label: f => f.isFrame && f.menuType === EMenuType.eMenu ? '外链地址' : '路由地址',
      fieldName: 'path',
      none: formData => formData.menuType === EMenuType.eBtn,
      type: EControlType.eInput,
      tooltip: '访问的路由地址，如：`user`，如外网地址需内链访问则以`http(s)://`开头',
      required: true
    }
  ]
}))

/** 提交表单，交由父组件统一提示 */
function handleSubmit(submitData: CrudRecord): void {
  emit('submit', submitData)
}
</script>
