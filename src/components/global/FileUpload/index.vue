<!--
  文件上传组件
  用法：<file-upload v-model:value="form.files" valueType="Array" accept=".zip" :file-size="20" :max-count="1" />
  form.files 有两种类型
  valueType === 'Array', 则 form.files 为文件数组
  valueType === 'String', 则 form.files 为文件地址逗号分隔字符串
-->
<template>
  <div class="file-upload">
    <a-upload
      v-model:file-list="fileList"
      :action="uploadUrl"
      :headers="headers"
      :max-count="maxCount"
      :accept="accept"
      :disabled="disabled"
      :before-upload="beforeUploadHandle"
      v-bind="{ ...$attrs, onChange: undefined }"
      @change="onChangeHandle"
    >
      <a-button v-if="!disabled && fileList.length < maxCount">
        <UploadOutlined />
        {{ btnText }}
      </a-button>
    </a-upload>
  </div>
</template>

<script setup>
import { UploadOutlined} from '@ant-design/icons-vue'
import { useAuthStore } from '@/stores/auth-store.js'
import { byteFormat, getFullUrl } from '@/utils/index.js'
import { message, Upload } from 'ant-design-vue'
// import axios from '@/api/index.js'

/**
 * 其他属性：
 * accept:  'image/*,video/*,audio/*,.pdf,.doc,.docx' --- 限制文件类型
 * data, { prefix: 'xxx' } --- 额外参数，prefix：文件服务根目录下的子文件夹名，默认 temp
 * disabled
 * multiple: {boolean} 是否可一次选择多个文件，默认 false
 * name: {string} 定义文件上传字段名，默认 file
 */
const props = defineProps({
  // 文件对象数组或文件地址逗号分隔字符串，[file1, file2] 或 'file1Url,file2Url'
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
    default: 1024 * 100
  },
  accept: {
    type: String,
    default: 'image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.zip,.rar'
  },
  // 上传按钮文字
  btnText: {
    type: String,
    default: '上传文件'
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
    message.warning(`文件大小不能超过${maxFileSize.value}`)
    return Upload.LIST_IGNORE
  }
}

/**
 * 上传中、完成、失败的回调
 * { file, fileList, event }
 * file.status: error|uploading|done|removed
 */
function onChangeHandle ({ file, fileList: files, event }) {
  // console.log('文件上传状态：', file.status)
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
.file-upload {
  display: inline-block;
}
</style>
