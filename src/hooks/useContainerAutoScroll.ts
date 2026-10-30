/**
 * 容器自动滚动（滚动到底/到顶后掉头暂停再反向滚动）
 * 在 setup 中调用即可：useContainerAutoScroll(containerRef, listRef, pauseRef)
 */
import { ref, watch, onMounted, onUnmounted, toRaw } from 'vue'
import type { Ref } from 'vue'

interface AutoScrollOptions {
  /** 滚动方向：x | y，默认 y */
  scrollDirection?: 'x' | 'y'
  /** 滚动速度(px/帧)，默认 1 */
  scrollSpeed?: number
  /** 滚动间隔(ms)，默认 0 */
  scrollDelay?: number
  /** 到达边界掉头时等待时间(ms)，默认 3000 */
  turnAroundDelay?: number
}

export function useContainerAutoScroll(
  container: Ref<HTMLElement | null>,
  list: Ref<unknown>,
  pause: Ref<boolean>,
  { scrollDirection = 'y', scrollSpeed = 1, scrollDelay = 0, turnAroundDelay = 3000 }: AutoScrollOptions = {}
): void {
  const isHover = ref(false)
  const animationRef = ref<number | null>(null)
  const scrollContainer = ref<HTMLElement | null>(null)
  const isDown = ref(true)
  const isPause = ref(false)
  const timer = ref<ReturnType<typeof setTimeout> | null>(null)
  const isY = scrollDirection === 'y'

  const mouseEnter = (): void => {
    isHover.value = true
  }
  const mouseleave = (): void => {
    isHover.value = false
  }
  const canScroll = (): boolean => {
    const el = scrollContainer.value
    if (!el) return false
    return isY ? el.scrollHeight > el.clientHeight : el.scrollWidth > el.clientWidth
  }

  function autoScroll(): void {
    if (!container.value) return
    if (!scrollContainer.value) {
      scrollContainer.value = container.value
      scrollContainer.value.addEventListener('mouseenter', mouseEnter)
      scrollContainer.value.addEventListener('mouseleave', mouseleave)
    }
    if (!canScroll()) return
    const targetFPS = 60
    const interval = 1000 / targetFPS
    let lastTime = 0
    if (timer.value) clearTimeout(timer.value)
    if (animationRef.value !== null) cancelAnimationFrame(animationRef.value)
    const scrollStep = (timestamp: number): void => {
      if (isHover.value || pause.value) {
        if (timer.value) clearTimeout(timer.value)
        timer.value = null
        return
      }
      if (timestamp - lastTime >= interval) {
        let maxScrollDistance = 0
        let currScrollDistance = 0
        const el = scrollContainer.value!
        if (isY) {
          maxScrollDistance = el.scrollHeight - el.clientHeight - 1
          currScrollDistance = el.scrollTop
        } else {
          maxScrollDistance = el.scrollWidth - el.clientWidth - 1
          currScrollDistance = el.scrollLeft
        }

        if (isDown.value === true && currScrollDistance >= maxScrollDistance) {
          isPause.value = true
          isDown.value = false
        } else if (isDown.value === false && currScrollDistance <= 0) {
          isPause.value = true
          isDown.value = true
        } else {
          isPause.value = false
        }
        if (!isPause.value) {
          if (isDown.value && currScrollDistance < maxScrollDistance) {
            if (isY) {
              el.scrollTop += scrollSpeed
            } else {
              el.scrollLeft += scrollSpeed
            }
          } else if (currScrollDistance > 0) {
            if (isY) {
              el.scrollTop -= scrollSpeed
            } else {
              el.scrollLeft -= scrollSpeed
            }
          }
        }
        lastTime = timestamp
      }
      timer.value = setTimeout(() => {
        animationRef.value = requestAnimationFrame(scrollStep)
      }, isPause.value ? turnAroundDelay : scrollDelay)
    }
    timer.value = setTimeout(() => {
      animationRef.value = requestAnimationFrame(scrollStep)
    }, scrollDelay)
  }

  watch(
    () => [toRaw(list.value), isHover.value, pause.value],
    () => {
      !isHover.value && !pause.value && autoScroll()
    },
    { flush: 'post' }
  )

  onMounted(() => {
    autoScroll()
  })

  onUnmounted(() => {
    if (animationRef.value !== null) cancelAnimationFrame(animationRef.value)
    scrollContainer.value?.removeEventListener('mouseenter', mouseEnter)
    scrollContainer.value?.removeEventListener('mouseleave', mouseleave)
  })
}

export default useContainerAutoScroll
