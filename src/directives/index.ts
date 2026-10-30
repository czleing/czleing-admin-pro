/**
 * 全局自定义指令入口
 * 在 main.ts 中通过 app.use(directives) 统一注册
 */
import type { App } from 'vue'
import copy, { type DirectiveModule } from './modules/copy'
import draggable from './modules/draggable'
import vPermission from './modules/permission'
import noPermi from './modules/noPermi'
import vRole from './modules/role'

const directives: DirectiveModule[] = [copy, draggable, vPermission, noPermi, vRole]

export default {
  install(app: App): void {
    directives.forEach((di) => {
      app.directive(di.name, di.directive)
    })
  },
}
