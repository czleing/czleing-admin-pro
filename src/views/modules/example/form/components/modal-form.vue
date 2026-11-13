<!-- 表单示例·弹窗表单：配合 CModal 组件实现弹窗、抽屉表单 -->
<template>
  <div>
    <div class="lh2">
      <div>配合 CModal 组件，实现弹窗表单功能</div>
    </div>
    <div class="flex-x gap10 mt10">
      <a-button @click="handleOpenModal">居中弹出</a-button>
      <a-button @click="handleOpenDrawer">右侧抽屉弹出</a-button>
    </div>
    <div class="mt20" />
    <CModal ref="modal" title="弹窗+表单" :footer="null">
      <c-form :form-config="{ ...formConfig, autoReset: true }" @submit-handle="handleSubmit" />
    </CModal>
    <CModal ref="drawer" title="抽屉+自由控制表单">
      <c-form ref="drawerForm" :form-config="{ ...formConfig, autoReset: true }" :footer="null" />
    </CModal>
  </div>
</template>

<script setup lang="ts">
import cForm from '@/components/crud/components/c-form.vue'
import ProvinceCityAreaSelect from '@/components/common/ProvinceCityAreaSelect/index.vue'
import { Modal } from 'ant-design-vue'
import { EControlType } from '@/enum'
import type { CrudFormExpose, CrudModalExpose, CrudRecord, FormConfig } from '@/components/crud/types'

defineOptions({ name: 'ExampleModalForm' })

/** 岗位接口返回项 */
interface PostItem {
  postId: number
  postName: string
}

const emit = defineEmits<{
  (e: 'submit', submitData: CrudRecord): void
}>()

const formConfig: FormConfig = {
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

const modal = useTemplateRef<CrudModalExpose>('modal')
const drawer = useTemplateRef<CrudModalExpose>('drawer')
const drawerForm = useTemplateRef<CrudFormExpose>('drawerForm')

/** 提交表单，交由父组件统一提示 */
function handleSubmit(submitData: CrudRecord): void {
  emit('submit', submitData)
}

/** 居中弹窗打开表单 */
function handleOpenModal(): void {
  modal.value?.open({
    mode: 'modal',
    width: 600
  })
}

/** 右侧抽屉打开表单 */
function handleOpenDrawer(): void {
  drawer.value?.open({
    mode: 'drawer',
    width: 600,
    onConfirm: async (close) => {
      const submitData = await drawerForm.value?.getSubmitData()
      Modal.success({
        title: '提交的数据',
        content: JSON.stringify(submitData),
        onOk: () => {
          drawerForm.value?.reset()
          close()
        }
      })
    },
    onCancel: () => {
      drawerForm.value?.reset()
    }
  })
}
</script>
