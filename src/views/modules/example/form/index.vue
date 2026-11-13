<!-- 表单使用示例 -->
<template>
  <div class="w60p">
    <div class="mb20 lh2">
      <div>表单可以使用 c-form 组件，通过传入配置自动渲染表单项，也可以使用 ant-design-vue 原生的 a-form，按传统方式编写表单</div>
      <div>c-form 内置确认取消按钮，可以隐藏，组件向外暴露了表单操作相关方法</div>
    </div>

    <h3>基础使用</h3>
    <CodePreview :code="codeBase">
      <BaseForm @submit="handleSubmit" />
    </CodePreview>

    <h3 class="mt20">自由控制</h3>
    <CodePreview :code="codeFree">
      <FreeForm @submit="handleSubmit" />
    </CodePreview>

    <h3 class="mt20">弹窗表单</h3>
    <CodePreview :code="codeModal">
      <ModalForm @submit="handleSubmit" />
    </CodePreview>

    <h3 class="mt20">分组表单</h3>
    <CodePreview :code="codeGroup">
      <GroupForm @submit="handleSubmit" />
    </CodePreview>

    <h3 class="mt20">联动表单</h3>
    <CodePreview :code="codeLinkage">
      <LinkageForm @submit="handleSubmit" />
    </CodePreview>

    <h3 class="mt20">更多用法请查看：demo-page.vue</h3>
  </div>
</template>

<script setup lang="ts">
import { Modal } from 'ant-design-vue'
import type { CrudRecord } from '@/components/crud/types'
import BaseForm from './components/base-form.vue'
import CodePreview from './components/code-preview.vue'
import FreeForm from './components/free-form.vue'
import GroupForm from './components/group-form.vue'
import LinkageForm from './components/linkage-form.vue'
import ModalForm from './components/modal-form.vue'
import codeBase from './components/base-form.vue?raw'
import codeFree from './components/free-form.vue?raw'
import codeModal from './components/modal-form.vue?raw'
import codeGroup from './components/group-form.vue?raw'
import codeLinkage from './components/linkage-form.vue?raw'

defineOptions({ name: 'FormExample' })

/** 各示例表单提交后的统一提示 */
function handleSubmit(submitData: CrudRecord): void {
  Modal.success({
    title: '提交的数据',
    content: JSON.stringify(submitData)
  })
}
</script>
