/**
 * 监听浏览器窗口大小改变
 * 需在组件 setup 环境下使用（会用到 onMounted / onUnmounted）
 */
import { ref, onMounted, onUnmounted } from 'vue'
import type { Ref } from 'vue'

export function useWindowSize(callback?: (width: number, height: number) => void): { width: Ref<number>; height: Ref<number> } {
  const width = ref(window.innerWidth)
  const height = ref(window.innerHeight)

  function handleResize(): void {
    width.value = window.innerWidth
    height.value = window.innerHeight
    if (typeof callback === 'function') {
      callback(width.value, height.value)
    }
  }

  onMounted(() => {
    window.addEventListener('resize', handleResize)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
  })

  return { width, height }
}

export default useWindowSize
