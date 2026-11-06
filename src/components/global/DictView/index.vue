<!-- 字典预览 -->
<template>
  <div class="dict-tag">
    <template v-for="(item, index) in currItems" :key="index">
      <span
        v-if="item.label && (!item.tagType || item.tagType === 'default')"
        class="a-tag"
        :class="item.cssClass"
      >{{ item.label }}</span>
      <a-tag
        v-else-if="item.label"
        :bordered="false"
        :color="item.tagType"
        :class="item.cssClass"
      >
        {{ item.label }}
      </a-tag>
      <template v-else>
        {{ item.value }}
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useDict } from '@/hooks/useDict'

/** 字典项 */
interface DictItem {
  value: string | number
  label?: string
  tagType?: import('ant-design-vue').TagProps['color']
  cssClass?: string
}

const props = defineProps({
  dictType: {
    type: String,
    default: ''
  },
  // 支持：id、id数组、id逗号分隔字符串
  value: {
    type: [Number, String, Array],
    default: undefined
  },
  // 当未找到匹配的数据时，显示value
  showValue: {
    type: Boolean,
    default: true
  }
})

const currItems = ref<DictItem[]>([])
const { dict } = useDict([props.dictType], () => {
  setValue(props.value)
})

watch(
  () => [props.value],
  (val) => {
    setValue(val)
  }
)

function setValue(value: unknown): void {
  if (typeof value === 'string') {
    value = value.split(',')
  } else if (typeof value === 'number') {
    value = [String(value)]
  }
  const dictItems = dict[props.dictType] as DictItem[] | undefined
  currItems.value = ((value as (string | number)[])?.map((val) => {
    const dictItem = dictItems?.find((item) => String(item.value) === String(val))
    return dictItem ?? (props.showValue ? { value: val, label: String(val) } : { value: val })
  }) ?? []) as DictItem[]
}
</script>

<style lang="scss" scoped>
.a-tag + .a-tag {
  margin-left: 10px;
}
</style>
