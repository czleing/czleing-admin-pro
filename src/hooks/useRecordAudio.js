/**
 * 录音，保存录音文件
 */
export default function useRecordAudio() {
  const isRecording = ref(false)
  const error = ref()
  const audioBlob = ref(null)
  let mediaRecorder = null
  let audioChunks = []
  let stream = null

  // 开始录音
  const startRecord = async () => {
    audioChunks = []
    audioBlob.value = null
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch (e) {
      console.error('无法获取麦克风权限')
      error.value = e.message
      return Promise.reject(e.message)
    }
    let mimeType = 'audio/webm'
    if (MediaRecorder.isTypeSupported('audio/mp4')) mimeType = 'audio/mp4'

    mediaRecorder = new MediaRecorder(stream, { mimeType })
    mediaRecorder.ondataavailable = e => e.data.size && audioChunks.push(e.data)
    mediaRecorder.onstop = () => {
      audioBlob.value = new Blob(audioChunks, { type: mimeType })
    }
    mediaRecorder.start()
    isRecording.value = true
  }

  // 停止录音
  const stopRecord = () => {
    if (!mediaRecorder || !stream) return
    mediaRecorder.stop()
    stream.getTracks().forEach(track => track.stop())
    isRecording.value = false
  }

  // 播放录音
  const playAudio = () => {
    if (!audioBlob.value) return
    const url = URL.createObjectURL(audioBlob.value)
    const audio = new Audio(url)
    audio.play()
    audio.onended = () => URL.revokeObjectURL(url)
  }

  // 上传音频
  const uploadAudio = async (apiUrl) => {
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
    uploadAudio
  }
}