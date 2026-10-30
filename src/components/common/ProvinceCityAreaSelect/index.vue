<!-- 省、省市、省市区选择器，绑定值为所选最后一级编码逗号分隔字符串，如：'110101' 或 '110101,110102' -->
<!-- 单选 -->
<!-- 省市区用法：<ProvinceCityArea v-model:value="area" /> -->
<!-- 省市用法：<ProvinceCityArea v-model:value="area" :levelNum="2" /> -->
<!-- 多选 -->
<!-- 省市区用法：<ProvinceCityArea v-model:value="area" multiple /> -->
<template>
  <a-cascader
    v-if="!props.isView"
    v-model:value="selectedValue"
    :options="currOptions"
    :fieldNames="{ label: 'n', value: 'c', children: 'd' }"
    :placeholder="currPlaceholder"
    :change-on-select="true"
    :expand-trigger="'hover'"
    v-bind="$attrs"
    @change="handleChange"
  />
  <span v-else>{{ selectedNames }}</span>
</template>

<script setup lang="ts">
import options from 'province-city-china/dist/level.min.json'

/** 省市区数据节点 */
interface AreaNode {
  /** 名称 */
  n: string
  /** 编码 */
  c: string
  /** 子级 */
  d?: AreaNode[]
}

interface Props {
  /** 省市(区)编码逗号分隔字符串, 只存放最后一级，单选：'101010'，多选：'101010,101109' */
  value?: string
  /** 层级数，省：1， 省市：2， 省市区：3 */
  levelNum?: number
  /** 占位提示文本 */
  placeholder?: string
  /** 查看模式，不会显示控件，直接显示值 */
  isView?: boolean
  /** 不可删除！为了从 $attrs 中剔除 onChange，避免 field.props 的 onChange 监听到 a-cascader 的 change 事件而冲突 */
  onChange?: (...args: unknown[]) => void
}

const props = withDefaults(defineProps<Props>(), {
  value: '',
  levelNum: 3,
  isView: false,
})

const emits = defineEmits<{
  (e: 'update:value', value: string | undefined, name: string): void
}>()

const selectedValue = ref<string[] | string[][]>([])
const currOptions = computed<AreaNode[]>(() => {
  const filterAreaTree = (tree: AreaNode[], levelNum: number, currentDepth = 1): AreaNode[] => {
    if (![1, 2, 3].includes(levelNum)) throw new Error('levelNum 仅支持 1 / 2 / 3')
    if (!Array.isArray(tree)) return []
    return tree.map(item => {
      const newItem: AreaNode = { ...item }
      const nextDepth = currentDepth + 1
      if (nextDepth <= levelNum && Array.isArray(newItem.d)) {
        newItem.d = filterAreaTree(newItem.d, levelNum, nextDepth)
      } else {
        newItem.d = undefined
      }
      return newItem
    })
  }
  return filterAreaTree(options, props.levelNum)
})
const currPlaceholder = computed(() => {
  if (props.placeholder) return props.placeholder
  return `请选择${'省市区'.substring(0, props.levelNum)}`
})
const selectedNames = computed<string>(() => {
  if (selectedValue.value && currOptions.value.length) {
    const nameArr: string[] = []
    let currItem: AreaNode | null = null
    // selectedValue.value: [100000,101100,101102] || [[100000,101100,101102], [220000,221100,221103]]
    const findName = (code: string | string[]): string => {
      let name = ''
      if (Array.isArray(code)) {
        currItem = null
        const names: string[] = []
        for (const c of code) {
          name = findName(c)
          if (name) {
            names.push(name)
          }
        }
        name = names.join('/')
      } else {
        if (!currItem) {
          currItem = currOptions.value.find(o => o.c === code) ?? null
        } else {
          currItem = currItem.d?.find(o => o.c === code) ?? null
        }
        if (currItem?.n) {
          name = currItem.n
        }
      }
      return name
    }
    for (const code of selectedValue.value) {
      const name = findName(code)
      if (name) {
        nameArr.push(name)
      }
    }
    return nameArr.join(',')
  } else {
    return ''
  }
})
// 直辖市、特别行政区 Codes，这种 code 数据的省级下面没有市，要直接跳到区，需要特殊处理
const specialCodes = ['110000', '120000', '310000', '500000', '810000', '820000']
// 还原层级时需要排除的 codes
const excludeCodes = specialCodes.map(code => code.substring(0, 2) + '0100')

watch(
  () => props.value,
  (val) => {
    setValue(val)
  },
  { immediate: true }
)

function setValue(val: string | undefined): void {
  // 将只有最后一层还原成 ant-design 组件需要的三层格式，此处特殊的直辖市、经济特区只有两层，需排除中间一层
  // '1011' => [1000, 1011] // 选择的是第二级，还原时只需还原两级
  // '110000' => [110000] // 选择的是第一级，还原时只还原一级
  // '101102' => [100000,101100,101102] // 选择的是第三级，还原时需还原三级
  // '101102,221103' => [[100000,101100,101102], [220000,221100,221103]] // 多选时，选择多个第三级，还原时每个还原出三级
  const values = val ? val.split(',') : []
  const backValues = values.map(leafCode => {
    const level = leafCode.length / 2
    const codes: string[] = []
    for (let i = 0; i < level; i++) {
      if (leafCode.substring(i * 2, i * 2 + 2) !== '00') {
        const code = leafCode.substring(0, i * 2 + 2).padEnd(leafCode.length, '0')
        if (!excludeCodes.includes(code.padEnd(6, '0'))) {
          codes.push(code)
        }
      }
    }
    return codes
  })
  if (values.length === 1) {
    selectedValue.value = backValues[0]
  } else {
    selectedValue.value = backValues
  }
}

/** cascader 绑定值类型，与 ant-design-vue 的 ValueType 保持一致 */
type CascaderValue = (string | number)[] | (string | number)[][]

async function handleChange(val: CascaderValue): Promise<void> {
  // cascader 回传的值可能含数字，统一转为字符串编码，后续逻辑按字符串处理
  const codes = isArrArr(val) ? val.map(arr => arr.map(String)) : val.map(String)
  selectedValue.value = codes
  // 只返回最后一层，并且以字符串形式逗号拼接
  // 非三级单选时：[1000,1010] => '1010'
  // 单选时：[100000,101000,101010] => '101010'
  // 多选时：[[100000,101000,101010], [100000,101000,101011]] => '101010,101011'
  const returnValue = isArrArr(codes) ? codes.map(arr => arr.at(-1)).join(',') : codes.at(-1)
  emits('update:value', returnValue, selectedNames.value)
  // await nextTick()
  // emits('update:name', selectedNames.value)
}

function isArrArr(value: CascaderValue): value is (string | number)[][] {
  return Array.isArray(value) && value.length > 0 && Array.isArray(value[0])
}
</script>

<style lang="scss" scoped>
</style>
