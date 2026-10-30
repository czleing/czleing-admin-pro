<div align="center">
  <h1>czleing-admin-pro</h1>
  <h3>中后台管理系统快速开发框架</h3>
  <h4>主打工程化能力 + 配置化 + 代码生成</h4>
</div>

## 简介
### 技术栈：Vue3.5 + Vite8 + Pinia3 + Ant-design-vue4 + TypeScript + axios + vue-router + pnpm

该项目为 czleing-admin 的 TS 版本，保留原有功能的同时增强了工程化管理能力，更适合企业中多人团队合作。

## 相关项目
| 名称 | 说明 | 地址 |
| --- | --- | --- |
| czleing-admin | js 版本前端，带代码生成、系统管理等功能，可拿来直接开发 | https://gitee.com/czleing/czleing-admin.git |
| czleing-admin-pro(当前项目) | ts 版本前端，工程化能力增强，带代码生成、系统管理等功能，可拿来直接开发 | https://gitee.com/czleing/czleing-admin-pro.git |
| czleing-admin-api | 后端，spring-boot 单体服务 | https://gitee.com/czleing/czleing-admin-api.git |

## 环境要求
- node: 22+
- pnpm: 11+

## 相关技术及依赖
- Vue 3.5+ 开发框架
- Vite 8+ 打包构建工具
- [pinia](https://pinia.web3doc.top/) 全局状态管理
- ant-design-vue 4+ UI库，ant-design-vue 最新版，体验与颜值并存
- vue-router 路由管理
- [VueUse](https://vueuse.org/) 集成了很多组合式API的库
- axios 服务请求
- dayjs 日期处理(moment的简化版, ant-design-vue 4 默认的日期处理工具)
- pinia-plugin-persistedstate pinia持久化插件，
- unplugin-auto-import 常用API免导入插件，如使用 ref, reactive 不在需要写 import { ref, reactive } from 'vue'
- eslint 代码规范检查工具
- husky 代码提交规范检查工具
- commitlint 代码提交规范检查工具
- pnpm 包管理工具


## 框架功能及特点
- 轻量化（没有微前端、没有微服务、TS类型简单、第三方依赖少、目录简洁、简单实用）
- 配置化（CPage组件将CRUD重复逻辑封装，通过三段配置即可生成CRUD页面，面向配置开发，全系统风格统一，代码量极少）
- 主题动态切换(多种预设主题加多色自定义，非只换主色调，可选主题背景图，让主题更鲜明、底层使用 CSS 变量 + ThemeToken 双方案)
- 全局明/暗色模式(提供多种切换动画，丝滑过度)
- 使用静态路由+动态路由及权限配置(按钮级功能权限 + 数据权限，自定义指令+函数校验)
- 多种菜单布局方式
- 支持标签栏展示多个页面(多种样式可选、带右键多功能操作及收藏功能)
- 支持多级路由缓存及刷新
- 多种丝滑的标签页面切换动画
- 统一接口异常拦截处理，业务模块无需关注异常处理
- 统一路由拦截及校验，meta 多功能扩展
- 支持国际化(vue-i18n 按模块化配置，自动扫描，新增模块无需任何配置)
- 使用 TypeScript, 提供类型检查、智能提示、代码补全等功能
- 最新技术栈、前后端分离
- 线上自动检测版本更新（客户第一时间收到新版本更新提醒）
- 带CRUD、多种表单、弹窗、图表等使用示例
- 集成SSE消息通知
- 一个CRUD页面只有一个文件，不用到处跳，开发不割裂，代码简短
- ==========================
- 未来持续更新

## 适合场景
- 大中小型后台管理系统
- 数据管理、运营、统计分析类业务
- 学习、项目交付
- 追求轻量化、快速落地

## 初始化
### 1. 克隆本项目
- **Gitee**
```
git clone https://gitee.com/czleing/czleing-admin-pro.git
```

- **Github**
```
git clone https://github.com/czleing/czleing-admin-pro.git
```
### 2. 进入本项目根目录安装依赖
```
 pnpm i
```
### 3. 本地启动
```
npm run dev
```
### 4. 访问 http://127.0.0.1:3000/

### 5. 默认登录账号密码：
admin/123456

### 6. 打包
```
npm run build

```
### 7. 本地预览打包结果
```
npm run preview
```

## 预览
<img src='./src/doc/login.jpg' alt="login">
<img src='./src/doc/setting-1.jpg' alt="setting">
<img src='./src/doc/setting-2.jpg' alt="setting">
<img src='./src/doc/setting-3.jpg' alt="setting">
<img src='./src/doc/light-1.jpg' alt="light">
<img src='./src/doc/light-2.jpg' alt="light">
<img src='./src/doc/light-3.jpg' alt="light">
<img src='./src/doc/dark-1.jpg' alt="dark">
<img src='./src/doc/dark-2.jpg' alt="dark">
<img src='./src/doc/dark-3.jpg' alt="dark">
<img src='./src/doc/user.jpg' alt="user">
<img src='./src/doc/demo-add-1.jpg' alt="demo">
<img src='./src/doc/demo-add-2.jpg' alt="demo">
<img src='./src/doc/dict-type.jpg' alt="dict">
<img src='./src/doc/dict-data.jpg' alt="dict">
<img src='./src/doc/search-menu.jpg' alt="menu">
<img src='./src/doc/menu-add.jpg' alt="menu">
<img src='./src/doc/data-permission.jpg' alt="permission">
<img src='./src/doc/gen-import.jpg' alt="gen">
<img src='./src/doc/gen-fields.jpg' alt="gen">
<img src='./src/doc/gen-config.jpg' alt="gen">
<img src='./src/doc/gen-view.jpg' alt="gen">
<img src='./src/doc/swagger.jpg' alt="swagger">

## 文档
[点击进入](./src/doc/README.doc.md)，快速了解

## 在线预览
暂无线上地址，可以只启动前端查看部分静态内容及示例：
```
1、git clone https://gitee.com/czleing/czleing-admin-pro.git
2、cd czleing-admin-pro
3、pnpm i
4、npm run dev
5、访问 http://localhost:3000/ (无需登录，请忽略接口异常)
```

## 特别鸣谢
- 部分设置项借鉴：[vben-admin](https://github.com/vbenjs/vue-vben-admin)
- 部分主题、请求封装借鉴：[Vue3-Antd-Plus](https://gitee.com/Z568_568/vue3-antd-plus)

## 贡献者

<img src="./src/doc/avatar.png" align="center" />
czleing

## 感谢支持
开源不易，如果觉得对您有帮助，可以帮忙点个 Star, 感激不尽！

或者1分钱也是鼓励哦 ^_^

| 微信 | 支付宝 |
| --- | --- |
|<img src="./src/doc/wx.jpg" height="100" />|<img src="./src/doc/zfb.jpg" height="100" />|
