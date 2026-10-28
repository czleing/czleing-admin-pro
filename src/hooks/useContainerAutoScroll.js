/**
 * 容器自动滚动
 * @param {Ref} container: 容器 ref
 * @param {Ref} list：数据列表响应式对象，ref
 * @param {Ref} pause：是否暂停，ref，手动控制暂停，优先于 hover 暂停
 * @param {object} options 其他参数
 * @param {string} options.scrollDirection: 滚动方向， x|y
 * @param {number} options.scrollSpeed: 滚动速度(px/帧), number;
 * @param {number} options.scrollDelay: 滚动间隔(ms);
 * @param {number} options.turnAroundDelay: 到达边界掉头时等待时间(ms)，默认 3000ms;
 * @returns
 */
export function useContainerAutoScroll(container, list, pause,
  { scrollDirection = 'y', scrollSpeed = 1, scrollDelay = 0, turnAroundDelay = 3000 } = {},
) {
  const isHover = ref(false);
  const animationRef = ref();
  const scrollContainer = ref();
  const isDown = ref(true);
  const isPause = ref(false);
  const timer = ref(null);
  const isY = scrollDirection === 'y'

  const mouseEnter = () => {
    isHover.value = true;
  };
  const mouseleave = () => {
    isHover.value = false;
  };
  const canScroll = () => {
    return (
      scrollContainer.value &&
      (
        (isY && scrollContainer.value.scrollHeight > scrollContainer.value.clientHeight)
        ||
        (!isY && scrollContainer.value.scrollWidth > scrollContainer.value.clientWidth)
      )
    );
  };
  function autoScroll() {
    if (!container.value) {
      // console.log('检测不到需要滚动的容器');
      return;
    }
    if (!scrollContainer.value) {
      scrollContainer.value = container.value;
      scrollContainer.value.addEventListener('mouseenter', mouseEnter);
      scrollContainer.value.addEventListener('mouseleave', mouseleave);
    }
    if (!canScroll()) {
      // console.log('当前内容不足，不需要滚动');
      return;
    }
    const targetFPS = 60; // 目标帧率，使高低刷屏幕保持相同频率
    const interval = 1000 / targetFPS; // 动画间隔毫秒数
    let lastTime = 0;
    clearTimeout(timer.value);
    cancelAnimationFrame(animationRef.value)
    const scrollStep = (timestamp) => {
      if (isHover.value || pause.value) {
        timer.value && clearTimeout(timer.value);
        timer.value = null;
        return;
      }
      if (timestamp - lastTime >= interval) {
        // 触底判断
        let maxScrollDistance = 0, currScrollDistance = 0
        if (isY) {
          maxScrollDistance = scrollContainer.value.scrollHeight - scrollContainer.value.clientHeight - 1;
          currScrollDistance = scrollContainer.value.scrollTop;
        } else {
          maxScrollDistance = scrollContainer.value.scrollWidth - scrollContainer.value.clientWidth - 1;
          currScrollDistance = scrollContainer.value.scrollLeft;
        }
        
        if (isDown.value === true && currScrollDistance >= maxScrollDistance) {
          // 滚到底部，改变方向并暂停一段时间
          isPause.value = true;
          isDown.value = false;
        } else if (isDown.value === false && currScrollDistance <= 0) {
          // 滚到顶部，改变方向并暂停一段时间
          isPause.value = true;
          isDown.value = true;
        } else {
          // 中间区域
          isPause.value = false;
        }
        if (!isPause.value) {
          if (isDown.value && currScrollDistance < maxScrollDistance) {
            if (isY) {
              scrollContainer.value.scrollTop += scrollSpeed; // 往下滚
            } else {
              scrollContainer.value.scrollLeft += scrollSpeed; // 往右滚
            }
          } else if (currScrollDistance > 0) {
            if (isY) {
              scrollContainer.value.scrollTop -= scrollSpeed; // 往上滚
            } else {
              scrollContainer.value.scrollLeft -= scrollSpeed; // 往左滚
            }
          }
        }
        lastTime = timestamp;
      }
      timer.value = setTimeout(
        () => {
          animationRef.value = requestAnimationFrame(scrollStep);
        },
        isPause.value ? turnAroundDelay : scrollDelay,
      ); // 连续滚动，相邻两次滚动设置间隔(如果有设置)，到达边界等待 turnAroundDelay 毫秒
    };
    timer.value = setTimeout(() => {
      animationRef.value = requestAnimationFrame(scrollStep);
    }, scrollDelay)
  }

  watch(
    () => [toRaw(list), isHover.value, pause.value],
    () => {
      !isHover.value && !pause.value && autoScroll();
    },
    { flush: 'post' },
  );

  onMounted(() => {
    autoScroll();
  });

  onUnmounted(() => {
    cancelAnimationFrame(animationRef.value);
    scrollContainer.value?.removeEventListener('mouseenter', mouseEnter);
    scrollContainer.value?.removeEventListener('mouseleave', mouseleave);
  });
}
export default useContainerAutoScroll
