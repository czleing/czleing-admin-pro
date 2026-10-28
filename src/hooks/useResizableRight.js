import { onMounted, onUnmounted } from "vue"

/**
 * 拖拽调整宽度
 * 在一个容器右边放置一个拖拽条，左右拖拽调整容器宽度 (拖拽条样式需自行实现)
 * @param {Ref} boxRef 容器
 * @param {Ref} resizerRef 拖拽条
 * @param {number} minW 
 * @param {number} maxW 
 */
export function useResizableRight(boxRef, resizerRef, minW, maxW) {
  function mouseDown (e) {
    e.preventDefault()
    const startX = e.clientX
    const startWidth = boxRef.value.offsetWidth

    function mousemove(e) {
      const deltaX = e.clientX - startX
      let w = startWidth + deltaX
      w = Math.max(minW, Math.min(maxW, w))
      boxRef.value.style.width = `${w}px`
    }
    function mouseup() {
      document.removeEventListener('mousemove', mousemove)
      document.removeEventListener('mouseup', mouseup)
    }
    document.addEventListener('mousemove', mousemove)
    document.addEventListener('mouseup', mouseup)
  }

  onMounted(() => {
    if (boxRef.value && resizerRef.value) {
      resizerRef.value.addEventListener('mousedown', mouseDown)
    }
  })
  onUnmounted(() => {
    if (boxRef.value && resizerRef.value) {
      resizerRef.value.removeEventListener('mousedown', mouseDown)
    }
  })
}