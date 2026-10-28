import 'ant-design-vue/dist/reset.css'
import '@/assets/css/index.less'
import components from '@/components/index'
import i18n from '@/locales/index'
import router from '@/router'
import { createPinia } from 'pinia'
import piniaPlugin from 'pinia-plugin-persistedstate'
import App from './App.vue'
import directives from './directives'

const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPlugin)

app.use(router).use(pinia).use(directives).use(components).use(i18n)
app.mount('#app')

app.config.errorHandler = (err, vm, info) => {
  console.error('[全局异常]', err, vm, info)
}
