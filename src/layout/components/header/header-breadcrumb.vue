<!-- 面包屑 -->
<template>
  <a-breadcrumb :routes="routes">
    <template #itemRender="{ route }">
      <a-icon v-if="route.icon" :type="route.icon" />
      {{ route.title }}
    </template>
  </a-breadcrumb>
</template>

<script setup>
import { useMenuStore } from '@/stores/menu-store.js'

const route = useRoute()
const menuStore = useMenuStore()

const routes = computed(() => route.matched.filter(item => item.path !== '/').map(item => ({
  path: item.path,
  title: item.meta?.title,
  icon: item.meta?.icon
})))
</script>

<style lang="scss" scoped>
</style>
