/**
 * 检测是否有版本更新
 * 仅在生产环境生效，每 2 分钟轮询一次 last-modified 头
 */
import { notification, Button } from 'antdv-next'
import { h } from 'vue'

export function useCheckUpdate(): void {
  let lastModified: string | null = null
  const key = String(Date.now())
  const { t } = useI18n()

  async function getLastModified(): Promise<string | undefined> {
    const resp = await fetch('?r=' + Date.now())
    return resp.headers.get('last-modified') ?? undefined
  }

  async function needUpdate(): Promise<boolean> {
    try {
      const modified = await getLastModified()
      if (!lastModified) {
        lastModified = modified ?? null
        return false
      }
      return lastModified !== modified
    } catch {
      return false
    }
  }

  function checkUpdate(): void {
    setTimeout(async () => {
      const hasUpdate = await needUpdate()
      if (hasUpdate) {
        notification.destroy(key)
        notification.open({
          key,
          title: t('frame.versionUpdate'),
          description: t('frame.versionUpdateConfirm'),
          duration: 0,
          placement: 'bottomRight',
          actions: () =>
            h(Button, {
              type: 'primary',
              size: 'small',
              onClick: () => {
                window.location.reload()
              },
            }, t('frame.updateNow')),
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
