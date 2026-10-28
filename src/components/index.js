
/**
 * 动态注册全局组件
 */
import {
  AutoComplete,
  Button,
  Checkbox, CheckboxGroup,
  DatePicker, FormItemRest,
  Input,
  InputGroup, InputNumber, InputPassword, Radio,
  RadioGroup,
  RangePicker,
  Select,
  Switch,
  Tag,
  Textarea,
  Tree,
  TreeSelect
} from 'ant-design-vue'
import { AIcon } from './global/a-icon'

const components = import.meta.glob('./global/**/**.vue')

export default function install (app) {
  const componentNames = []
  const isDebug = import.meta.env.VITE_APP_DEBUG_MODE === 'true'
  // 注册全局 ant-design 组件，用于通过 h(resolvecomponent('a-xxx')) 创建
  const antComponents = {
    'a-input': Input,
    'a-textarea': Textarea,
    'a-select': Select,
    'a-input-group': InputGroup,
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
    'a-range-picker': RangePicker,
    'a-form-item-rest': FormItemRest,
    'a-tag': Tag,
    'a-tree': Tree,
  };
  for (const [key, value] of Object.entries(antComponents)) {
    if (isDebug) {
      componentNames.push(key)
    }
    app.component(key, value)
  }
  // 注册全局自定义组件
  for (const [key, value] of Object.entries(components)) {
    let name = key.slice(key.lastIndexOf('/') + 1, key.lastIndexOf('.')) // 组件名取其文件名
    if (name === 'index') { // 如果文件名是 index.vue，则取上一级目录名
      name = key.match(/\/([^/]+)\/[^/]+\.vue/)[1]
    }
    if (isDebug) {
      componentNames.push(name)
    }
    app.component(name, defineAsyncComponent(value))
  }

  app.component('AIcon', AIcon)
  if (isDebug) {
    componentNames.push('AIcon')
    console.log('注册全局组件：', componentNames.join(', '))
  }
}