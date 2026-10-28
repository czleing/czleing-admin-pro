/**
 * 使用 document viewTransition 过渡动画
 * 需配合全局样式 ::view-transition-new/old 使用, 参考示例：src\layout\components\header\mode-switch.vue
 */
export default function useViewTransition () {
  const root = document.documentElement;
  
  /**
   * 播放动画
   * @param {Function} changeFn 改变UI的函数 async
   * @param {number} x 动画起始 x 坐标（动画名称为circle时有效）
   * @param {number} y 动画起始 y 坐标（动画名称为circle时有效）
   * @param {string} animateName 动画名称，fade, circle, line
   * @param {boolean} positive 是否正向播放动画，默认：true
   * @param {number} duration 动画时间，单位毫秒，默认 500
   */
  function startViewTransition ({ changeFn, x, y, animateName = 'fade', positive = true, duration = 500 }) {
    if (!changeFn || typeof changeFn !== 'function') return;
    if (!document.startViewTransition) {
      changeFn()
      return
    }
    const vt = document.startViewTransition(async () => {
      changeFn();
      await nextTick();
    })
    vt.ready.then(() => {
      let frames = null
      if (animateName === 'circle') {
        const maxR = parseInt(Math.hypot(window.innerWidth, window.innerHeight) + '');
        const start = `circle(0px at ${x}px ${y}px)`;
        const end = `circle(${maxR}px at ${x}px ${y}px)`;
        frames = [
          { clipPath: positive ? start : end },
          { clipPath: positive ? end : start }
        ]
      } else if (animateName === 'line') {
        const start = 'polygon(100% 0, 233% 0, 266% 100%, 133% 100%)'
        const end = 'polygon(-33% 0, 100% 0, 133% 100%, 0 100%)'
        frames = [
          { clipPath: positive ? start : end },
          { clipPath: positive ? end : start },
        ]
      } else {
        frames = [
          { filter: positive ? 'blur(10px)' : 'blur(0px)', opacity: positive ? 0 : 1 },
          { filter: positive ? 'blur(0px)' : 'blur(10px)', opacity: positive ? 1 : 0 }
        ]
      }
      const animate = root.animate(frames, {
        duration,
        easing: 'linear', // 'cubic-bezier(0.89, 0.00, 0.43, 1.00)',
        pseudoElement: positive ? '::view-transition-new(root)' : '::view-transition-old(root)',
      });
      animate.onfinish = () => {
        vt.skipTransition();
      };
    })
  }

  return { startViewTransition }
}