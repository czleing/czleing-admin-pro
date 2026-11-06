/**
 * 统一 axios 实例与封装
 * 对外导出 axiosService（类实例）以及 $axios 别名
 */
import axios, { type AxiosInstance, type AxiosResponse, type InternalAxiosRequestConfig, type AxiosError } from 'axios'
import { message } from 'ant-design-vue'
import { useAuthStore } from '@/stores/auth-store'

/** 统一响应结构（后端返回） */
interface ApiResponse<T = unknown> {
  code: number
  data: T
  msg?: string
  message?: string
  list?: T[]
  total?: number
}

/** 封装的请求配置（支持 headers / responseType） */
interface RequestConfig {
  headers?: Record<string, string | number | boolean>
  responseType?: 'blob' | 'arraybuffer' | 'json' | 'text' | 'stream'
}

// 创建 Axios 实例
const instance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API,
  timeout: 10000,
})

// 请求拦截器
instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const authStore = useAuthStore()
    const token = authStore.token
    if (token) {
      config.headers.authorization = config.headers.authorization ?? 'Bearer ' + token
    }
    return config
  },
  () => Promise.reject()
)

// 响应拦截器
instance.interceptors.response.use(
  (response: AxiosResponse) => {
    const { data } = response as AxiosResponse<ApiResponse>
    const contentType = response.headers['content-type'] as string | undefined
    if (
      contentType && (
        contentType.indexOf('application/octet-stream') > -1 ||
        contentType.indexOf('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') > -1
      )
    ) {
      handleDownload(response)
      return response
    } else {
      const resp = data as ApiResponse
      if (resp?.code === 401) {
        return handleUnauthorized()
      } else if (resp?.code === 200) {
        let result: unknown = resp
        if (resp.list !== undefined) {
          result = resp
        } else if (resp.data !== undefined) {
          result = resp.data
        }
        return Promise.resolve(result as unknown as AxiosResponse)
    } else {
        let msg = resp?.msg ?? '服务器繁忙'
        msg = msg.length > 100 ? '系统错误' : msg
        message.error(msg)
        return Promise.reject(new Error(msg))
      }
    }
  },
  (error: AxiosError) => {
    return handleRequestError(error)
  }
)

// 下载 blob 二进制文件
function handleDownload(response: AxiosResponse): void {
  const filename = (response.headers['download-filename'] as string) || ''
  const blob = new Blob([response.data])
  if ((window.navigator as Navigator & { msSaveBlob?: (blob: Blob, filename: string) => void }).msSaveBlob) {
    ;(window.navigator as Navigator & { msSaveBlob: (blob: Blob, filename: string) => void }).msSaveBlob(blob, decodeURIComponent(filename))
  } else {
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    link.setAttribute('download', decodeURIComponent(filename))
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
    window.URL.revokeObjectURL(url)
    void url
  }
}

// 会话失效统一处理：提示并走登录失效流程（业务 code 401 与 HTTP 401 共用）
function handleUnauthorized(): Promise<never> {
  message.error({ content: '未登录或会话已过期,请重新登录', key: '401' })
  const authStore = useAuthStore()
  authStore.authExpiredHandle()
  return Promise.reject(new Error('未登录或会话已过期,请重新登录'))
}

// 统一处理错误
function handleRequestError(error: AxiosError): Promise<never> {
  let msg = ''
  if (error.response) {
    const { status } = error.response
    // HTTP 状态码 401 同样代表会话失效，统一登出并跳转登录
    if (status === 401) {
      return handleUnauthorized()
    }
    msg = (error.response.data as { message?: string })?.message ?? ''
    switch (status) {
      case 400:
        msg = msg || '请求参数错误 Bad Request'
        break
      case 403:
        msg = msg || '禁止访问 Forbidden'
        break
      case 404:
        msg = msg || '资源不存在 Not Found'
        break
      case 405:
        msg = msg || '方法不允许 Method Not Allowed'
        break
      case 408:
        msg = msg || '请求超时 Request Timeout'
        break
      case 429:
        msg = msg || '请求过于频繁 Too Many Requests'
        break
      case 500:
        msg = msg || '服务器内部错误 Internal Server Error'
        break
      case 502:
        msg = msg || '网关错误 Bad Gateway'
        break
      case 503:
        msg = msg || '服务不可用 Service Unavailable'
        break
      case 504:
        msg = msg || '网关超时 Gateway Timeout'
        break
      default:
        msg = msg || '服务器响应错误 Service Error'
    }
    console.error(msg, error.response)
  } else if (error.request) {
    msg = '请求未收到响应'
    console.error(msg, error.request)
  } else {
    msg = '请求配置出错'
    console.error(msg, error.message)
  }
  message.error({ content: msg, key: msg })
  return Promise.reject(new Error(msg))
}

// 封装请求方法
class AxiosService {
  private static instance: AxiosService | null = null

  constructor() {
    if (AxiosService.instance) {
      return AxiosService.instance
    }
    AxiosService.instance = this
  }

  get<T = unknown>(url: string, params: Record<string, unknown> = {}, config?: RequestConfig): Promise<T> {
    return instance({
      method: 'get',
      url,
      params,
      headers: config?.headers,
    }) as unknown as Promise<T>
  }

  post<T = unknown>(url: string, data: Record<string, unknown> | FormData = {}, config?: RequestConfig): Promise<T> {
    return instance.request({
      method: 'post',
      url,
      data,
      responseType: config?.responseType,
      headers: config?.headers,
    }) as unknown as Promise<T>
  }

  download(url: string, data: Record<string, unknown> = {}, config?: RequestConfig): Promise<Blob> {
    return instance.request({
      method: 'post',
      url,
      data,
      responseType: 'blob',
      headers: config?.headers,
    }) as unknown as Promise<Blob>
  }

  put<T = unknown>(url: string, data: Record<string, unknown> = {}): Promise<T> {
    return instance.request({
      method: 'put',
      url,
      data,
    }) as unknown as Promise<T>
  }

  delete<T = unknown>(url: string, data: Record<string, unknown> = {}): Promise<T> {
    return instance.request({
      method: 'delete',
      url,
      data,
    }) as unknown as Promise<T>
  }
}

// 导出实例
const axiosService = new AxiosService()

export default axiosService
export const $axios = axiosService
