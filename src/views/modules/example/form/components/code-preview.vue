<!-- 示例预览：卡片内展示抽离的示例组件，底部工具栏提供源码展开/收起（图标按钮） -->
<template>
  <div class="code-preview">
    <div class="code-preview__demo">
      <slot />
    </div>
    <div v-show="expanded" class="code-preview__code scroll">
      <highlightjs language="vue" :code="code" />
    </div>
    <div class="code-preview__toolbar">
      <a-tooltip :title="expanded ? '收起源码' : '展开源码'">
        <a-button type="text" size="small" class="code-preview__action" @click="handleToggle">
          <CodeOutlined />
          <DownOutlined class="code-preview__caret" :class="{ 'is-expanded': expanded }" />
        </a-button>
      </a-tooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CodeOutlined, DownOutlined } from '@ant-design/icons-vue'

interface Props {
  /** 要展示的源码字符串，通过 `import code from './xxx.vue?raw'` 获取 */
  code: string
  /** 是否默认展开源码，默认收起 */
  defaultExpand?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  defaultExpand: false
})

const expanded = ref(props.defaultExpand)

/** 展开/收起源码 */
function handleToggle(): void {
  expanded.value = !expanded.value
}
</script>

<script lang="ts">
import hljsVuePlugin from '@highlightjs/vue-plugin'
import 'highlight.js/styles/stackoverflow-light.css'
import hljs from 'highlight.js/lib/core'
import js from 'highlight.js/lib/languages/javascript'
import xml from 'highlight.js/lib/languages/xml'

hljs.registerLanguage('vue', xml)
hljs.registerLanguage('javascript', js)

export default {
  components: {
    highlightjs: hljsVuePlugin.component
  }
}
</script>

<style lang="less" scoped>
.code-preview {
  overflow: hidden;
  border: 0.5px solid var(--ant-colorBorderSecondary);
  border-radius: 10px;

  &__demo {
    padding: 20px;
  }

  &__code {
    max-height: 520px;
    padding: 10px 14px;
    border-top: 0.5px solid var(--ant-colorBorderSecondary);
  }

  &__toolbar {
    display: flex;
    justify-content: flex-end;
    padding: 4px 8px;
    background: var(--ant-colorFillQuaternary);
    border-top: 0.5px solid var(--ant-colorBorderSecondary);
  }

  &__action {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    color: var(--ant-colorTextSecondary);
  }

  &__caret {
    font-size: 10px;
    transition: transform 0.2s;

    &.is-expanded {
      transform: rotate(180deg);
    }
  }
}
</style>
