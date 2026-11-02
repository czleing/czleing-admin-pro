// ESLint 配置（flat config）：统一约束 JS/TS/Vue 代码质量与风格
// 规则体系：eslint 官方推荐 + typescript-eslint 推荐 + eslint-plugin-vue 强烈推荐
import js from '@eslint/js'
import { defineConfig } from 'eslint/config'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'

export default defineConfig(
  // 不参与检查的目录与自动生成文件
  {
    ignores: ['dist', 'node_modules', 'public', 'src/types/auto-import.d.ts', 'src/types/components.d.ts'],
  },
  // JS 官方推荐规则
  js.configs.recommended,
  // TS 推荐规则（仅作用于 .ts 文件）
  ...tseslint.configs.recommended,
  // Vue3 强烈推荐规则（含 template 基础检查）
  ...pluginVue.configs['flat/strongly-recommended'],
  {
    languageOptions: {
      // 浏览器 + Node 全局变量（window、document、process 等）
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      // 未定义变量交给 vue-tsc 检查，避免 unplugin-auto-import 注入的 ref/computed 等被误报
      'no-undef': 'off',
      // 禁止调试语句（console.warn / console.error 允许保留）
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      // 代码风格：与项目现有风格保持一致 —— 无分号、单引号
      semi: ['error', 'never'],
      quotes: ['error', 'single', { avoidEscape: true }],
      // 模板属性换行风格对齐 AGENTS.md 3.3：单行最多 5 个属性，超过则每个属性独占一行
      'vue/max-attributes-per-line': ['warn', { singleline: { max: 5 }, multiline: { max: 1 } }],
      // 短内容允许写在标签同一行（如 <a-button>提交</a-button>），不强制换行
      'vue/singleline-html-element-content-newline': 'off',
      // 新代码禁止 any（AGENTS.md 铁律）；存量代码待清理，先 warn 渐进收紧
      '@typescript-eslint/no-explicit-any': 'warn',
      // 禁止未使用变量（下划线开头视为有意忽略）；存量债务较多，先 warn 渐进收紧
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      // 以下为存量代码质量债务，统一先 warn 提示、渐进清理后再升级为 error
      'vue/no-unused-vars': 'warn',
      'vue/no-deprecated-slot-attribute': 'warn',
      '@typescript-eslint/no-unused-expressions': 'warn',
      '@typescript-eslint/no-unsafe-function-type': 'warn',
      '@typescript-eslint/no-empty-object-type': 'warn',
      '@typescript-eslint/no-this-alias': 'warn',
      'no-useless-assignment': 'warn',
      // 组件名不强制多单词（index.vue、SideItem.vue 等页面/布局组件天然单词名）
      'vue/multi-word-component-names': 'off',
      // 模板属性允许 camelCase 绑定（项目现有写法 :componentSize），不强制 kebab-case
      'vue/attribute-hyphenation': 'off',
      'vue/v-on-event-hyphenation': 'off',
    },
  },
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        // <script setup lang="ts"> 块使用 TS parser 解析
        parser: tseslint.parser,
      },
    },
  },
)
