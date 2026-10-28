import copy from './modules/copy.js'
import draggable from './modules/draggable.js'
import hasPermi from './modules/hasPermi.js'
import noPermi from './modules/noPermi.js'

const directives = [
  copy,
  draggable,
  hasPermi,
  noPermi
]

export default {
  install (app) {
    directives.forEach(di => {
      app.directive(di.name, di.directive)
    })
  }
}