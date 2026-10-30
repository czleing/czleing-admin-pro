/**
 * 简单的 SSE (Server-Sent Events) 连接 hook
 */
import { ref, type Ref } from 'vue'
import axios from '@/api'

export function useSSE() {
  const eventSource: Ref<EventSource | null> = ref(null)
  const listeners: Ref<Record<string, Array<(evt: MessageEvent) => void>>> = ref({})

  const connect = (token: string): Promise<boolean> => {
    return new Promise((resolve) => {
      if (eventSource.value) {
        eventSource.value.close()
      }

      const url = import.meta.env.VITE_APP_BASE_API + '/sse/connect?token=' + token
      eventSource.value = new EventSource(url)

      eventSource.value.onopen = () => {
        // 注册所有已添加的监听器
        Object.entries(listeners.value).forEach(([eventName, callbacks]) => {
          callbacks.forEach((callback) => {
            eventSource.value!.addEventListener(eventName, callback as EventListener)
          })
        })
        resolve(true)
      }

      eventSource.value.onerror = () => {
        resolve(false)
      }
    })
  }

  const addSSEListener = (eventName: string, callback: (evt: MessageEvent) => void): void => {
    if (!listeners.value[eventName]) {
      listeners.value[eventName] = []
    }
    listeners.value[eventName].push(callback)

    // 如果已经连接，立即注册监听器
    if (eventSource.value && eventSource.value.readyState === EventSource.OPEN) {
      eventSource.value.addEventListener(eventName, callback as EventListener)
    }
  }

  const disconnect = (): void => {
    if (eventSource.value) {
      eventSource.value.close()
      eventSource.value = null
      axios.post('/sse/close')
    }
  }

  return {
    connect,
    disconnect,
    addSSEListener,
  }
}
