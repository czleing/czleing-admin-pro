/**
 * 拖拽调整宽度 hook：在容器右边放置拖拽条，左右拖拽调整容器宽度
 * 拖拽条样式需自行实现
 */
import { onMounted, onUnmounted, type ShallowRef } from 'vue'

export function useResizableRight(
  boxRef: Readonly<ShallowRef<HTMLElement | null>>,
  resizerRef: Readonly<ShallowRef<HTMLElement | null>>,
  minW: number,
  maxW: number
): void {
  function mouseDown(e: MouseEvent): void {
    e.preventDefault()
    const startX = e.clientX
    const startWidth = boxRef.value!.offsetWidth

    function mousemove(ev: MouseEvent): void {
      const deltaX = ev.clientX - startX
      let w = startWidth + deltaX
      w = Math.max(minW, Math.min(maxW, w))
      if (boxRef.value) {
        boxRef.value.style.width = `${w}px`
      }
    }
    function mouseup(): void {
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
