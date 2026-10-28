<!-- 语音相关示例 -->
<template>
  <div class="w30p mt20">
    <div class="bold">文字转语音</div>
    <div class="mt10 flex-x gap10">
      <a-input v-model:value="inputStr" placeholder="文字内容" />
      <a-input-number v-model:value="inputTime" placeholder="播放次数" />
      <a-button :loading="isPlaying" @click="text2voice">播放</a-button>
    </div>
    <div class="bold mt20">语音转文字</div>
    <div class="mt10 flex-x gap10">
      <a-input-group compact>
        <a-input v-model:value="text" placeholder="请输入或录入" style="width: auto;" />
        <a-button type="primary" :disabled="!isSupport" @click="start">
          <template v-if="isSupport">
            <PauseCircleFilled v-if="loading" />
            <AudioFilled v-else />
          </template>
          <template v-else>
            <a-popover>
              <template v-if="error" #content>
                <span class="text-danger">{{ error }}</span>
              </template>
              <ExclamationCircleOutlined />
            </a-popover>
          </template>
        </a-button>
      </a-input-group>
    </div>
    <div class="bold mt20">录音</div>
    <div class="mt">
      <a-button @click="startRecord" :disabled="isRecording">开始录音</a-button>
      <a-button @click="stopRecord" v-if="isRecording">停止录音</a-button>
      <a-button @click="playAudio">试听</a-button>
    </div>
  </div>
</template>
<script setup>
import useVoiceInput from '@/hooks/useVoiceInput';
import useSpeak from '@/hooks/useSpeak';
import useRecordAudio from '@/hooks/useRecordAudio'
import { AudioFilled, ExclamationCircleOutlined, PauseCircleFilled } from '@ant-design/icons-vue';

/** 文字转语音 */
const { speak, isPlaying } = useSpeak()
const inputStr = ref('你好，hello')
const inputTime = ref(2)
function text2voice () {
  if (!inputStr.value) return
  speak(inputStr.value, inputTime.value)
}

// 语音输入
const { isSupport, error, loading, text, start, stop } = useVoiceInput()

/** 录音 */
const { isRecording, startRecord, stopRecord, playAudio, uploadAudio } = useRecordAudio()
</script>
<style scoped lang="less">
</style>