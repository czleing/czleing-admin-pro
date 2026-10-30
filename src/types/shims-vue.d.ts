/**
 * Vue SFC 模块声明
 * 让 TS 正确识别 .vue 单文件组件
 */
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>
  export default component
}

/**
 * @wangeditor/editor-for-vue 类型声明修复
 * package.json 的 exports 导致 vue-tsc 无法正确解析 d.ts
 */
declare module '@wangeditor/editor-for-vue' {
  import type { DefineComponent } from 'vue'
  export const Editor: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>
  export const Toolbar: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>
  export default { Editor, Toolbar }
}

/** sortablejs 暂存声明 */
declare module 'sortablejs' {
  const Sortable: new (el: HTMLElement, opts?: Record<string, unknown>) => { destroy(): void; option(key: string, val?: unknown): void; [key: string]: unknown }
  export default Sortable
  export interface Options extends Record<string, unknown> {}
  export interface MoveEvent {
    oldIndex?: number
    newIndex?: number
    item?: HTMLElement
    from?: HTMLElement
    to?: HTMLElement
    [key: string]: unknown
  }
}

/** province-city-china 层级数据无类型声明，避免 TS 推断超大 JSON 字面量类型 */
declare module 'province-city-china/dist/level.min.json' {
  interface AreaNode {
    /** 名称 */
    n: string
    /** 编码 */
    c: string
    /** 子级 */
    d?: AreaNode[]
  }
  const options: AreaNode[]
  export default options
}
