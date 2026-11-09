# czleing-admin-pro · AI 编程规范

> 本文件是 AI 编码时必须永久遵守的铁律，任何时候不得违反。新增或修改规则须经人工确认后写入。

---

## 一、技术栈约束（硬约束）

| 类别 | 选型 | 禁止 |
|------|------|------|
| 框架 | Vue 3.5 `<script setup>` SFC | JSX / TSX / Options API |
| 语言 | TypeScript 5.8，严格模式 | `any` / `unknown` 滥用 / 类型断言绕过 |
| 构建 | Vite 8 | Webpack / Rollup |
| 包管理 | pnpm ≥ 9.2 | npm / yarn |
| Node | ≥ 20.19 | 低于此版本 |
| UI 库 | Ant Design Vue 4 | Element Plus / 自造轮子 |
| 状态 | Pinia 3（persistedstate 插件持久化） | Pinia Options Store 之外的模式 |
| 路由 | vue-router 5 | —— |
| 国际化 | vue-i18n 11 | 硬编码多语言字符串 |
| 样式 | Less（优先）/ Sass | 裸 `<style>`（必须 `scoped`）/ CSS-in-JS |
| HTTP | axios（统一封装于 `src/api/index.js`） | 直接在业务代码中 `import axios` |
| 日期 | dayjs | Date 原生 API / moment |
| 工具 | lodash-es（按需）、@vueuse/core 按需引入 | 引入完整 lodash |
| 图表 | echarts + vue-echarts | 其他图表库 |
| 类型检查 | `pnpm typecheck` (vue-tsc) | 跳过类型检查提交代码 |

---

## 二、项目结构约定

### 2.1 目录总览

```
src/
├── api/              # 所有 HTTP 请求，按业务域拆分
├── assets/           # 静态资源（css / images）
├── components/       # 公共组件
│   ├── common/       # 通用展示类组件（Chart、IconSelect...）
│   ├── crud/         # CRUD 脚手架组件
│   └── global/       # 全局注册组件（CModal、DictView...）
├── config/           # 运行时配置（setting.js）
├── directives/       # 自定义指令
├── enum/             # 全局枚举
├── hooks/            # 可复用组合式函数
├── layout/           # 布局组件
├── locales/          # 多语言资源
├── router/           # 路由
├── stores/           # Pinia stores
├── types/            # 全局类型声明（.d.ts / 通用 interface）
├── utils/            # 纯工具函数（无副作用、与框架无关）
└── views/            # 页面模块，每个业务模块独立目录
```

### 2.2 模块内结构

每个 `views/modules/<业务名>/` 必须遵守：

```
<业务名>/
├── index.vue              # 页面入口
├── components/            # 本模块私有组件（需要时才建）
├── langs/                 # 本模块专属多语言（需要时才建）
│   ├── en.ts
│   ├── zh-cn.ts
│   └── zh-hk.ts
├── modal/                 # 弹窗组件（需要时才建）
├── enum/                  # 本模块枚举（需要时才建）
└── types.ts               # 本模块专属类型（需要时才建）
```

### 2.3 结构铁律

1. 根目录只保留必要配置文件，能收进子目录的一律收进去
2. 公共组件放 `src/components/`，页面私有组件放页面同级 `components/`
3. 通用 hooks 放 `src/hooks/`，页面专属逻辑放页面文件内
4. 类型：全局放 `src/types/`，子模块放子模块 `types/`（或单文件 `types.ts`），禁止类型声明文件到处散落
5. 枚举：全局放 `src/enum/`，模块枚举放模块内

---

## 三、Vue 组件规范

### 3.1 SFC 结构顺序（强制）

```vue
<!-- 这里写明当前文件功能描述与用途 -->
<script setup lang="ts">
// 1. import（按：vue / 第三方库 / @/ 别名 / 相对路径 分组，所有 import 都不需要空行分隔）
// 2. 类型定义（本组件专属 interface / type）
// 3. Props & Emits 定义
// 4. 响应式状态（ref / reactive / computed）
// 5. Store 实例
// 6. 路由 / 国际化 / 指令等全局 API
// 7. 组合式 hooks 调用
// 8. 业务函数
// 9. watch / watchEffect
// 10. onMounted / onUnmounted 等生命周期
</script>

<template>
  <!-- 模板内容 -->
</template>

<style lang="less" scoped>
/* 仅当前组件生效的样式 */
</style>
```

### 3.2 `<script setup>` 铁律
#### 业务代码可以使用 JS 或 TS
1. **禁止** Options API（`data()`、`methods`、`export default` 对象）
2. Props 必须使用 `defineProps<T>()` 泛型写法，禁止运行时校验写法，必须设默认值：
   ```ts
   interface Props {
     id: string;
     title?: string;
     pageSize?: number;
   }
   const props = withDefaults(defineProps<Props>(), {
     title: '',
     pageSize: 10,
   });
   ```
3. Emits 必须使用 `defineEmits<T>()` 泛型写法：
   ```ts
   const emit = defineEmits<{
     (e: 'update', value: string): void;
     (e: 'delete', id: number): void;
   }>();
   ```
4. 组件内超过 **1000 行** 必须拆分子组件，特殊单一功能组件除外
5. 异步数据加载使用 `onMounted`，禁止在 `<script setup>` 顶层直接发起请求
6. `ref` / `reactive` 命名要有意义，禁止单字母变量（循环变量除外）
7. 事件处理函数统一前缀 `handle`：`handleClick` / `handleSubmit`
8. 响应式变量尽可能使用浅响应式 shallowRef / shallowReactive / markRaw，除非有必要

### 3.3 Template 铁律

1. 禁止在模板中写复杂表达式，复杂逻辑抽到 computed 或函数
2. `v-if` / `v-for` 禁止同级使用，必须用 `<template v-for>` 包裹
3. 列表渲染必须提供唯一 `:key`，禁止用 index 作为 key（静态列表除外）
4. 属性绑定和事件绑定统一简写：`:src` / `@click`，禁止 `v-bind:src` / `v-on:click`
5. 多属性尽量不换行，超过 5 个时每个属性独占一行：
   ```vue
   <a-button
     type="primary"
     :disabled="disabled"
     :icon="icon"
     :loading="loading"
     :size="size"
     @click="handleSubmit"
   >
     {{ $t('common.submit') }}
   </a-button>
   ```

### 3.4 Style 铁律

1. 必须使用 `scoped`，禁止裸 `<style>`
2. 优先复用全局样式 `src/assets/css/base.less`，避免重复定义
3. 遵守 BEM 命名风格：`.block__element--modifier`，如 `.user-card__avatar--large`
4. 禁止 `*` 通配选择器，选择器影响范围需尽可能小，防止样式污染其他组件，需要跨 scope 时使用 `::deep` 伪类选择器

---

## 四、TypeScript 规范

### 4.1 类型铁律

1. **禁止** `any` —— 必须明确类型；确实无法确定时用 `unknown` + 类型守卫
2. **禁止** 无必要的类型断言 `as T` —— 优先让 TS 自动推断
3. 所有 API 响应、Props、Store State 必须声明 interface
4. 使用 `interface` 描述对象结构，`type` 描述联合类型、交叉类型、元组
5. 枚举优先使用 `const enum` 或普通常量对象 + `as const`，避免 `enum` 反向映射
6. 函数必须声明参数和返回值类型：
   ```ts
   // ✅ 好
   function getUserById(id: string): Promise<UserInfo> { ... }
   
   // ❌ 坏
   function getUserById(id) { ... }
   ```

### 4.2 类型组织

```ts
// src/types/api.d.ts —— API 通用响应
export interface ApiResponse<T = unknown> {
  code: number;
  data: T;
  message: string;
}

// src/views/modules/system/user/types.ts —— 模块专属
export interface UserInfo {
  id: string;
  username: string;
  roles: string[];
}
```

---

## 五、API 请求规范

### 5.1 统一入口

所有请求必须通过 `src/api/index.js` 导出的 axios 实例或其上封装的业务方法。

### 5.2 业务域拆分

```
src/api/
├── index.ts           # axios 实例 + 拦截器
├── user.ts            # 用户模块接口
├── role.ts            # 角色模块接口
└── ...
```

### 5.3 API请求使用风格

1. 接口方法必须写 JSDoc 注释（参数、返回值、业务含义）
2. 不强制使用 RESTful 风格，应视后端而定
3. 允许组件中直接写 `api.post('/xxx')`，无需封装成具名函数
4. 请求拦截器统一处理 token、401 重授权/登录、业务异常提示

---

## 六、Store（Pinia）规范

### 6.1 Store 模板
#### Options API 或 Composition API 都可以使用，不强制
```ts
// src/stores/user-store.ts
import { defineStore } from 'pinia';
import { getUserInfo } from '@/api/user';

interface UserState {
  token: string;
  userInfo: UserInfo | null;
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    token: localStorage.getItem('token') || '',
    userInfo: null,
  }),
  getters: {
    isLoggedIn: (state) => !!state.token,
    userName: (state) => state.userInfo?.username ?? '',
  },
  actions: {
    async fetchUserInfo(): Promise<void> {
      const { data } = await getUserInfo();
      this.userInfo = data;
    },
    logout(): void {
      this.token = '';
      this.userInfo = null;
    },
  },
  persist: {
    // key: 'user', // 无需指定，已统一在 main.ts 重写及拼接前缀
    pick: ['token'],
  },
});
```

### 6.2 铁律

1. Store 命名：`use` 前缀 + 领域名 + `Store` 后缀，如 `useUserStore`
2. State 必须有明确 interface 类型
3. 异步操作放 `actions`，禁止在 state 中做异步
4. 只有确实需要跨页面共享的数据才放 Store，页面私有状态留在组件内
5. 持久化须显式声明 `persist.pick`，默认不持久化
6. key 统一在 main.ts 重写及拼接前缀，无需指定

---

## 七、路由规范

### 7.1 路由文件组织

```
src/router/
├── index.ts          # createRouter 实例 + 动态路由注册
├── interceptors.ts   # beforeEach / afterEach 守卫
└── nav.routes.ts     # 静态路由表（登录页、404 等）
```

### 7.2 铁律

1. 路由懒加载：`component: () => import('@/views/...')`，禁止静态 import
2. 路由 meta 必须声明 TypeScript 扩展（在 `src/types/env.d.ts` 中声明 `RouteMeta`）
3. 权限路由由后端返回菜单动态注册，前端只定义基础路由
4. 路径使用 kebab-case：`/system/user-management`

---

## 八、国际化（i18n）规范

### 8.1 资源文件组织

```
src/locales/langs/
├── en.ts
├── zh-cn.ts
└── zh-hk.ts
```

业务模块国际化文件，放模块同级 `langs/` 目录，系统自动扫描。

### 8.2 铁律

1. 禁止硬编码多语言字符串，统一使用 `$t('key')` 或 `const { t } = useI18n()`
2. Key 分层级命名，点号分隔：`common.submit` / `system.user.title` / `user.form.username.placeholder`
3. 多个语言文件 key 必须完全对齐，一个 key 都不能少
4. 禁止在资源文件中写变量替换以外的 JS 表达式

---

## 九、Hooks 规范

### 9.1 通用 hooks 放 `src/hooks/`，专属逻辑放页面内

### 9.2 编写模板

```ts
// src/hooks/useAsync.ts
import { ref } from 'vue';

/**
 * 通用异步请求封装
 * @param fn 返回 Promise 的请求函数
 * @returns { data, loading, error, run }
 */
export function useAsync<T, P extends unknown[] = []>(
  fn: (...args: P) => Promise<T>
) {
  const data = ref<T | null>(null);
  const loading = ref(false);
  const error = ref<Error | null>(null);

  async function run(...args: P): Promise<T | null> {
    loading.value = true;
    error.value = null;
    try {
      data.value = await fn(...args);
      return data.value;
    } catch (err) {
      error.value = err as Error;
      return null;
    } finally {
      loading.value = false;
    }
  }

  return { data, loading, error, run };
}
```

### 9.3 铁律

1. 命名 `use` 前缀
2. 必须写 JSDoc 注释（功能、参数、返回值、注意事项）
3. 必须是纯组合式，内部不直接操作 DOM（除非封装 `useEventListener` 等通用场景）
4. 返回对象，禁止返回多个独立 ref

---

## 十、性能与可维护性原则

### 10.1 渲染性能

1. 大列表（> 100 条）使用虚拟滚动
2. `v-for` 中避免使用 `v-if` 和昂贵计算，使用 computed 预过滤
3. 表单输入实时校验使用 `debounce`（lodash-es）
4. 组件数据只取需要的字段，禁止解构整个 store 或 API 响应

### 10.2 构建性能

1. 第三方库按需引入（ant-design-vue 已配自动导入，lodash-es 手动按需）
2. 路由和动态组件必须懒加载
3. 图片放 `public/assets/`，禁止超大图片（> 500KB 需压缩）

### 10.3 可维护性

1. 单个 `.vue` 文件 ≤ **1000 行**（template + script + style 合计），超过必须拆分
2. 函数 ≤ **200 行**，超过拆分为子函数
3. 一个函数只做一件事，单一职责
4. 组件、hook、页面等文件首行必须写注释，说明文件功能、用途、用法示例

---

## 十一、AI 编码工作流铁律

### 11.1 改代码前必做

1. **读文件**：先 Read 目标文件确认最新内容，禁止凭记忆或猜测写代码
2. **看依赖**：了解被修改组件/函数的上下游引用，避免破坏调用方
3. **告知改动范围**：对重要变更（跨文件、公共 API、Store 结构）先列出改动清单，等待确认

### 11.2 写代码时必做

1. **TypeScript 优先**：先写类型定义，再写实现
2. **最小改动原则**：只改需要改的，顺手"优化"，无关代码一律禁止
3. **禁止生成垃圾代码**：
   - 禁止留 `console.log` 调试代码
   - 禁止注释掉的旧代码（Git 已记录历史）
   - 禁止 `TODO` / `FIXME` / `HACK`（除非明确是当前迭代内要完成的）
   - 禁止无用的中间变量
4. **自动导入优先**：组件、API、Vue API 已通过 `unplugin-auto-import` / `unplugin-vue-components` 配置的，无需手动 import

### 11.3 提交前必做

1. **类型检查**：`pnpm typecheck` 无错误
2. **确认无违规**：对照本文件逐条自查
3. **自检清单**：
   - [ ] 有没有用 `any`？
   - [ ] 有没有裸 `<style>` 没加 scoped？
   - [ ] 有没有在模板里写复杂表达式？
   - [ ] 有没有忘了写类型？

---

## 十二、错误与安全

1. 页面需要等待异步数据加载时，必须有 `loading` 状态提示用户，避免用户以为无响应
2. 表单提交按钮必须有 `:loading="submitting"` 防止重复提交
3. 路由守卫统一处理权限，禁止散落在页面内判断
4. Token 刷新、401 跳转统一在 axios 拦截器处理
5. XSS 防护：使用 `v-text` 代替 `v-html`，后端返回的富文本必须经过白名单清洗

---

## 十三、脚本命令

```bash
pnpm install          # 安装依赖
pnpm dev              # 开发环境（.env.dev）
pnpm build            # 生产构建（.env.prod）
pnpm build:test       # 测试环境构建
pnpm preview          # 本地预览构建产物
pnpm typecheck        # TypeScript 类型检查（提交前必跑）
```

---

## 修改记录

| 日期 | 版本 | 说明 |
|------|------|------|
| 2026-10-28 | v1.0 | 初始完善版，覆盖技术栈、结构、Vue、TS、API、Store、路由、i18n、Hooks、性能、AI 工作流、安全共 13 大类 |
