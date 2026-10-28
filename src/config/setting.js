export default {
  // 网站信息
  websiteInfo: {
    systemName: 'czleing-admin', // 网站名称
    systemDesc: 'Vue3.5 + vite8 + ant-design-vue4.2 + pinia3', // 网站描述
    logo: import.meta.env.VITE_APP_CONTEXT_PATH + 'logo.png', // new URL('@/assets/images/logo.png', import.meta.url), // 网站 LOGO
    logoWhite: import.meta.env.VITE_APP_CONTEXT_PATH + 'logo_white.png', // new URL('@/assets/images/logo_white.png', import.meta.url), // 网站白色 LOGO
    copyright: '粤网安备：888888888', // 备案号，版权号
    copyrightLink: 'https://gitee.com/czleing/czleing-admin' // 备案号链接
  }
}
