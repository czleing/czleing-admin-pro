<template>
  <div class="header-fullscreen">
    <a-tooltip placement="bottom" :title="!isFullscreen ? $t('frame.fullscreen') : $t('frame.exitFullscreen')">
      <span class="pointer" @click="toggle">
        <FullscreenExitOutlined v-if="isFullscreen" class="font18" />
        <FullscreenOutlined v-else class="font18" />
      </span>
    </a-tooltip>
  </div>
</template>

<script setup>
import { useFullscreen } from '@vueuse/core'
import { FullscreenExitOutlined, FullscreenOutlined } from '@ant-design/icons-vue'

const { isFullscreen, toggle } = useFullscreen()

</script>

<style lang="scss" scoped>
</style>
