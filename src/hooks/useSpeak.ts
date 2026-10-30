/**
 * 语音播报 hook（Web Speech API）
 * 支持一次设置多条消息，每条可自定义播放次数，按顺序播放
 */
import { ref } from 'vue'

interface SpeakMsg {
  text: string
  time: number
}

export function useSpeak() {
  const isPlaying = ref(false)
  const speech = window.speechSynthesis
  const utterance = new SpeechSynthesisUtterance()
  let msgList: SpeakMsg[] = []

  utterance.lang = 'zh-CN'
  utterance.onstart = () => {
    isPlaying.value = true
  }
  utterance.onend = () => {
    isPlaying.value = false
    if (msgList.length) {
      setTimeout(play, 1500)
    }
  }
  utterance.onerror = () => {
    isPlaying.value = false
  }

  /**
   * 将消息加入队列，等待播放
   * @param msg 消息文本
   * @param time 播放次数，默认 1 次
   */
  function speak(msg: string, time = 1): void {
    if (speech) {
      msgList.push({ text: msg, time })
      if (!isPlaying.value) {
        play()
      }
    } else {
      console.warn('Web Speech API is not supported by this browser.')
    }
  }

  function play(): void {
    const msg = msgList?.[0]
    if (msg) {
      utterance.text = msg.text
      msg.time--
      msgList = msgList.filter((item) => item.time > 0)
      speech.speak(utterance)
    }
  }

  return {
    isPlaying,
    speak,
  }
}

export default useSpeak
