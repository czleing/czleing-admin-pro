<!-- 代码生成-预览 -->
<template>
  <CModal ref="cModal" title="代码生成-预览" mode="drawer" width="1200" :body-style="{padding: '0 15px 10px 15px'}" :mask-closable="false" :show-confirm="false">
    <a-tabs v-if="!isEmpty" v-model:activeKey="activeKey">
      <a-tab-pane
        v-for="(value, key) in detail"
        :tab="key.match(/.*\/(.*)\.vm$/)[1]"
        :key="key"
      >
        <div class="scroll-container">
          <a-button class="copy" v-copy="value">复制</a-button>
          <highlightjs :language="key.match(/.*\/(.*\.)?(.*)\.vm$/)[2]" :code="value" />
        </div>
      </a-tab-pane>
    </a-tabs>
    <a-empty v-else class="mt30" description="暂无预览，请先编辑，填写相关设置项" />
  </CModal>
</template>

<script>
// import 'highlight.js/lib/common'
import hljsVuePlugin from '@highlightjs/vue-plugin'
import 'highlight.js/styles/stackoverflow-light.css'
import hljs from 'highlight.js/lib/core'
import js from 'highlight.js/lib/languages/javascript'
import java from 'highlight.js/lib/languages/java'
import xml from 'highlight.js/lib/languages/xml'

hljs.registerLanguage('java', java)
hljs.registerLanguage('javascript', js)
hljs.registerLanguage('vue', xml)
hljs.registerLanguage('xml', xml)

export default {
  components: {
    highlightjs: hljsVuePlugin.component
  }
}
</script>

<script setup>
import axios from '@/api/index.js'

const props = defineProps({
  datasource: String
})

const _this = getCurrentInstance().proxy
const cModal = ref()
const activeKey = ref()
const record = ref({}) // 从列表中带过来的列表项 item
const detail = ref({}) // 详情-导入表格的详细信息
const isEmpty = computed(() => Object.keys(detail.value).length === 0)

onMounted(() => {
})

async function getDetail () {
  const result = await axios.post('/tool/gen/preview/' + record.value?.tableId, null, {
    headers: { datasource: props.datasource }
  })
  detail.value = result
  activeKey.value = Object.keys(result)[0]
}

const emits = defineEmits(['completed'])

function open (options) {
  record.value = options
  cModal.value.open()
  getDetail()
}

function close () {
  cModal.value.close()
}

defineExpose({
  open,
  close
})
</script>

<style lang="scss" scoped>
.scroll-container {
  height: calc(100vh - 164px);
  overflow: auto;
  position: relative;
  .copy {
    position: fixed;
    top: 130px;
    right: 30px;
  }
}
:deep(.ant-tabs-nav) {
  margin-bottom: 0 !important;
}
</style>
