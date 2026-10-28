import { message } from 'ant-design-vue'

/**
 * 复制 自定义指令
 * v-copy="要复制的内容"
 */
export default {
  name: 'copy',
  directive: {
    mounted (el, binding) {
      el.addEventListener('click', () => {
        navigator.clipboard.writeText(binding.value).then(() => {
          message.success('复制成功')
        }).catch(err => {
          message.error('复制出错')
        })
      })
    }
  }
}