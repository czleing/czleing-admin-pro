<!-- 首页 -->
<template>
  <div class="home-page pa20">
    <div>首页</div>
    <div v-if="isIgnoreLogin" class="mt20">当前开发环境设置了忽略登录限制，可以自由访问</div>
  </div>
</template>

<script setup>
defineOptions({
  name: 'HomePage'
})
const isIgnoreLogin = import.meta.env.VITE_APP_IGNORE_LOGIN === 'true'
</script>

<style lang="less" scoped>
.home-page {
}
</style>
