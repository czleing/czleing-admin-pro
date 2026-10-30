/**
 * sortablejs 拖拽排序 hook
 * @param containerRef 拖拽容器 DOM 或 ref，也可以是自定义组件 ref 或 HTMLElement
 * @param list 源数据数组（reactive / ref 可读可写），传了则自动修改排序
 * @param options Sortable 配置项（含扩展的 onSortEnd / onStart / onMove）
 */
import { ref, onScopeDispose, watch, nextTick, type Ref } from 'vue'
import Sortable, { type MoveEvent } from 'sortablejs'

interface SortableOptions extends Record<string, unknown> {}

interface ExtendedSortableOptions extends SortableOptions {
  onSortEnd?: (evt: { oldIndex: number; newIndex: number; item: HTMLElement }) => void
  onStart?: (evt: MoveEvent) => void
  onMove?: (evt: MoveEvent) => boolean | 1 | -1
}

type SortableTarget = HTMLElement | Ref<HTMLElement | null | undefined> | null | undefined

export function useSortable(containerRef: SortableTarget, list?: unknown[], options: ExtendedSortableOptions = {}) {
  const instance = ref<InstanceType<typeof Sortable> | null>(null)
  const enabled = ref(true)

  // 默认配置
  const defaultOpts: SortableOptions = {
    animation: 150,
    handle: '',
    filter: '',
    ignore: 'input,textarea',
    ghostClass: 'sortable-ghost',
    chosenClass: 'sortable-chosen',
    dragClass: 'sortable-drag',
  }

  // 合并配置
  const sortOptions: ExtendedSortableOptions = { ...defaultOpts, ...options }

  function getRawDom(target: SortableTarget): HTMLElement | null {
    if (!target) return null
    if (target instanceof HTMLElement) return target
    // 如果是 ref
    if (Reflect.has(target, 'value')) {
      const val = (target as { value: unknown }).value as SortableTarget
      return getRawDom(val)
    }
    // 如果是 Vue 组件实例
    const el = (target as { $el?: unknown }).$el as HTMLElement | undefined
    if (el && el instanceof HTMLElement) return el
    return null
  }

  function getRawList(source: unknown): unknown[] | null {
    if (source && typeof source === 'object' && '__v_isRef' in (source as object)) {
      const refObj = source as { __v_isRef: boolean; __v_isComputed?: boolean; effect?: { setter?: unknown }; value: unknown[] }
      if (refObj.__v_isComputed && !refObj.effect?.setter) {
        console.warn('computed readonly 只读数据，不可修改，请通过 onSortEnd 自行修改')
        return null
      }
      return refObj.value as unknown[]
    }
    return source as unknown[] | null
  }

  async function createSortable(): Promise<void> {
    await nextTick()
    const container = getRawDom(containerRef)
    const rawList = getRawList(list)
    if (!container || instance.value) return
    instance.value = new Sortable(container, {
      ...sortOptions,
      onEnd: (evt: unknown) => {
        if (!enabled.value) return
        const e = evt as MoveEvent
        const { oldIndex, newIndex } = e
        if (oldIndex === undefined || newIndex === undefined) return
        if (oldIndex === newIndex) return
        // 数组重排，响应式更新
        if (rawList) {
          const itemEl = (e as unknown as { item: HTMLElement }).item
          itemEl?.remove() // 防止 Dom 重复 bug
          const item = rawList.splice(oldIndex!, 1)[0]
          rawList.splice(newIndex!, 0, item)
        }
        // 向外抛出事件
        if (typeof sortOptions.onSortEnd === 'function') {
          const itemEl = (e as unknown as { item: HTMLElement }).item
          sortOptions.onSortEnd({
            oldIndex: oldIndex!,
            newIndex: newIndex!,
            item: itemEl,
          })
        }
      },
      onStart: (evt: MoveEvent) => sortOptions.onStart?.(evt),
      onMove: (evt: MoveEvent) => sortOptions.onMove?.(evt),
    })
  }

  function destroySortable(): void {
    if (instance.value) {
      instance.value.destroy()
      instance.value = null
    }
  }

  // 监听容器 DOM 挂载后初始化
  const stopWatch = watch(
    () => getRawDom(containerRef),
    (el) => {
      if (el) {
        createSortable()
      } else {
        destroySortable()
      }
    },
    { flush: 'post' }
  )

  // 组件 scope 销毁，清理资源
  onScopeDispose(() => {
    stopWatch()
    destroySortable()
  })

  function setEnabled(flag: boolean): void {
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
