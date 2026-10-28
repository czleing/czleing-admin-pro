<!-- WangEditor 富文本编辑器 -->
<!-- https://www.wangeditor.com/v5/getting-started.html -->
<!-- 需要安装依赖： @wangeditor/editor, @wangeditor/editor-for-vue@next -->
<template>
  <div class="editor-container">
    <Toolbar
      class="editor-container__toolbar"
      :editor="editor"
      :defaultConfig="toolbarConfig"
      :mode="mode"
      :disabled="disabled"
    />
    <Editor
      class="editor-container__editor"
      v-model="editorContent"
      :defaultConfig="editorConfig"
      :mode="mode"
      :disabled="disabled"
      @onCreated="onCreated"
      @onChange="onChange"
    />
  </div>
</template>

<script setup>
import '@wangeditor/editor/dist/css/style.css'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import { i18nChangeLanguage } from '@wangeditor/editor'
import { useAuthStore } from '@/stores/auth-store'
import { useSettingStore } from '@/stores/setting-store'

const props = defineProps({
  value: String,
  disabled: Boolean,
  // 高度，'500px' 或 '50vh'
  height: { type: String, default: '500px' }
})
const mode = 'default'
const editor = shallowRef()
const editorContent = ref('')
const authStore = useAuthStore()
const settingStore = useSettingStore()
const token = authStore.token
// 工具栏配置，会覆盖默认配置，只控制顺序和是否显示
const toolbarConfig = {
  excludeKeys: ['group-video', 'codeBlock', 'todo', 'emotion', '|']
}
// 编辑器配置，会覆盖默认配置
const editorConfig = {
  // 进一步控制工具栏里面的菜单
  MENU_CONF: {
    // 上传图片配置
    uploadImage: {
      server: import.meta.env.VUE_APP_BASE_API + '/oss/upload',
      headers: {
        Authorization: "Bearer " + token,
      },
      fieldName: 'file',
      // 由于后端返回的结构与默认的不一致，需要自定义插入图片
      customInsert (res, insertFn) {
        insertFn(import.meta.env.VUE_APP_RESOURCE_API + res.data.path, '图片')
      }
    },
    // 行高配置
    lineHeight: {
      lineHeightList: ['1', '1.3', '1.4', '1.5', '1.6', '1.7', '1.8', '1.9', '2.0', '2.2', '2.4', '2.5', '2.8', '3', '3.5', '4']
    }
  },
  placeholder: '请输入内容...'
}

watch(
  () => props.value,
  (val) => {
    editorContent.value = val
  },
  { immediate: true }
)

watch(
  () => settingStore.locale,
  (val) => {
    i18nChangeLanguage(val === 'en' ? 'en' : 'zh-cn')
  },
  { immediate: true }
)

onUnmounted(() => {
  if (!editor.value) return
  editor.value.destroy() // 组件销毁时，及时销毁编辑器
})

function onCreated (_editor) {
  editor.value = Object.seal(_editor) // 一定要用 Object.seal() ，否则会报错
}
async function onChange (_editor) {
  await nextTick()
  emits('update:value', editorContent.value)
  emits('change', editorContent.value)
}
const emits = defineEmits(['update:value', 'change'])

</script>

<style scoped lang="less">
.editor-container {
  border: var(--ant-lineWidth) solid var(--ant-colorBorder);
  border-radius: var(--ant-borderRadius);
  z-index: 1;
  // overflow: hidden;
  &__toolbar {
    border-bottom: var(--ant-lineWidth) solid var(--ant-colorBorder);
  }
  &__editor {
    height: v-bind(height) !important;
    overflow-y: hidden;
  }
}
</style>
<style>
html[theme='dark'] {
  --w-e-textarea-bg-color: var(--ant-colorBgContainer, #1d1d1d1d);
  --w-e-textarea-color: #ffffff;
  --w-e-textarea-border-color: #f0f0f0;
  --w-e-textarea-slight-border-color: #3b3b3b;
  --w-e-textarea-slight-color: #424242;
  --w-e-textarea-slight-bg-color: #1d1c1c;
  --w-e-textarea-selected-border-color: #1f252c; /* 选中的元素，如选中了分割线 */
  --w-e-textarea-handler-bg-color: #152e4e; /* 工具，如图片拖拽按钮 */

  --w-e-toolbar-color: #cccccc;
  --w-e-toolbar-bg-color: #20202020;
  --w-e-toolbar-active-color: #ffffff;
  --w-e-toolbar-active-bg-color: #30303060;
  --w-e-toolbar-disabled-color: #5e5e5e;
  --w-e-toolbar-border-color: #303030;

  --w-e-modal-button-bg-color: #414141;
  --w-e-modal-button-border-color: #555;
}
.editor-container .w-e-bar {
	border-radius: 10px 10px 0 0;
}
.editor-container .w-e-text-container {
	border-radius: 0 0 10px 10px;
}
.editor-container .w-e-scroll {
	scrollbar-color: rgba(155, 155, 155, .3) transparent;
}
.editor-container .w-e-modal, .editor-container .w-e-bar-item-menus-container, .editor-container .w-e-drop-panel, .editor-container .w-e-select-list {
	backdrop-filter: blur(10px);
}
.editor-container .w-e-menu-tooltip-v5:before {
	background-color: var(--w-e-toolbar-active-color);
	color: var(--w-e-toolbar-border-color);
}
html[theme='dark'] .w-e-full-screen-container {
	background-color: rgba(30, 30, 40, 1);
}
.editor-container .w-e-hover-bar { background-color: #242424; }
.editor-container .w-e-select-list { backdrop-filter: blur(20px); }
/* 表格默认样式 */
/* .WangPreview table { border-collapse: collapse; }
.WangPreview th { background-color: rgba(155, 155, 155, .1); }
.WangPreview th, .WangPreview td { border: var(--ant-lineWidth) solid rgba(155, 155, 155, .2); padding: 2px 5px; }
.WangPreview img { max-width: 100% !important; } */
</style>
