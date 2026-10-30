/**
 * v-copy 自定义指令：点击时复制内容到剪贴板
 */
import { message } from 'ant-design-vue'
import type { Directive } from 'vue'

/** 项目自定义的指令模块结构：{ name, directive } */
export interface DirectiveModule {
  name: string
  directive: Directive
}

const copy: DirectiveModule = {
  name: 'copy',
  directive: {
    mounted(el, binding) {
      el.addEventListener('click', () => {
        navigator.clipboard
          .writeText(String(binding.value))
          .then(() => {
            message.success('复制成功')
          })
          .catch(() => {
            message.error('复制出错')
          })
      })
    },
  },
}

export default copy
