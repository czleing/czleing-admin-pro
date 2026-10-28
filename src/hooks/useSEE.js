import { ref } from 'vue'
import axios from '@/api/index.js'

/**
 * 简单的服务端消息推送组件
 * @returns 
 */
export function useSSE() {
  const eventSource = ref(null)
  const listeners = ref({})

  const connect = (token) => {
    return new Promise((resolve) => {
      if (eventSource.value) {
        eventSource.value.close()
      }

      const url = import.meta.env.VITE_APP_BASE_API + '/sse/connect?token=' + token
      eventSource.value = new EventSource(url)

      eventSource.value.onopen = () => {
        // console.log('SSE连接已建立')
        // 注册所有已添加的监听器
        Object.entries(listeners.value).forEach(([eventName, callbacks]) => {
          callbacks.forEach(callback => {
            eventSource.value.addEventListener(eventName, callback)
          })
        })
        resolve(true)
      }

      eventSource.value.onerror = (error) => {
        // console.error('SSE连接错误:', error)
        resolve(false)
      }
    })
  }

  const addSSEListener = (eventName, callback) => {
    if (!listeners.value[eventName]) {
      listeners.value[eventName] = []
    }
    listeners.value[eventName].push(callback)

    // 如果已经连接，立即注册监听器
    if (eventSource.value && eventSource.value.readyState === EventSource.OPEN) {
      eventSource.value.addEventListener(eventName, callback)
    }
  }

  const disconnect = () => {
    if (eventSource.value) {
      eventSource.value.close()
      eventSource.value = null
      axios.post("/sse/close")
    }
  }

  return {
    connect,
    disconnect,
    addSSEListener
  }
}
