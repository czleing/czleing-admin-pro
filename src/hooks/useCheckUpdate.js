import axios from 'axios'
import { notification, Button } from 'ant-design-vue'

/**
 * 检测是否有版本更新
 */
export function useCheckUpdate () {
  let lastModified = null
  const key = Date.now()

  async function getLastModified () {
    const resp = await axios.get('?r=' + Date.now())
    return resp.headers['last-modified']
  }

  async function needUpdate () {
    try {
      const modified = await getLastModified()
      console.log('check update -> last-modified: ', modified)
      if (!lastModified) {
        lastModified = modified
        return false
      }
      return lastModified !== modified
    } catch (e) {
      return false
    }
  }

  function checkUpdate () {
    setTimeout(async () => {
      const hasUpdate = await needUpdate()
      if (hasUpdate) {
        notification.close(key)
        notification.open({
          key,
          message: '版本更新',
          description: '检测到有新版本待更新，是否现在更新？',
          duration: 0,
          placement: 'bottomRight',
          btn: () => h(Button, {
            type: 'primary',
            size: 'small',
            onClick: () => {
              window.location.reload()
            },
          }, '现在更新')
        })
      } else {
        checkUpdate()
      }
    }, 120000)
  }
  if (import.meta.env.PROD) {
    checkUpdate()
  }
}