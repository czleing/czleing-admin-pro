import { ref, onScopeDispose, watch, toRaw, nextTick } from 'vue'
import Sortable from 'sortablejs'

/**
 * @param {*} containerRef 拖拽容器DOM 或 ref，可以是自定义组件的 ref，也可以是 html 原生标签的 ref，或 HTMLElement 对象
 * @param {*} list 源数据数组, reactive、ref 可读可写响应式对象，传了则修改排序，不传则需通过事件 onSortEnd 自行修改
 * @param {Object} options Sortable配置
 */
export function useSortable(containerRef, list, options = {}) {
  const instance = ref(null)
  const enabled = ref(true)

  // 默认配置
  const defaultOpts = {
    animation: 150,
    // 拖拽手柄选择器 .drag-handle
    handle: '',
    // 禁止拖拽元素选择器
    filter: '',
    // 忽略拖拽区域（输入框等）
    ignore: 'input,textarea',
    ghostClass: 'sortable-ghost',
    chosenClass: 'sortable-chosen',
    dragClass: 'sortable-drag',
  }

  // 合并配置
  const sortOptions = { ...defaultOpts, ...options }

  function getRawDom (target) {
    if (!target) return null
    if (target instanceof HTMLElement) {
      return target
    }
    if (Reflect.has(target, 'value')) {
      const val = target.value
      return getRawDom(val)
    }
    if (target.$el && target.$el instanceof HTMLElement) {
      return target.$el
    }
    return null
  }

  function getRawList (source) {
    if (source?.__v_isRef === true) {
      if (source.__v_isComputed && !source.effect?.setter) {
        console.warn('computed readonly 只读数据，不可修改，请通过 onSortEnd 自行修改')
        return null
      }
      return source.value
    }
    return source
  }

  async function createSortable() {
    await nextTick()
    let container = getRawDom(containerRef)
    let rawList = getRawList(list)
    if (!container || instance.value) return
    instance.value = new Sortable(container, {
      ...sortOptions,
      onEnd(evt) {
        if (!enabled.value) return
        const { oldIndex, newIndex } = evt
        if (oldIndex === newIndex) return
        // 数组重排，响应式更新
        if (rawList) {
          evt.item.remove() // 防止 Dom 重复 bug
          const item = rawList.splice(oldIndex, 1)[0]
          rawList.splice(newIndex, 0, item)
        }
        // 向外抛出事件
        if (typeof sortOptions.onSortEnd === 'function') {
          sortOptions.onSortEnd(evt)
        }
      },
      // 透传其他常用事件
      onStart: (evt) => sortOptions.onStart?.(evt),
      onMove: (evt) => sortOptions.onMove?.(evt),
    })
  }

  function destroySortable() {
    if (instance.value) {
      instance.value.destroy()
      instance.value = null
    }
  }

  // 监听容器DOM挂载后初始化
  const stopWatch = watch(
    containerRef,
    (el) => {
      if (el) {
        createSortable()
      } else {
        destroySortable()
      }
    },
    { flush: 'post' }
  )

  // 组件scope销毁，清理资源
  onScopeDispose(() => {
    stopWatch()
    destroySortable()
  })

  // 外部控制启用/禁用拖拽
  function setEnabled(flag) {
    enabled.value = flag
    if (instance.value) {
      instance.value.option('disabled', !flag)
    }
  }

  return {
    instance,
    enabled,
    setEnabled,
    recreate: () => {
      destroySortable()
      createSortable()
    },
  }
}