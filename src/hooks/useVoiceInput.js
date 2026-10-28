/**
 * 语音输入，语音转文字
 * @param lang 语言，zh, en，非绝对，填入en也可识别中文，只是部分文字会识别成拼音
 * @returns
 */
export default function useVoiceInput (lang = 'zh') {
  const loading = ref(false) // 是否正在识别
  const text = ref('') // 识别结果
  const rec = ref() // 识别器
  const isSupport = ref(false)
  const error = ref('')
  let lastLength = 0 // 最后识别结果长度

  function onResult (event) {
    // 这个事件会把前面识别的结果都返回回来，所以需要取最后一个识别结果
    const length = event.results.length;
    // 没有新的识别结果的时候，事件也会触发，所以这里判断一下如果没有新的识别结果，就不取最后一个识别结果了。
    if (lastLength === length) {
      return
    }
    lastLength = length
    // 获取最后一个识别结果
    const transcript = event.results[length - 1]?.[0]?.transcript

    if (transcript) {
      text.value += transcript
    }
  }

  onMounted(() => {
    let reco = null
    if (window.webkitSpeechRecognition) {
      reco = new window.webkitSpeechRecognition()
    } else if (window.SpeechRecognition) {
      reco = new window.SpeechRecognition()
    } else {
      console.error('不支持语音功能')
    }
    checkSpeechMicSupport().then(res => {
      if (res.supportSTT && res.micAvailable) {
        isSupport.value = true
      } else {
        isSupport.value = false
        error.value = res.msg
      }
    })
    if (reco) {
      reco.lang = lang // 设置语言
      /** 控制是为每次识别返回连续结果，还是仅返回单个结果。默认为单个(false)。	也就是说如果这个属性设置为false，说一段话后会自动停止识别。如果为true，会一直识别，直到调用stop或abort方法停止识别。 */
      reco.continuous = true // 开启连续识别
      /** 这个属性控制是否返回临时结果，true表示返回，false不返回。	如果为true，说话的时候会实时返回，如果为false，一段话结束后才返回。 */
      reco.interimResults = true // 开启实时识别
  
      reco.addEventListener('result', onResult)
      rec.value = reco
    }
  })

  function start () {
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

  function stop () {
    if (isSupport.value && rec.value) {
      rec.value.stop()
      loading.value = false
    }
  }

  /**
   * 校验麦克风 & 语音识别可用性
   */
  async function checkSpeechMicSupport () {
    const result = {
      supportSTT: false,       // 是否支持语音识别SpeechRecognition
      micAvailable: false,    // 是否有可用麦克风+授权通过
      micPermission: '',      // 权限状态 denied/granted/prompt/not-support
      msg: ''
    };

    // 1. 判断是否支持语音识别API（兼容webkit前缀）
    window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!window.SpeechRecognition) {
      result.msg = '当前浏览器不支持语音识别Web Speech API';
      return result;
    }
    result.supportSTT = true;

    // 2. 判断是否支持麦克风媒体设备API
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      result.micPermission = 'not-support';
      result.msg = '浏览器不支持媒体设备，无法调用麦克风';
      return result;
    }

    try {
      // 3. 查询麦克风权限状态（Permissions API）
      const micPerm = await navigator.permissions.query({ name: 'microphone' });
      result.micPermission = micPerm.state;

      if (micPerm.state === 'denied') {
        result.msg = '麦克风权限已被永久拒绝，请在浏览器设置中手动开启';
        return result;
      }

      if (micPerm.state === 'prompt') {
        result.msg = '尚未授予麦克风权限，即将弹出授权框';
      }

      // 4. 尝试获取麦克风媒体流，验证硬件是否存在
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // 拿到流说明麦克风硬件正常、授权通过
      result.micAvailable = true;
      result.msg = '语音识别+麦克风均可正常使用';
      // 立即关闭媒体流，释放麦克风占用
      stream.getTracks().forEach(track => track.stop());
    } catch (err) {
      // 获取流失败分类处理
      if (err.name === 'NotFoundError') {
        result.micPermission = 'not-found';
        result.msg = '未检测到麦克风硬件';
      } else if (err.name === 'NotAllowedError') {
        result.micPermission = 'denied';
        result.msg = '用户拒绝麦克风临时授权';
      } else {
        result.msg = `麦克风异常：${err.message}`;
      }
    }
    return result;
  }

  onUnmounted(() => {
    rec.value?.removeEventListener('result', onResult)
  })

  return {
    isSupport,
    text,
    loading,
    error,
    start, // 开始识别
    stop, // 结束识别
  }
}
