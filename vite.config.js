import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers'
import { fileURLToPath, URL } from 'node:url'
import { theme } from 'ant-design-vue'
import AutoImport from 'unplugin-auto-import/vite'

const { defaultAlgorithm, defaultSeed } = theme
const mapToken = defaultAlgorithm(defaultSeed)

// 配置项参考：https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), '') // 第三个参数为 '' 表示加载环境文件所有参数
  return {
    plugins: [
      vue(),
      // 自动导入api：ref/reactive 无需 import
      AutoImport({
        imports: ['vue', 'vue-router', 'vue-i18n'],
        dirs: ['src/utils/index.js', 'src/enum', 'src/api/index.js'], // 将自定义的API也加入到自动导入
        dts: 'src/plugins/auto-import.d.ts', // 生成类型声明文件
        // eslintrc: { // 如果使用了 eslint，可以开启这个配置
        //   enabled: true,
        //   filepath: 'src/utils/.eslintrc-auto-import.json',
        //   globalsPropValue: true
        // }
      }),
      // 自动导入template组件 <a-button> <a-table>
      Components({
        resolvers: [
          // ant-design-vue 4.x 的自动按需引入,
          AntDesignVueResolver({
            importStyle: false, // css in js, 4.x 不需要
            resolveIcons: true, // ant 图标也自动导入，<SettingOutlined /> 直接用
          })
        ]
      })
    ],
    base: env.VITE_APP_CONTEXT_PATH, // 公共基础路径，会注入到全局变量 import.meta.env.BASE_URL，创建router时也需要指定根路径为此路径
    server: {
      host: true, // '0.0.0.0' or true(简写) 支持局域网访问，默认的 'localhost', 和 '127.0.0.1' 不支持局域网访问
      port: 3000,
      strictPort: false, // 设为 true 时若端口已被占用则会直接退出，而不是尝试下一个可用端口。
      proxy: {
        '/api': {
          target: env.VITE_APP_DEV_PROXY,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        }
      }
    },
    build: {
      outDir: `dist/${mode}`,
      chunkSizeWarningLimit: 1500, // KB
      rolldownOptions: {
        output: {
          codeSplitting: {
            groups: [
              {
                name: 'antdv',
                test: /node_modules[\\/]ant-design-vue/,
                priority: 20
              },
              {
                name: 'wangeditor',
                test: /node_modules[\\/]@wangeditor/,
                priority: 15,
              },
              {
                name: 'echarts',
                test: /node_modules[\\/]echarts/,
                priority: 12
              },
              {
                name: 'ant-icons',
                test: /node_modules[\\/]@ant-design[\\/]icons-vue/,
                priority: 10
              },
              {
                name: 'vue',
                test: /node_modules[\\/]vue/,
                priority: 8
              },
              {
                name: 'common',
                minShareCount: 2,
                minSize: 20000,
                test: /node_modules[\\/].*/,
                priority: 5,
              }
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
            return;
          }
          warn(warning);
        },
      }
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    css: {
      preprocessorOptions: {
        less: {
          // 在 vue、less 中使用主题色： color: @colorPrimary;
          modifyVars: mapToken // 将 ant-design-vue 中的样式变量作为全局 less 变量，参考：https://next.antdv.com/docs/vue/customize-theme-cn
        }
      }
    }
  }
})
