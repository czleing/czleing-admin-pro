import { defineConfig, loadEnv, type ConfigEnv, type UserConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import type { ComponentResolver } from 'unplugin-vue-components'
import { fileURLToPath, URL } from 'node:url'
import AutoImport from 'unplugin-auto-import/vite'

/**
 * antdv-next 按需自动导入解析器
 * - 模板中的 <a-xxx> 自动映射为 antdv-next 的具名导出
 * - 图标自动从 @antdv-next/icons 导入
 * - AIcon 为项目自定义组件，需排除，避免被误解析为 antdv-next 的 Icon
 */
function AntdvNextResolver(): ComponentResolver {
  // antdv-next 中组件导出名与旧版存在差异的映射
  const componentNameMap: Record<string, string> = {
    Textarea: 'TextArea',
    RangePicker: 'DateRangePicker',
  }
  return {
    type: 'component',
    resolve: (name: string) => {
      if (name === 'AIcon') return
      if (/(?:Outlined|Filled|TwoTone)$/.test(name)) {
        return { name, from: '@antdv-next/icons' }
      }
      if (/^A[A-Z]/.test(name)) {
        const componentName = name.slice(1)
        return { name: componentNameMap[componentName] ?? componentName, from: 'antdv-next' }
      }
    },
  }
}

// 配置项参考：https://vitejs.dev/config/
export default defineConfig(({ mode }: ConfigEnv): UserConfig => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      vue(),
      // 自动导入 api：ref/reactive 无需 import
      AutoImport({
        imports: ['vue', 'vue-router', 'vue-i18n'],
        dirs: ['src/utils/index.ts', 'src/enum', 'src/api/index.ts'],
        dts: 'src/types/auto-import.d.ts',
      }),
      // 自动导入 template 组件 <a-button> <a-table>
      Components({
        dts: 'src/types/components.d.ts',
        resolvers: [
          // antdv-next 的自动按需引入
          AntdvNextResolver(),
        ],
      }),
    ],
    base: env.VITE_APP_CONTEXT_PATH,
    server: {
      host: true,
      port: 3000,
      strictPort: false,
      proxy: {
        '/api': {
          target: env.VITE_APP_DEV_PROXY,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
    build: {
      outDir: `dist/${mode}`,
      chunkSizeWarningLimit: 1500,
      rolldownOptions: {
        output: {
          codeSplitting: {
            groups: [
              {
                name: 'antdv',
                test: /node_modules[\\/]antdv-next/,
                priority: 20,
              },
              {
                name: 'wangeditor',
                test: /node_modules[\\/]@wangeditor/,
                priority: 15,
              },
              {
                name: 'echarts',
                test: /node_modules[\\/]echarts/,
                priority: 12,
              },
              {
                name: 'ant-icons',
                test: /node_modules[\\/]@antdv-next[\\/]icons/,
                priority: 10,
              },
              {
                name: 'vue',
                test: /node_modules[\\/]vue/,
                priority: 8,
              },
              {
                name: 'common',
                minShareCount: 2,
                minSize: 20000,
                test: /node_modules[\\/].*/,
                priority: 5,
              },
            ],
          },
        },
        // 为了移除 @vueuse/core 等包中包含特殊注释导致打包告警问题，待他们修复后可删除
        onwarn(warning, warn) {
          if (
            warning.code === 'COMMENT_ANCHOR_NOT_FOUND' ||
            (warning.message &&
              warning.message.includes('contains an annotation that Rolldown cannot interpret'))
          ) {
            return
          }
          warn(warning)
        },
      },
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  }
})
