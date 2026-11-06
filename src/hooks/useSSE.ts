/**
 * 简单的 SSE (Server-Sent Events) 连接 hook
 * 屏蔽 EventSource 原生的无限自动重连，连接异常中断后改由本 hook 按退避间隔受控重连，
 * 超过最大次数或主动断开后停止，避免服务端异常 / token 失效时的重连风暴
 */
import { ref, shallowRef, type Ref, type ShallowRef } from 'vue'
import axios from '@/api'

/** 异常中断后最大连续重连次数，超过后放弃 */
const MAX_RECONNECT_COUNT = 5
/** 重连基础间隔（ms），按次数线性递增 */
const RECONNECT_BASE_DELAY = 2000

export function useSSE() {
  // EventSource 为原生对象，使用 shallowRef 避免被深层响应式代理
  const eventSource: ShallowRef<EventSource | null> = shallowRef(null)
  const listeners: Ref<Record<string, Array<(evt: MessageEvent) => void>>> = ref({})
  /** 当前连接使用的 token，重连时复用 */
  let currentToken = ''
  /** 已进行的连续重连次数，连接成功后清零 */
  let reconnectCount = 0
  /** 重连定时器 */
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null
  /** 是否主动关闭，主动关闭后不再自动重连 */
  let closedManually = false
  /** 当前实例是否成功建立过连接，决定断开时是否需要通知后端 */
  let hasConnected = false

  /** 清除重连定时器 */
  function clearReconnectTimer(): void {
    if (reconnectTimer !== null) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
  }

  /** 关闭当前连接实例并清除定时器 */
  function clearConnection(): void {
    clearReconnectTimer()
    if (eventSource.value) {
      eventSource.value.close()
      eventSource.value = null
    }
  }

  /** 在指定连接实例上注册所有已添加的监听器 */
  function registerListeners(es: EventSource): void {
    Object.entries(listeners.value).forEach(([eventName, callbacks]) => {
      callbacks.forEach((callback) => {
        es.addEventListener(eventName, callback as EventListener)
      })
    })
  }

  /**
   * 建立一次 SSE 连接
   * @returns 仅反馈本次连接是否成功，重连过程对调用方透明
   */
  function open(): Promise<boolean> {
    clearConnection()
    hasConnected = false
    return new Promise((resolve) => {
      let hasSettled = false
      const url = import.meta.env.VITE_APP_BASE_API + '/sse/connect?token=' + currentToken
      const es = new EventSource(url)
      eventSource.value = es
      es.onopen = () => {
        hasConnected = true
        reconnectCount = 0
        registerListeners(es)
        if (!hasSettled) {
          hasSettled = true
          resolve(true)
        }
      }
      es.onerror = () => {
        // 原生 EventSource 出错后仍会保持 CONNECTING 并无限自动重连，
        // 这里统一关闭实例，切断原生重连，改由 scheduleReconnect 受控重连
        es.close()
        if (eventSource.value === es) {
          eventSource.value = null
        }
        hasConnected = false
        if (!hasSettled) {
          hasSettled = true
          resolve(false)
        }
        scheduleReconnect()
      }
    })
  }

  /** 按退避间隔安排一次重连，主动关闭或超过次数上限则放弃 */
  function scheduleReconnect(): void {
    clearReconnectTimer()
    if (closedManually || reconnectCount >= MAX_RECONNECT_COUNT) {
      return
    }
    reconnectCount += 1
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null
      void open()
    }, RECONNECT_BASE_DELAY * reconnectCount)
  }

  /**
   * 建立 SSE 连接
   * @param token 登录 token
   * @returns 首次连接是否成功（后续后台重连结果不再反馈）
   */
  const connect = (token: string): Promise<boolean> => {
    currentToken = token
    closedManually = false
    reconnectCount = 0
    return open()
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

  /** 主动断开：停止自动重连，并在连接确实建立过时通知后端关闭 */
  const disconnect = (): void => {
    closedManually = true
    const shouldNotify = hasConnected
    clearConnection()
    if (shouldNotify) {
      axios.post('/sse/close').catch(() => {})
    }
  }

  return {
    connect,
    disconnect,
    addSSEListener,
  }
}
