/**
 * 语音输入 hook（Web SpeechRecognition API）
 */
import { ref, onMounted, onUnmounted } from 'vue'
import type { Ref } from 'vue'

// DOM 类型可能需要通过 lib.dom 引入，这里兜底声明
interface SpeechRecognitionInstance extends EventTarget {
  lang: string
  continuous: boolean
  interimResults: boolean
  start(): void
  stop(): void
  abort(): void
  addEventListener(type: string, listener: EventListenerOrEventListenerObject): void
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject): void
}

interface SpeechRecognitionCtor {
  new (): SpeechRecognitionInstance
  isTypeSupported(type: string): boolean
}

type SpeechRecognition = SpeechRecognitionInstance

interface CheckResult {
  supportSTT: boolean
  micAvailable: boolean
  micPermission: string
  msg: string
}

export function useVoiceInput(lang = 'zh') {
  const loading: Ref<boolean> = ref(false)
  const text: Ref<string> = ref('')
  const rec: Ref<SpeechRecognition | null> = ref(null)
  const isSupport: Ref<boolean> = ref(false)
  const error: Ref<string> = ref('')
  let lastLength = 0

  function onResult(event: Event): void {
    // 这个事件会把前面识别的结果都返回回来，所以需要取最后一个识别结果
    const speechEvent = event as unknown as { results: ArrayLike<ArrayLike<{ transcript: string }>> }
    const length = speechEvent.results.length
    if (lastLength === length) return
    lastLength = length
    const transcript = speechEvent.results[length - 1]?.[0]?.transcript
    if (transcript) {
      text.value += transcript
    }
  }

  onMounted(() => {
    let reco: SpeechRecognition | null = null
    const W = window as unknown as {
      SpeechRecognition?: SpeechRecognitionCtor
      webkitSpeechRecognition?: SpeechRecognitionCtor
    }
    if (W.webkitSpeechRecognition) {
      reco = new W.webkitSpeechRecognition()
    } else if (W.SpeechRecognition) {
      reco = new W.SpeechRecognition()
    } else {
      console.error('不支持语音功能')
    }
    checkSpeechMicSupport().then((res) => {
      if (res.supportSTT && res.micAvailable) {
        isSupport.value = true
      } else {
        isSupport.value = false
        error.value = res.msg
      }
    })
    if (reco) {
      reco.lang = lang
      reco.continuous = true
      reco.interimResults = true
      reco.addEventListener('result', onResult)
      rec.value = reco
    }
  })

  function start(): void {
    if (isSupport.value && rec.value) {
      if (loading.value) {
        stop()
        return
      }
      loading.value = true
      lastLength = 0
      rec.value.start()
    }
  }

  function stop(): void {
    if (isSupport.value && rec.value) {
      rec.value.stop()
      loading.value = false
    }
  }

  /** 校验麦克风 & 语音识别可用性 */
  async function checkSpeechMicSupport(): Promise<CheckResult> {
    const result: CheckResult = {
      supportSTT: false,
      micAvailable: false,
      micPermission: '',
      msg: '',
    }
    const Win = window as unknown as { SpeechRecognition?: SpeechRecognitionCtor }
    if (!Win.SpeechRecognition) {
      result.msg = '当前浏览器不支持语音识别 Web Speech API'
      return result
    }
    result.supportSTT = true

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      result.micPermission = 'not-support'
      result.msg = '浏览器不支持媒体设备，无法调用麦克风'
      return result
    }

    try {
      const micPerm = await navigator.permissions.query({ name: 'microphone' as PermissionName })
      result.micPermission = micPerm.state
      if (micPerm.state === 'denied') {
        result.msg = '麦克风权限已被永久拒绝，请在浏览器设置中手动开启'
        return result
      }
      if (micPerm.state === 'prompt') {
        result.msg = '尚未授予麦克风权限，即将弹出授权框'
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      result.micAvailable = true
      result.msg = '语音识别+麦克风均可正常使用'
      stream.getTracks().forEach((track) => track.stop())
    } catch (err) {
      const errObj = err as { name?: string; message?: string }
      if (errObj.name === 'NotFoundError') {
        result.micPermission = 'not-found'
        result.msg = '未检测到麦克风硬件'
      } else if (errObj.name === 'NotAllowedError') {
        result.micPermission = 'denied'
        result.msg = '用户拒绝麦克风临时授权'
      } else {
        result.msg = `麦克风异常：${errObj.message}`
      }
    }
    return result
  }

  onUnmounted(() => {
    rec.value?.removeEventListener('result', onResult as unknown as EventListener)
  })

  return {
    isSupport,
    text,
    loading,
    error,
    start,
    stop,
  }
}

export default useVoiceInput
