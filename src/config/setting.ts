/**
 * 运行时配置
 */
export interface WebsiteInfo {
  systemName: string
  systemDesc: string
  logo: string
  logoWhite: string
  copyright: string
  copyrightLink: string
}

export interface AppSettings {
  websiteInfo: WebsiteInfo
}

const setting: AppSettings = {
  // 网站信息
  websiteInfo: {
    systemName: 'czleing-admin-pro', // 网站名称
    systemDesc: 'Vue3.5 + TypeScript + vite8 + ant-design-vue4.2 + pinia3', // 网站描述
    logo: import.meta.env.VITE_APP_CONTEXT_PATH + 'logo.png', // 网站 LOGO
    logoWhite: import.meta.env.VITE_APP_CONTEXT_PATH + 'logo_white.png', // 网站白色 LOGO
    copyright: '粤网安备：888888888', // 备案号，版权号
    copyrightLink: 'https://gitee.com/czleing/czleing-admin-pro', // 备案号链接
  },
}

export default setting
