<!-- 导入按钮 -->
<template>
  <div class="c-import">
    <slot>
      <a-button v-if="showBtn" type="dashed" :icon="h(ImportOutlined)" @click="onImportHandle">{{ btnText || $t('crud.import') }}</a-button>
    </slot>
    <CModal ref="cModal" width="450" :confirm-disabled="uploadDisabled" @close="beforeCloseHandle">
      <div class="mb">
        {{ $t('crud.clickToDownload') }}
        <a href="javascript:;" @click="downloadTemplate">{{ $t('crud.importTemplate') }}</a>
      </div>
      <a-upload-dragger
        accept=".xls,.xlsx"
        :max-count="1"
        :file-list="fileList"
        :before-upload="beforeUpload"
        @remove="handleRemove"
      >
        <div>
          <p class="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p class="ant-upload-text">{{ $t('crud.dragFileToUpload') }}</p>
          <p class="ant-upload-hint">
            {{ $t('crud.pleaseUploadExcel') }}
          </p>
        </div>
      </a-upload-dragger>
      <div v-if="showReplace" class="mt">
        {{ $t('crud.sameDataIsReplace') }}：<a-switch v-model:checked="isReplace" />
      </div>
    </CModal>
  </div>
</template>

<script setup lang="ts">
import { ImportOutlined, InboxOutlined } from '@ant-design/icons-vue'
import type { UploadFile } from 'ant-design-vue'
import { h } from 'vue'
import axiosService from '@/api/index'
import { loadingRequest } from '@/utils/index'
import type { CrudImportExpose, CrudModalExpose, ImportOpenOptions } from '../types'

const props = withDefaults(
  defineProps<{
    /** 上传地址 */
    url?: string
    /** 模板下载地址 */
    templateUrl?: string
    /** 弹出层标题 */
    title?: string
    /** 是否显示覆盖更新控制按钮 */
    showReplace?: boolean
    /** 是否显示导入按钮 */
    showBtn?: boolean
    /** 导入按钮文字 */
    btnText?: string
  }>(),
  {
    showReplace: true,
    showBtn: true
  }
)

const { t } = useI18n()
const cModal = ref<CrudModalExpose>()
const isReplace = ref(false)
const fileList = ref<UploadFile[]>([])
/** 原始文件对象，用于 FormData 上传（UploadFile 不是 File 的子类） */
const rawFile = ref<File | null>(null)
const uploading = ref(false)
const uploadDisabled = computed(() => fileList.value.length === 0 || uploading.value)

const currUrl = ref<string | undefined>(props.url)
const currTemplateUrl = ref<string | undefined>(props.templateUrl)
const currTitle = ref<string | undefined>(props.title ?? t('crud.import'))

/** 通过 API 方式调用弹出导入窗，并设置相关属性 */
function open(option: ImportOpenOptions = {}): void {
  currUrl.value = option.url
  currTemplateUrl.value = option.templateUrl
  currTitle.value = option.title
  onImportHandle()
}

function onImportHandle(): void {
  if (!currUrl.value) {
    console.error('未配置导入接口[url]')
    return
  }
  cModal.value?.open({
    title: currTitle.value,
    onConfirm: upload
  })
}

function downloadTemplate(): void {
  if (!currTemplateUrl.value) {
    console.error('未配置模板下载接口[templateUrl]')
    return
  }
  void axiosService.download(currTemplateUrl.value)
}

function handleRemove(): void {
  fileList.value = []
  rawFile.value = null
}

function beforeUpload(file: File): boolean {
  rawFile.value = file
  fileList.value = [file as unknown as UploadFile]
  return false // 返回 false，阻止自动上传
}

async function upload(close: () => Promise<void>): Promise<void> {
  if (!currUrl.value || !rawFile.value) return
  const formData = new FormData()
  formData.append('file', rawFile.value)
  await loadingRequest(
    uploading,
    async () => {
      await axiosService.post(`${currUrl.value}?updateSupport=${isReplace.value}`, formData)
      beforeCloseHandle()
      await close()
      emits('success')
    },
    t('crud.importSuccess')
  )
}

function beforeCloseHandle(): void {
  fileList.value = []
  rawFile.value = null
  isReplace.value = false
}

const emits = defineEmits<{
  (e: 'success'): void
}>()

defineExpose<CrudImportExpose>({ open })
</script>

<style lang="scss" scoped>
</style>
