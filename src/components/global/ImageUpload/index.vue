<!--
  图片上传组件
  用法：<image-upload v-model:value="form.images" :file-size="1024" :max-count="2" />
-->
<template>
  <div class="image-upload">
    <a-upload
      v-model:file-list="fileList"
      list-type="picture-card"
      :action="uploadUrl"
      :headers="headers"
      :max-count="maxCount"
      :accept="accept"
      :disabled="disabled"
      :before-upload="beforeUploadHandle"
      v-bind="{ ...$attrs, onChange: undefined }"
      @change="onChangeHandle"
      @preview="previewHandle"
    >
      <div v-if="!disabled && fileList.length < maxCount">
        <PlusOutlined class="font20" />
        <div class="mt8">{{ btnText }}</div>
      </div>
    </a-upload>
    <CModal ref="previewModal">
      <img :src="previewUrl" style="max-width: 100%;display:block;margin:0 auto;">
      <template #footer>
        <div class="tr">
          <a-button type="default" @click="previewModal.close">关闭</a-button>
        </div>
      </template>
    </CModal>
  </div>
</template>

<script setup>
import { PlusOutlined } from '@ant-design/icons-vue'
import { useAuthStore } from '@/stores/auth-store.js'
import { byteFormat, getFullUrl } from '@/utils/index.js'
import { message, Upload } from 'ant-design-vue'

/**
 * 其他属性：
 * accept:  'image/png,.jpg,image/*,.gif,.GIF' --- 限制文件类型
 * data, { prefix: 'xxx' } --- 额外参数，prefix：文件服务根目录下的子文件夹名，不带 '/'，默认 temp
 * disabled
 * multiple: {boolean} 是否可一次选择多个文件，默认 false
 * name: {string} 定义文件上传字段名，默认 file
 */
const props = defineProps({
  // 文件对象数组或文件地址逗号分隔字符串，[] 或 '', 默认 ''
  value: [Array, String],
  /** value 数据类型, Array | String */
  valueType: { type: String, default: 'String' },
  // 最大上传文件数
  maxCount: {
    type: Number,
    default: 10
  },
  // 文件大小限制(KB)
  fileSize: {
    type: Number,
    default: 1024 * 10
  },
  accept: {
    type: String,
    default: 'image/*'
  },
  // 上传按钮文字
  btnText: {
    type: String,
    default: '上传图片'
  },
  // 是否禁用，禁用时只能查看
  disabled: {
    type: Boolean,
    default: false
  }
})
const authStore = useAuthStore()
// 文件上传地址
const uploadUrl = import.meta.env.VITE_APP_BASE_API + '/oss/upload'
const headers = { Authorization: 'Bearer ' + authStore.token }

// 文件列表
const fileList = ref([])
// 文件大小限制格式化字符串
const maxFileSize = computed(() => byteFormat(props.fileSize << 10))

watch(
  () => props.value,  
  (newVal) => {
    setValue(newVal)
  },
  { immediate: true, deep: true }
)

async function setValue (value) {
  await nextTick()
  if (props.valueType === 'Array') {
    fileList.value = value ?? []
  } else if (props.valueType === 'String') {
    if (!value) {
      fileList.value = []
      return
    }
    let i = 0
    fileList.value = value?.split(',')?.filter(Boolean)?.map(path => {
      i++
      return {
        uid: Date.now() + i,
        name: path.match(/.*\/([^/]+\.\w+)/)?.[1] || path,
        status: 'done',
        url: getFullUrl(path),
        path
      }
    }) ?? []
  } else {
    console.error('FileUpload 属性 valueType 必须是["Array", "String"]之一')
  }
}

/**
 * 上传文件前的钩子，返回 false 可阻止上传
 * @param {Object} file 要上传的文件
 * @param {Array} files 
 */
function beforeUploadHandle (file, files) {
  if (file.size >> 10 > props.fileSize) {
    message.warning(`图片大小不能超过${maxFileSize.value}`)
    return Upload.LIST_IGNORE
  }
}

/**
 * 上传中、完成、失败的回调
 * { file, fileList, event }
 * file.status: error|uploading|done|removed
 * file.response: 上传服务器响应内容，从此处获取服务器地址，
 */
function onChangeHandle ({ file, fileList: files, event }) {
  if (file.status === 'done' && file.response) {
    const path = file.response?.data?.path
    file.path = path
    file.url = getFullUrl(path)
    delete file.response
    if (files.every(f => f.url)) {
      emitChange()
    }
  } else if (file.status === 'removed') {
    // axios.post('/oss/delete', { path: file.path })
    emitChange()
  }
}

// 预览组件
const previewModal = ref()
// 预览图片地址
const previewUrl = ref()
// 预览
function previewHandle (file) {
  previewUrl.value = file.url
  previewModal.value.open({
    title: `${file.name} ${ file.size > 0 ? ('( ' + byteFormat(file.size) + ' )') : ''}`,
    width: '80%'
  })
}

const emit = defineEmits(['update:value', 'update:fileList'])
/** 提交改变 */
function emitChange () {
  if (props.valueType === 'Array') {
    emit('update:value', fileList.value?.map(file => ({
      name: file.name,
      path: file.path,
      type: file.type,
      size: file.size,
      uid: file.uid,
      url: file.url,
      status: file.status
    })))
  } else {
    emit('update:value', fileList.value.map(file => file.path).join(','))
  }
  emit('update:fileList', fileList.value)
}
</script>

<style lang="less" scoped>
.image-upload {
  display: inline-block;
  // :deep(.ant-upload-list-item) { // 注释原因：上传图片后，鼠标移入的层显示错位
  //   padding: 0 !important;
  // }
}
</style>
