<!-- ant-design-vue 4 icons 选择器 -->
<!-- 用法：<icon-select v-model:value="formData.icon" /> -->
<template>
  <div class="icons-select">
    <div class="flex-x x-middle">
      <a-icon v-if="modelValue" :type="modelValue" class="mr20" style="font-size: 18px;" />
      <a-button v-if="!disabled" @click="open">请选择</a-button>
    </div>
    <CModal v-if="!disabled" ref="cModal" title="选择图标" width="900" :footer="null" centered>
      <div class="flex-x x-middle flex-wrap">
        <div
          class="icons-select__item"
          v-for="item in iconList"
          :key="item.name"
          :class="{ 'is-active': item.name === modelValue }"
          :title="item.name"
          @click="onSelectHandle(item.name)"
        >
          <component :is="item.value" />
        </div>
      </div>
    </CModal>
  </div>
</template>

<script setup>
import { icons } from '../../global/a-icon'

const props = defineProps({
  disabled: Boolean
})
const modelValue = defineModel('value')
const cModal = ref()
const iconList = computed(() => {
  if (props.disabled) return []
  return Object.keys(icons).map(key => ({ name: key, value: icons[key] }))
})

function open () {
  cModal.value?.open()
}

function onSelectHandle (name) {
  modelValue.value = name
  cModal.value?.close()
}
</script>

<style lang="less" scoped>
.icons-select {
  &__item {
    margin: 2px;
    border-radius: 5px;
    font-size: 22px;
    padding: 5px 12px;
    transition: box-shadow .3s, transform .3s;
    cursor: pointer;
    &:hover {
      box-shadow: 0 0 10px rgba(155, 155, 155, .2);
      position: relative;
      z-index: 1;
      transform: scale(1.1);
    }
    &.is-active {
      box-shadow: 0 0 10px rgba(0, 90, 150, .2);
      position: relative;
      z-index: 2;
      background-color: #97f3fb7c;
    }
  }
}
</style>
