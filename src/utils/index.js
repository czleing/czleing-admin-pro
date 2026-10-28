import { Modal, message as Message } from 'ant-design-vue'
import { ExclamationCircleOutlined } from '@ant-design/icons-vue'
/**
 * 工具类
 */
/**
 * 是否为空
 * 适用参数：对象、数组、字符串
 * @param {string|object|array} value
 * @returns {Boolean}
 */
export function isEmpty (value) {
  if (value === true || value === false || value === 0) return false
  if (!value) return true
  if (typeof value === 'string') {
    return value.trim().length === 0
  } else if (Array.isArray(value)) {
    return value.length === 0
  } else if (typeof value === 'object') {
    return Object.keys(value).length === 0
  } else {
    return false
  }
}

/**
 * 是否不为空
 * 字符串，对象，数组
 * @param {string|object|array} value
 * @returns {Boolean}
 */
export function isNotEmpty (value) {
  return !isEmpty(value)
}

/**
 * 检测对象是否所有属性都为空
 * @param {Object} obj 对象
 * @param [String, Object] excludeFields 排除字段，字符串或字符串数组
 * @returns {Boolean} true:对象为空或者对象所有属性为空，false：至少有一个属性不为空
 */
export function isAllFieldEmpty (obj, excludeFields = []) {
  if (!obj) {
    return true
  }
  if (typeof obj !== 'object') {
    return false
  }
  const keys = Object.keys(obj)
  if (typeof excludeFields === 'string') {
    excludeFields = [excludeFields]
  }
  const existValue = keys.some(key => {
    if (excludeFields.includes(key)) {
      return false
    }
    return obj[key] === 0 || obj[key]
  })
  return !existValue
}

export function isDayjs (val) {
  return val && typeof val === 'object' && val.$isDayjsObject
}

/**
 * 字节格式化，字节数转为常用单位
 * @param byte
 * @returns
 */
export function byteFormat (byte) {
  if (!byte) return 0
  if (byte > 1024 << 20) {
    return (byte / (1024 << 20)).toFixed(2) + 'GB'
  } else if (byte > 1024 << 10) {
    return (byte / (1024 << 10)).toFixed(2) + 'MB'
  } else if (byte > 1024) {
    return (byte / 1024).toFixed(2) + 'KB'
  } else {
    return byte + 'B'
  }
}

/**
 * 使用 loading 执行异步函数
 */
export async function loadingRequest (loading, func, message) {
  function setLoading (bol) {
    if (typeof loading === 'function') {
      loading(bol)
    } else {
      loading.value = bol
    }
  }
  try {
    setLoading(true)
    await func()
    if (message) {
      Message.success(message)
    }
  } finally {
    setLoading(false)
  }
}

/**
 * 对话框提示确认后执行异步函数
 * option:
 * showConfirmButton
 * showCancelButton
 * confirmButtonText
 * cancelButtonText
 */
export function confirmRequest (content, title, loading, func, message, option = {}) {
  return Modal.confirm({
    title,
    content,
    icon: createVNode(ExclamationCircleOutlined),
    ...option,
    async onOk () {
      return await loadingRequest(loading, func, message)
    }
  })
}

/** 等待 duration 豪秒 */
export function sleep (duration = 0) {
  return new Promise(r => setTimeout(r, duration))
}

/**
 * 把秒 转为 xx时xx分xx秒
 * @param {number} seconds 秒
 * @param {boolean} needSecond 是否精确到秒
 */
export function toDuration (seconds = 0, needSecond = true) {
  let hour = 0
  let minute = 0
  let second = 0
  const h = 3600
  const m = 60
  hour = parseInt(seconds / h)
  minute = parseInt(seconds % h / m)
  if (needSecond) {
    second = seconds % m
  }
  return {
    hour,
    minute,
    second
  }
}

/**
 * 将xxxx转为xx万或xx亿
 * @param {Number} num 数值
 * @param {Number} digit 小数位数
 * @param {Boolean} isForceTransform 是否强制转成万/亿，false则大于9999才会转
 * @returns xx.xx万 或 xx.xx亿
 */
export function transformNum (num, digit = 2, isForceTransform = true) {
  num = Number(num)
  let unit = ''
  if ((isForceTransform && num > 0) || (!isForceTransform && num > 9999)) {
    num = num / 10000
    unit = '万'
    if (num > 9999) {
      num = num / 10000
      unit = '亿'
    }
  }
  return {
    value: Number(num.toFixed(digit)),
    unit
  }
}

/**
 * 通过分子/分母，计算商
 * @param {Number|String} numerator 分子
 * @param {Number|String} denominator 分母
 * @returns
 */
export function divide (numerator, denominator, digit = 2) {
  numerator = Number(numerator)
  denominator = Number(denominator)
  return denominator === 0 ? 0 : Number((numerator / denominator).toFixed(digit))
}

/**
 * 通过分子*100/分母，计算百分比
 * @param {Number|String} numerator 分子
 * @param {Number|String} denominator 分母
 * @returns 3 / 10 => 33.33
 */
export function calcPercent (numerator, denominator, digit = 2) {
  return Number((divide(numerator, denominator, digit + 2) * 100).toFixed(digit))
}

/**
 * 数值格式化（千分位/万分位）
 * @param {number|string} value - 原始数值
 * @param {Object} options 配置项
 * @param {number} [options.splitDigits=3] 分隔位数：3=千分位，4=万分位
 * @param {number|null} [options.digit=null] 保留小数位数，默认：null=保留原始小数不截断
 * @param {boolean} [options.fillZero=true] 小数不足时是否补0，默认true
 * @returns {string}
 */
export function numFormat (value, options = {}) {
  const { splitDigits = 3, digit = null, fillZero = true } = options;
  // 1. 异常值兜底
  if (value === null || value === undefined || value === '') {
    return '';
  }
  // 转为数字
  let num = Number(value);
  if (isNaN(num)) {
    return '';
  }
  // 处理正负
  const isNegative = num < 0;
  num = Math.abs(num);
  // 2. 处理小数位
  let integerStr, decimalStr = '';
  if (digit !== null && typeof digit === 'number') {
    // 指定小数位数
    num = num.toFixed(digit);
    [integerStr, decimalStr = ''] = num.split('.');
    if (fillZero && decimalStr.length < digit) {
      decimalStr = decimalStr.padEnd(digit, '0');
    }
  } else {
    // 保留原始小数
    const str = num.toString();
    [integerStr, decimalStr = ''] = str.split('.');
  }
  // 3. 整数部分 千分位 / 万分位 分隔
  // 从右往左按 splitDigits 切割
  integerStr = integerStr.split('').reverse().join('');
  const chunks = [];
  for (let i = 0; i < integerStr.length; i += splitDigits) {
    chunks.push(integerStr.slice(i, i + splitDigits));
  }
  integerStr = chunks.join(',').split('').reverse().join('');
  // 4. 拼接结果
  let result = integerStr;
  if (decimalStr) {
    result += `.${decimalStr}`;
  }
  if (isNegative) {
    result = `-${result}`;
  }
  return result;
}

/**
 * 字符串替换处理
 * stringStar('13412341234', 3, 4) => 134****1234
 * @param {String} value 需要处理的字符串
 * @param {Number} startLen 字符串左边保留字符长度
 * @param {Number} endLen 字符串右边保留字符串长度
 * @param {String} mark 非保留字符串替换字符
 * @param {*} markLen 被替换成的字符长度
 * @returns 处理后的字符串
 */
export function stringStar (value, startLen, endLen, mark = '*', markLen) {
  if (typeof value === 'number') value = value.toString()
  if (typeof value !== 'string') return value
  if (value.length < startLen + endLen) return value
  markLen = markLen ?? value.length - startLen - endLen
  var star = new Array(markLen).fill(mark).join('')
  var startStr = value.slice(0, startLen)
  var endStr = value.slice(-Math.abs(endLen))
  return startStr + star + endStr
}

/** 获得一个值，可能来源于一个函数的结果 */
export function getFnValue (value, ...args) {
  if (typeof value === 'function') {
    return value(...args)
  } else {
    return value
  }
}

/**
 * 处理图片资源，自动补全base64前缀，兼容url，相对路径 / base64字符串
 * @param {string|null|undefined} text 图片url 或者 base64字符串
 * @returns {string} 可直接赋值给 img.src 的值，空输入返回 ''
 */
export function getImageSrcData (text) {
  if (!text) return '';
  if (typeof text !== 'string') return text;
  const str = String(text).trim();
  if (!str) return '';
  if (str.startsWith('data:image/')) {
    return str;
  }
  const isPureBase64 = /^[A-Za-z0-9+/=]+$/.test(str);
  if (isPureBase64) {
    return `data:image/png;base64,${str}`;
  }
  return getFullUrl(str);
}

/** 获取资源全地址 */
export function getFullUrl (path) {
  if (!path) return ''
  if (/http.*/.test(path) || path.indexOf(import.meta.env.VITE_APP_RESOURCE_API) === 0) {
    return path
  }
  return import.meta.env.VITE_APP_RESOURCE_API + path
}

/**
 * 列表转树
 * @param {Array} list 列表数据
 * @param {String} rootParentId 根级节点ID
 * @param {String} idField id 字段名
 * @param {String} parentIdField parentId 字段名
 * @param {String} childrenField children 字段名
 * @returns 树形数据
 */
export function listToTree (list, rootParentId = 0, idField = 'id', parentIdField = 'parentId', childrenField = 'children') {
  const tree = []
  const idMap = {} // { key: id, value: {node} }
  if (isEmpty(list)) return tree
  list.forEach(item => {
    const id = item[idField]
    const parentId = item[parentIdField]
    item.children = undefined
    if (!parentId || parentId === rootParentId) {
      tree.push(item)
    }
    idMap[id] = item
  })
  list.forEach(item => {
    const parentId2 = item[parentIdField]
    if (parentId2) {
      let parent = idMap[parentId2]
      if (parent && isEmpty(parent[childrenField])) {
        parent[childrenField] = [item]
      } else if (parent) {
        parent[childrenField].push(item)
      } else if (import.meta.env.VITE_APP_DEBUG_MODE === 'true') {
        console.error(`id 为 ${parentId2} 的节点不存在`)
      }
    }
  })
  return tree
}

/**
 * 给:root设置css变量，不污染html行内style
 * @param {Object} vars 键值对 { 'color': '#fff', 'size': '16px' }
 */
export function setRootCssVars (prex = '--ant-', vars, id = 'dynamic-root-vars') {
  if (!vars) return
  let styleEl = document.getElementById(id);
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = id;
    document.head.appendChild(styleEl);
  }
  // 拼接css文本
  const cssText = Object.entries(vars).map(([key, val]) => `${prex}${key}: ${val};`).join('\n');
  styleEl.textContent = `:root { ${cssText} }`;
}
