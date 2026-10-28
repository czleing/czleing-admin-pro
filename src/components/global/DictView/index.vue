<!-- 字典预览 -->
<template>
  <div class="dict-tag">
    <template v-for="(item, index) in currItems">
      <template v-if="item.label">
        <span
          class="a-tag"
          v-if="item.tagType === 'default' || !item.tagType"
          :key="'s_' + index"
          :class="item.cssClass"
        >{{ item.label }}</span>
        <a-tag
          v-else
          :bordered="false"
          :key="'t_' + index"
          :color="item.tagType"
          :class="item.cssClass"
        >
          {{ item.label }}
        </a-tag>
      </template>
      <template v-else>
        {{ item.value }}
      </template>
    </template>
  </div>
</template>

<script setup>
import { useDict } from '@/hooks/useDict.js'

const props = defineProps({
  dictType: String,
  // 支持：id、id数组、id逗号分隔字符串
  value: [Number, String, Array],
  // 当未找到匹配的数据时，显示value
  showValue: {
    type: Boolean,
    default: true
  }
})

const currItems = ref()
const dict = useDict([props.dictType], dicts => {
  setValue(props.value)
})

watch(
  () => [props.value],
  (val) => {
    setValue(val)
  }
)

function setValue (value) {
  if (typeof value === 'string') {
    value = value.split(',')
  } else if (typeof value === 'number') {
    value = [String(value)]
  }
  currItems.value = value?.map(val => {
    const dictItem = dict[props.dictType]?.find(item => item.value === val)
    return dictItem ?? (props.showValue ? { value: val } : {})
  })
}
</script>

<style lang="scss" scoped>
.a-tag + .a-tag {
  margin-left: 10px;
}
</style>
