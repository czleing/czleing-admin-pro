/**
 * v-draggable 自定义指令：使元素可拖动
 * 用法：
 *   v-draggable —— 全方向拖动
 *   v-draggable:x —— 仅 x 方向
 *   v-draggable:y —— 仅 y 方向
 *   v-draggable="{ dragClass: 'ant-modal-header', moveClass: 'ant-modal-content' }" —— 用子元素触发
 * 注意：使用 transform: translate 实现，已设置了 translate 的元素会冲突
 */
import type { Directive } from 'vue'
import type { DirectiveModule } from './copy'

interface DraggableBindingValue {
  /** 触发拖动的元素 class */
  dragClass?: string
  /** 执行移动的元素 class */
  moveClass?: string
}

function bindingDrag(el: HTMLElement, binding: { arg?: string; value?: DraggableBindingValue }): void {
  const direction = binding.arg
  let dragElement: HTMLElement = el
  let moveElement: HTMLElement = el
  const dragClass = binding.value?.dragClass
  const moveClass = binding.value?.moveClass
  if (dragClass) {
    const elements = el.getElementsByClassName(dragClass)
    if (elements && elements.length) {
      dragElement = elements[0] as HTMLElement
    }
  }
  if (moveClass) {
    const elements = el.getElementsByClassName(moveClass)
    if (elements && elements.length) {
      moveElement = elements[0] as HTMLElement
    }
  }

  if (dragElement && moveElement) {
    dragElement.style.cursor = 'move'
    dragElement.style.userSelect = 'none'
    const bounding = moveElement.getBoundingClientRect()
    const minX = -bounding.left
    const maxX = window.innerWidth - bounding.left - bounding.width
    const minY = -bounding.top
    const maxY = window.innerHeight - bounding.top - bounding.height
    dragElement.onmousedown = null
    dragElement.onmousedown = (e: MouseEvent) => {
      const moveX = Number(moveElement.getAttribute('data-move-x') || 0)
      const moveY = Number(moveElement.getAttribute('data-move-y') || 0)
      const startX = e.pageX
      const startY = e.pageY
      document.onmousemove = null
      document.onmousemove = (de: MouseEvent) => {
        const endX = de.pageX
        const endY = de.pageY
        let mx = endX - startX + moveX
        let my = endY - startY + moveY
        mx = Math.min(Math.max(mx, minX), maxX)
        my = Math.min(Math.max(my, minY), maxY)
        if (direction === 'x') {
          moveElement.style.transform = `translateX(${mx}px)`
        } else if (direction === 'y') {
          moveElement.style.transform = `translateY(${my}px)`
        } else {
          moveElement.style.transform = `translate(${mx}px, ${my}px)`
        }
        moveElement.setAttribute('data-move-x', String(mx))
        moveElement.setAttribute('data-move-y', String(my))
      }
    }
    document.onmouseup = null
    document.onmouseup = () => {
      document.onmousemove = null
    }
  }
}

const draggable: DirectiveModule = {
  name: 'draggable',
  directive: {
    mounted(el, binding) {
      bindingDrag(el, binding)
    },
  },
}

export default draggable
