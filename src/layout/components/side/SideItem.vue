<template>
  <a-sub-menu :key="menuInfo.path">
    <template v-if="menuInfo.meta?.icon" #icon>
      <a-icon :type="menuInfo.meta.icon" class="ml5" />
    </template>
    <template #title>{{ menuInfo.meta.title }}</template>
    <template v-for="item in menuInfo.children" :key="item.path">
      <template v-if="item.meta?.hidden !== true && !item.children">
        <a-menu-item
          :key="item.path"
          @click="handleMenuItem(item)"
        >
          <template #icon>
            <a-icon v-if="item.meta.icon && item.meta.icon !== '#'" :type="item.meta.icon" class="ml5" />
          </template>
          {{ item.meta.title }}
        </a-menu-item>
      </template>
      <template v-else-if="item.meta?.hidden !== true ">
        <SideItem
          :menu-info="item"
          :key="item.path"
          @menu-click="handleMenuItem"
        />
      </template>
    </template>
  </a-sub-menu>
</template>

<script setup>
defineOptions({
  name: 'SideItem'
})
const props = defineProps({
  menuInfo: {
    type: Object,
    default: () => ({})
  }
})

// 定义可触发的事件
const emit = defineEmits(['menu-click'])

const handleMenuItem = item => {
  // 触发自定义事件
  emit('menu-click', item)
}
</script>

<style scoped></style>
