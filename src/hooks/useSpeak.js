/**
 * 用语音播放文字
 * 支持一次设置多条，每条可自定义播放次数，按顺序播放，每条次数消耗完再播放下一条
 */
export default function useSpeak () {
  const isPlaying = ref(false)
  const speech = window.speechSynthesis
  const utterance = new SpeechSynthesisUtterance()
  let msgList = [] // { text: '消息内容', time: 1 }

  utterance.lang = 'zh-CN'
  utterance.onstart = () => { isPlaying.value = true }
  utterance.onend = () => {
    isPlaying.value = false
    if (msgList.length) {
      setTimeout(play, 1500)
    }
  }
  utterance.onerror = () => { isPlaying.value = false }

  /**
   * 将消息加入队列，等待播放
   * @param {string} msg 消息
   * @param {number} time 播放次数，默认 1 次
   */
  function speak (msg, time = 1) {
    if (speech) {
      msgList.push({
        text: msg,
        time
      })
      if (!isPlaying.value) {
        play()
      }
    } else {
      console.warn('Web Speech API is not supported by this browser.')
    }
  }

  function play () {
    const msg = msgList?.[0]
    if (msg) {
      utterance.text = msg.text,
      msg.time--
      msgList = msgList.filter(item => item.time > 0)
      speech.speak(utterance)
    }
  }

  return {
    isPlaying,
    speak
  }
}