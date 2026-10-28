<!-- 实时显示当前日期时间的组件 -->
<template>
  <span>{{ time.format(format) }}</span>
</template>

<script setup>
import dayjs from "dayjs"

const props = defineProps({
  format: {
    type: String,
    default: 'HH:mm:ss'
  }
})
const time = ref(dayjs())
const timer = ref()

const hasSecond = computed(() => props.format.includes('ss'))
const duration = computed(() => hasSecond.value ? 1000 : 60000)

function run () {
  timer.value = setTimeout(() => {
    time.value = dayjs()
    run()
  }, duration.value)
}

onMounted(() => {
  run()
})
onUnmounted(() => {
  clearInterval(timer.value)
})
</script>
