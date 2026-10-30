import { defineConfig, loadEnv, type ConfigEnv, type UserConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers'
import { fileURLToPath, URL } from 'node:url'
import { theme } from 'ant-design-vue'
import AutoImport from 'unplugin-auto-import/vite'

const { defaultAlgorithm, defaultSeed } = theme
const mapToken = defaultAlgorithm(defaultSeed)

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
        dirs: ['src/utils/index.{js,ts}', 'src/enum', 'src/api/index.{js,ts}'],
        dts: 'src/types/auto-import.d.ts',
      }),
      // 自动导入 template 组件 <a-button> <a-table>
      Components({
        dts: 'src/types/components.d.ts',
        resolvers: [
          // ant-design-vue 4.x 的自动按需引入
          AntDesignVueResolver({
            importStyle: false, // css in js, 4.x 不需要
            resolveIcons: true, // ant 图标也自动导入，<SettingOutlined /> 直接用
          }),
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
                test: /node_modules[\\/]ant-design-vue/,
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
                test: /node_modules[\\/]@ant-design[\\/]icons-vue/,
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
    css: {
      preprocessorOptions: {
        less: {
          // 在 vue、less 中使用主题色： color: @colorPrimary;
          modifyVars: mapToken,
        },
      },
    },
  }
})
