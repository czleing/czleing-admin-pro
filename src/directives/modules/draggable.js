/**
 * 使元素可拖动
 * !! 使用 transform: translate 实现，已设置了 translate 的会冲突
 * 1. 全方向拖动：v-draggable，可设置单方向拖动，v-draggable:x 或 v-draggable:y
 * 2. 给组件绑定此指令时(尤其第三方组件)，只是想拖动组件内的一个子组件(如：带遮罩的弹出窗，只想拖动弹出窗，不拖动遮罩)，不想拖动整个组件，可以通过设置 v-draggable="{ dragClass: 'ant-modal-header', moveClass: 'ant-modal-content' }" 来指定要拖动的子元素 class 和要执行移动的子元素 class
 * 2.1 dragClass: 触发拖动的元素 class，moveClass：执行移动的子元素 class
 */
export default {
  name: 'draggable',
  directive: {
    mounted: (el, binding) => {
      bindingDrag(el, binding)
    }
  }
}

function bindingDrag (el, binding) {
  const direction = binding.arg // v-draggable:x 仅 x 方向可拖动；v-draggable:y 仅 y 轴可拖动
  let dragElement = el // 要拖拽的元素，默认当前元素
  let moveElement = el // 要移动的元素，默认当前元素
  const dragClass = binding.value?.dragClass // 通过class名找到要拖拽的子元素
  const moveClass = binding.value?.moveClass // 通过class名找到要移动的子元素
  // 如果设置了子元素class，要拖动的元素变为子元素
  if (dragClass) {
    const elements = el.getElementsByClassName(dragClass)
    if (elements && elements.length) {
      dragElement = elements[0]
    }
  }
  // 如果设置了子元素class，要移动的元素变为子元素
  if (moveClass) {
    const elements = el.getElementsByClassName(moveClass)
    if (elements && elements.length) {
      moveElement = elements[0]
    }
  }

  let startX = 0
  let startY = 0
  let endX = 0
  let endY = 0
  if (dragElement && moveElement) {
    dragElement.style.cursor = 'move'
    dragElement.style.userSelect = 'none'
    const bounding = moveElement.getBoundingClientRect()
    const minX = -bounding.left
    const maxX = window.innerWidth - bounding.left - bounding.width
    const minY = -bounding.top
    const maxY = window.innerHeight - bounding.top - bounding.height
    dragElement.onmousedown = null
    dragElement.onmousedown = (e) => {
      let moveX = Number(moveElement.getAttribute('data-move-x') || 0)
      let moveY = Number(moveElement.getAttribute('data-move-y') || 0)
      startX = e.pageX
      startY = e.pageY
      document.onmousemove = null
      document.onmousemove = (de) => {
        endX = de.pageX
        endY = de.pageY
        // 限制滚动范围
        const limitArea = true
        let mx = endX - startX + moveX // mx 相对于初始位置的X偏移量
        let my = endY - startY + moveY
        if (limitArea) {
          mx = Math.min(Math.max(mx, minX), maxX)
          my = Math.min(Math.max(my, minY), maxY)
        }
        if (direction === 'x') {
          moveElement.style.transform = `translateX(${mx}px)`
        } else if (direction === 'y') {
          moveElement.style.transform = `translateY(${my}px)`
        } else {
          moveElement.style.transform = `translate(${mx}px, ${my}px)`
        }
        moveElement.setAttribute('data-move-x', mx)
        moveElement.setAttribute('data-move-y', my)
      }
    }
    document.onmouseup = null
    document.onmouseup = (e) => {
      document.onmousemove = null
    }
  }
}
