/**
 * Document View Transition API 动画 hook
 * 需要配合全局样式 ::view-transition-new/old 使用
 * 参考示例：src/layout/components/header/mode-switch.vue
 */
import { nextTick } from 'vue'

interface StartViewTransitionOptions {
  /** 改变 UI 的函数 */
  changeFn?: () => void | Promise<void>
  /** circle 动画起始 x 坐标 */
  x?: number
  /** circle 动画起始 y 坐标 */
  y?: number
  /** 动画名称：fade / circle / line */
  animateName?: 'fade' | 'circle' | 'line'
  /** 是否正向播放，默认 true */
  positive?: boolean
  /** 动画时长 ms，默认 500 */
  duration?: number
}

export function useViewTransition() {
  const root = document.documentElement

  /**
   * 播放 View Transition 动画
   */
  function startViewTransition({
    changeFn,
    x,
    y,
    animateName = 'fade',
    positive = true,
    duration = 500,
  }: StartViewTransitionOptions): void {
    if (!changeFn || typeof changeFn !== 'function') return
    if (!document.startViewTransition) {
      changeFn()
      return
    }
    const vt = document.startViewTransition(async () => {
      changeFn()
      await nextTick()
    })
    vt.ready.then(() => {
      let frames: Keyframe[] | null = null
      if (animateName === 'circle') {
        const maxR = parseInt(String(Math.hypot(window.innerWidth, window.innerHeight)))
        const start = `circle(0px at ${x}px ${y}px)`
        const end = `circle(${maxR}px at ${x}px ${y}px)`
        frames = [
          { clipPath: positive ? start : end } as Keyframe,
          { clipPath: positive ? end : start } as Keyframe,
        ]
      } else if (animateName === 'line') {
        const start = 'polygon(100% 0, 233% 0, 266% 100%, 133% 100%)'
        const end = 'polygon(-33% 0, 100% 0, 133% 100%, 0 100%)'
        frames = [
          { clipPath: positive ? start : end } as Keyframe,
          { clipPath: positive ? end : start } as Keyframe,
        ]
      } else {
        frames = [
          { filter: positive ? 'blur(10px)' : 'blur(0px)', opacity: positive ? 0 : 1 } as Keyframe,
          { filter: positive ? 'blur(0px)' : 'blur(10px)', opacity: positive ? 1 : 0 } as Keyframe,
        ]
      }
      const animate = root.animate(frames, {
        duration,
        easing: 'linear',
        pseudoElement: positive ? '::view-transition-new(root)' : '::view-transition-old(root)',
      })
      animate.onfinish = () => {
        vt.skipTransition()
      }
    })
  }

  return { startViewTransition }
}

export default useViewTransition
