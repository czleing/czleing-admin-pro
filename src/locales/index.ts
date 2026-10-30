/**
 * vue-i18n 实例
 * 自动扫描 src/locales/langs 下的公共语言包
 * 用法：$t('模块名.业务名.语言Key', { 变量名: 'xxx' })
 */
import { createI18n } from 'vue-i18n'
import { mergeWith } from 'lodash-es'

// 加载公共模块
const commonLangs = import.meta.glob('./langs/*.{js,ts}', { eager: true })
// 加载业务模块
const moduleLangs = import.meta.glob('@/views/**/langs/*.{js,ts}', { eager: true })

/** 语言下拉选项（从公共语言包自动收集） */
export const langOptions = Object.entries(commonLangs)
  .filter(([, mod]) => (mod as { option?: unknown }).option)
  .map(([, mod]) => (mod as { option: unknown }).option)

/** 生成 i18n 配置 */
function getI18nConfig() {
  const messages: any = {}
  Object.entries(commonLangs).forEach(([path, module]) => {
    const match = path.match(/^.*\/([^\/]*)\.(js|ts)$/)
    const lang = match?.[1] ?? path
    ;(messages as any)[lang] = (module as { default: unknown }).default
  })
  Object.entries(moduleLangs).forEach(([path, module]) => {
    const match = path.match(/^.*\/([^\/]*)\.(js|ts)$/)
    const lang = match?.[1] ?? path
    const existing = (messages as any)[lang] || {}
    ;(messages as any)[lang] = mergeWith({}, existing, (module as { default: unknown }).default)
  })
  const USER_SETTINGS = localStorage.getItem('CZ_USER_SETTINGS')
  const settings = USER_SETTINGS ? JSON.parse(USER_SETTINGS) : null
  return {
    legacy: false,
    locale: settings?.locale || 'zh-cn',
    fallbackLocale: 'zh-cn',
    messages,
  }
}

const i18n = createI18n(getI18nConfig())

export default i18n