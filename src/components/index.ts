/**
 * 动态注册全局组件
 */
import {
  AutoComplete,
  Button,
  Checkbox,
  CheckboxGroup,
  DatePicker,
  DateRangePicker,
  Input,
  InputNumber,
  InputPassword,
  Radio,
  RadioGroup,
  Select,
  SpaceCompact,
  Switch,
  Tag,
  TextArea,
  Tree,
  TreeSelect,
} from 'antdv-next'
import type { App, Component } from 'vue'
import { AIcon } from './global/a-icon'

const componentModules = import.meta.glob<{ default: Component }>('./global/**/**.vue')

export default function install(app: App): void {
  const componentNames: string[] = []
  const isDebug = import.meta.env.VITE_APP_DEBUG_MODE === 'true'
  // 注册全局 antdv-next 组件，用于通过 h(resolvecomponent('a-xxx')) 创建
  const antComponents: Record<string, Component> = {
    'a-input': Input,
    'a-textarea': TextArea,
    'a-select': Select,
    'a-space-compact': SpaceCompact,
    'a-input-number': InputNumber,
    'a-input-password': InputPassword,
    'a-button': Button,
    'a-radio': Radio,
    'a-radio-group': RadioGroup,
    'a-checkbox': Checkbox,
    'a-checkbox-group': CheckboxGroup,
    'a-switch': Switch,
    'a-auto-complete': AutoComplete,
    'a-tree-select': TreeSelect,
    'a-date-picker': DatePicker,
    'a-range-picker': DateRangePicker,
    'a-tag': Tag,
    'a-tree': Tree,
  }
  for (const [key, value] of Object.entries(antComponents)) {
    if (isDebug) {
      componentNames.push(key)
    }
    app.component(key, value)
  }
  // 注册全局自定义组件
  for (const [key, loader] of Object.entries(componentModules)) {
    let name = key.slice(key.lastIndexOf('/') + 1, key.lastIndexOf('.')) // 组件名取其文件名
    if (name === 'index') { // 如果文件名是 index.vue，则取上一级目录名
      const dirName = key.match(/\/([^/]+)\/[^/]+\.vue/)?.[1]
      if (dirName) {
        name = dirName
      }
    }
    if (isDebug) {
      componentNames.push(name)
    }
    app.component(name, defineAsyncComponent(loader))
  }

  app.component('AIcon', AIcon)
  if (isDebug) {
    componentNames.push('AIcon')
    console.log('注册全局组件：', componentNames.join(', '))
  }
}
