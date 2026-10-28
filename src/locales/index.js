import { createI18n } from 'vue-i18n'
import { mergeWith } from 'lodash-es'

/**
 * 扫描所有语言包文件
 * 相同模块名或业务名会被合并
 * 业务模块语言包定义规则：
 * // xx/langs/zh-cn.js
 * export default {
 *   模块名: {
 *     业务名: {
 *       语言Key: '语言值{变量名}',
 *       pleaseEnter: '请输入{text}',
 *       userName: '用户名',
 *     }
 *   }
 * }
 * 三层结构非强制，只要保证最终合并到一起不冲突就行
 * 用法：$t('模块名.业务名.语言Key', { 变量名: 'xxx' })
 * 带变量用法：$t('system.user.pleaseEnter', { text: $t('system.user.userName') })
 * 普通用法：$t('system.user.userName')
 */

// 加载公共模块
const commonLangs = import.meta.glob('@/locales/langs/*.js', { eager: true })
// 加载业务模块
const moduleLangs = import.meta.glob('@/views/**/langs/*.js', { eager: true })

/** 导出下拉选项 */
export const langOptions = Object.entries(commonLangs).map(([,mod]) => mod.option)

/** 生成i18n配置 */
function getI18nConfig () {
  const messages = {}
  Object.entries(commonLangs).forEach(([path, module]) => {
    const lang = path.match(/^.*\/([^\/]*)\.js$/)[1]
    messages[lang] = module.default
  })
  Object.entries(moduleLangs).forEach(([path, module]) => {
    const lang = path.match(/^.*\/([^\/]*)\.js$/)[1]
    messages[lang] = mergeWith({}, messages[lang], module.default)
  })
  const USER_SETTINGS = localStorage.getItem('CZ_USER_SETTINGS')
  const settings = USER_SETTINGS && JSON.parse(USER_SETTINGS)
  return {
    legacy: false,
    locale: settings?.locale || 'zh-cn', // 默认语言
    fallbackLocale: 'zh-cn', // 回退语言
    messages
  }
}

const i18n = createI18n(getI18nConfig())

export default i18n
