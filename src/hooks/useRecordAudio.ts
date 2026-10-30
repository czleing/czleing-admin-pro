/**
 * 录音 hook（MediaRecorder API）
 */
import { ref, type Ref } from 'vue'

export function useRecordAudio() {
  const isRecording: Ref<boolean> = ref(false)
  const error: Ref<string | undefined> = ref(undefined)
  const audioBlob: Ref<Blob | null> = ref(null)
  let mediaRecorder: MediaRecorder | null = null
  let audioChunks: Blob[] = []
  let stream: MediaStream | null = null

  // 开始录音
  const startRecord = async (): Promise<void> => {
    audioChunks = []
    audioBlob.value = null
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch (e) {
      console.error('无法获取麦克风权限')
      error.value = (e as Error).message
      throw new Error((e as Error).message, { cause: e })
    }
    let mimeType = 'audio/webm'
    if (MediaRecorder.isTypeSupported('audio/mp4')) mimeType = 'audio/mp4'

    mediaRecorder = new MediaRecorder(stream, { mimeType })
    mediaRecorder.ondataavailable = (e: BlobEvent) => {
      if (e.data.size) audioChunks.push(e.data)
    }
    mediaRecorder.onstop = () => {
      audioBlob.value = new Blob(audioChunks, { type: mimeType })
    }
    mediaRecorder.start()
    isRecording.value = true
  }

  // 停止录音
  const stopRecord = (): void => {
    if (!mediaRecorder || !stream) return
    mediaRecorder.stop()
    stream.getTracks().forEach((track) => track.stop())
    isRecording.value = false
  }

  // 播放录音
  const playAudio = (): void => {
    if (!audioBlob.value) return
    const url = URL.createObjectURL(audioBlob.value)
    const audio = new Audio(url)
    audio.play()
    audio.onended = () => URL.revokeObjectURL(url)
  }

  // 上传音频
  const uploadAudio = async (apiUrl: string): Promise<unknown> => {
    if (!audioBlob.value) throw new Error('无录音文件')
    const formData = new FormData()
    formData.append('audioFile', audioBlob.value, `rec_${Date.now()}.webm`)
    const res = await fetch(apiUrl, { method: 'POST', body: formData })
    return res.json()
  }

  return {
    isRecording,
    audioBlob,
    startRecord,
    stopRecord,
    playAudio,
    uploadAudio,
  }
}

export default useRecordAudio
