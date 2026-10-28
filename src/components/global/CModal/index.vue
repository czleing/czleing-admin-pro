<!-- 弹窗组件，分居中弹窗和侧边抽屉弹窗 -->
<template>
  <div class="modal">
    <a-modal v-if="currMode === 'modal'" :title="currTitle" :open="visible" :width="currWidth" v-bind="$attrs" @cancel="close" @ok="onOkHandle">
      <slot :visible="visible" />
      <!-- a-modal 自带有确定、取消按钮，此处使用自定义 -->
      <template v-if="$attrs.footer !== null" #footer>
        <slot name="footer">
          <div class="tr">
            <a-button v-if="currShowCancel" :loading="closeLoading" @click="close">{{ currCancelText }}</a-button>
            <a-button v-if="currShowConfirm" type="primary" :loading="confirmLoading" :disabled="confirmLoading || confirmDisabled" @click="onOkHandle">{{ currConfirmText }}</a-button>
          </div>
        </slot>
      </template>
    </a-modal>
    <a-drawer v-if="currMode === 'drawer'" :title="currTitle" :open="visible" :width="currWidth" v-bind="$attrs" @close="close">
      <div class="">
        <slot :visible="visible" />
      </div>
      <!-- a-drawer 默认没有按钮 -->
      <template v-if="$attrs.footer !== null && (currShowCancel || currShowConfirm)" #footer>
        <slot name="footer">
          <div class="tr">
            <a-button v-if="currShowCancel" :loading="closeLoading" @click="close">{{ currCancelText }}</a-button>
            <a-button v-if="currShowConfirm" type="primary" :loading="confirmLoading" :disabled="confirmLoading || confirmDisabled" @click="onOkHandle">{{ currConfirmText }}</a-button>
          </div>
        </slot>
      </template>
      <template v-if="$slots.extra" #extra>
        <slot name="extra" />
      </template>
    </a-drawer>
  </div>
</template>

<script setup>
import { loadingRequest } from '@/utils/index.js'

const props = defineProps({
  title: String,
  mode: { type: String, default: 'modal' }, // modal || drawer
  width: { type: [String, Number], default: 600 },
  showConfirm: { type: Boolean, default: true },
  showCancel: { type: Boolean, default: true },
  confirmText: { type: String, default: '确定' },
  cancelText: { type: String, default: '关闭' },
  onCancel: Function, // async () => {}
  onConfirm: Function, // async (close, extraData) => {}
  confirmDisabled: { type: Boolean, default: false } // 确认按钮是否禁用
})

const visible = ref(false) // 弹窗是否可见
const closeLoading = ref(false)
const confirmLoading = ref(false)
const currMode = ref(props.mode) // 弹窗模式，modal, drawer
const currTitle = ref(props.title)
const currWidth = ref(props.width)
const currConfirmText = ref(props.confirmText)
const currCancelText = ref(props.cancelText)
const currShowConfirm = ref(props.showConfirm)
const currShowCancel = ref(props.showCancel)
let onConfirm = null
let onCancel = null
let extraData = null

watch(
  () => props.confirmText,
  (val) => {
    currConfirmText.value = val
  }
)
watch(
  () => props.title,
  (t) => currTitle.value = t
)

/**
 * 弹出
 * options.mode 弹窗模式 modal, drawer
 * options.title 弹窗标题
 * options.width 弹窗宽度
 * @param {Object} options
 */
function open (options) {
  currMode.value = options?.mode ?? props.mode
  currTitle.value = options?.title ?? props.title
  currConfirmText.value = options?.confirmText ?? props.confirmText
  currCancelText.value = options?.cancelText ?? props.cancelText
  currWidth.value = ((options?.width ?? props.width) + 'px').replace('pxpx', 'px')
  currShowConfirm.value = options?.showConfirm ?? props.showConfirm
  currShowCancel.value = options?.showCancel ?? props.showCancel
  onConfirm = options?.onConfirm ?? props.onConfirm
  onCancel = options?.onCancel ?? props.onCancel
  extraData = options?.extraData
  visible.value = true
}
/** 关闭 */
async function close () {
  loadingRequest(closeLoading, async () => {
    if (onCancel && typeof onCancel === 'function' && visible.value) {
      await onCancel()
    }
    await nextTick()
    visible.value = false
    emits('close')
  })
}

/** 点击确认按钮 */
function onOkHandle () {
  loadingRequest(confirmLoading, async () => {
    if (onConfirm && typeof onConfirm === 'function') {
      await onConfirm(close, extraData)
    }
    emits('confirm', close)
  })
}

const emits = defineEmits(['confirm', 'close'])

provide('modal.in', true) // 用于子组件判断是否在弹窗组件下面
provide('modal.close', close)
provide('modal.visible', visible)

defineExpose({
  open,
  close,
  visible
})
</script>

<style lang="scss" scoped>
</style>
