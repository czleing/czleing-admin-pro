import axios from 'axios'
import { message } from 'ant-design-vue'
import { useAuthStore } from '@/stores/auth-store'
import { useTabsStore } from '@/stores/tabs-store'

// 创建 Axios 实例
const instance = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API,
  timeout: 10000
})
// 请求拦截器
instance.interceptors.request.use((config) => {
    // 在请求发送之前可以进行一些处理，例如设置 token、添加请求头等
    const authStore = useAuthStore()
    const token = authStore.token
    if (token) {
      config.headers.authorization = config.headers.authorization ?? ('Bearer ' + token)
    }
    return config
  }, (error) => {
    return Promise.reject()
  }
)

// 响应拦截器
instance.interceptors.response.use((response) => {
  const { data } = response
  // 在接收到响应数据之前可以进行一些处理，例如解析响应数据、错误处理等
  // ...
  const contentType = response.headers['content-type']
  if (contentType?.indexOf('application/octet-stream') > -1 ||
    contentType?.indexOf('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') > -1) {
    // 注意：Blob类型文件下载需要请求头参数添加 responseType:'blob'  下载 导出等功能需要
    handleDownload(response)
  } else {
    if (data?.code === 401) {
      message.error({ content: '未登录或会话已过期,请重新登录', key: '401' })
      const authStore = useAuthStore()
      authStore.authExpiredHandle()
      return Promise.reject(new Error('未登录或会话已过期,请重新登录'))
    } else if (data?.code === 200) {
      // 响应数据是有效的 JSON 格式，继续处理
      let result = data
      if (data.list !== undefined) { // 分页列表的情况，返回分页对象
        result = data
      } else if (data.data !== undefined) { // 单个对象的情况，返回对象
        result = data.data
      }
      return Promise.resolve(result)
    } else {
      let msg = data?.msg ?? '服务器繁忙'
      msg = msg.length > 100 ? '系统错误' : msg
      message.error(msg)
      return Promise.reject(new Error(msg))
    }
  }
}, (error) => {
  // 统一处理错误
  return handleRequestError(error)
})

// 下载blob二进制文件
const handleDownload = (response) => {
  const filename = response.headers['download-filename']
  const blob = new Blob([response.data])
  if (window.navigator.msSaveBlob) {
    // 兼容 IE，使用 msSaveBlob 方法进行下载
    window.navigator.msSaveBlob(blob, decodeURIComponent(filename))
  } else {
    const url = window.URL.createObjectURL(new Blob([response.data]))
    // 创建一个 <a> 元素
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    link.setAttribute('download', decodeURIComponent(filename))
    // 模拟点击下载
    link.click()
    // 清理 URL 和 <a> 元素
    link.remove()
    window.URL.revokeObjectURL(url)
  }
}

// 统一处理错误
const handleRequestError = (error) => {
  // 进行错误处理
  let msg = ''
  if (error.response) {
    // 服务器响应错误
    let status = error.response.status
    msg = error.response.data.message
    // 在这里可以进行错误处理逻辑，例如弹出错误提示、记录错误日志等
    switch (status) {
      case 400: msg = msg || '请求参数错误 Bad Request'
      case 403: msg = msg || '禁止访问 Forbidden'
      case 404: msg = msg || '资源不存在 Not Found'
      case 405: msg = msg || '方法不允许 Method Not Allowed'
      case 408: msg = msg || '请求超时 Request Timeout'
      case 429: msg = msg || '请求过于频繁 Too Many Requests'
      case 500: msg = msg || '服务器内部错误 Internal Server Error'
      case 502: msg = msg || '网关错误 Bad Gateway'
      case 503: msg = msg || '服务不可用 Service Unavailable'
      case 504: msg = msg || '网关超时 Gateway Timeout'
      default:  msg = msg || '服务器响应错误 Service Error'
    }
    console.error(msg, error.response)
  } else if (error.request) {
    msg = '请求未收到响应'
    console.error(msg, error.request)
    // 在这里可以进行错误处理逻辑，例如弹出错误提示、记录错误日志等
  } else {
    msg = '请求配置出错'
    console.error(msg, error.message)
    // 在这里可以进行错误处理逻辑，例如弹出错误提示、记录错误日志等
  }
  message.error({ content: msg, key: msg })
  return Promise.reject(new Error(msg)) // 阻止代码往下执行
}

// 封装请求方法
class AxiosService {
  constructor () {
    if (AxiosService.instance) {
      return AxiosService.instance
    }
    AxiosService.instance = this
  }

  // GET 请求
  get (url, params = {}, config) {
    return instance({
      method: 'get',
      url,
      params,
      headers: config?.headers
    })
  }

  // POST 请求
  post (url, data = {}, config) {
    return instance.request({
      method: 'post',
      url,
      data,
      responseType: config?.responseType,
      headers: config?.headers
    })
  }

  // 下载 请求
  download (url, data = {}, config) {
    return instance.request({
      method: 'post',
      url,
      data,
      responseType: 'blob',
      headers: config?.headers
    })
  }

  // PUT 请求
  put (url, data = {}) {
    return instance.request({
      method: 'put',
      url,
      data
    })
  }

  // DELETE 请求
  delete (url, data = {}) {
    return instance.request({
      method: 'delete',
      url,
      data
    })
  }
}

// 创建 AxiosService 实例
const axiosService = new AxiosService()

// 导出实例化后的 AxiosService 对象
export default axiosService

export const $axios = axiosService
