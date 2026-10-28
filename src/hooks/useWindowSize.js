
/**
 * 监听浏览器窗体大小改变，使用了组件生命周期，需要在组件的 setup 环境下使用
 * @param {*} callback 
 */
export function useWindowSize (callback) {
  const width = ref(window.innerWidth)
  const height = ref(window.innerHeight)
  
  function handleResize () {
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