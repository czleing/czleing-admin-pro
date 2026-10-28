<template>
  <div class="exception">
    <div class="exception__img">
      <img :src="config[type]?.img" />
    </div>
    <div class="exception__content">
      <h1>{{ config[type]?.title }}</h1>
      <div class="exception__desc">
        {{ config[type]?.desc }}
      </div>
      <div class="exception__action">
        <a-button type="primary" @click="goHome"> 返回首页 </a-button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  type: String
})
const config = {
  403: {
    img: 'https://gw.alipayobjects.com/zos/rmsportal/wZcnGqRDyhPOEYFcZDnb.svg',
    title: '403',
    desc: '抱歉，你无权访问该页面'
  },
  404: {
    img: 'https://gw.alipayobjects.com/zos/rmsportal/KpnpchXsobRgLElEozzI.svg',
    title: '404',
    desc: '抱歉，你访问的页面不存在或仍在开发中'
  }
}
const router = useRouter()
function goHome() {
  router.push({ name: 'index' })
}
</script>

<style lang="less" scoped>
.exception {
  min-height: 500px;
  height: 80%;
  align-items: center;
  text-align: center;
  margin-top: 150px;
  &__img {
    display: inline-block;
    padding-right: 52px;
    zoom: 1;
    img {
      height: 360px;
      max-width: 430px;
    }
  }
  &__content {
    display: inline-block;
    flex: auto;
    h1 {
      color: #434e59;
      font-size: 72px;
      font-weight: 600;
      line-height: 72px;
      margin-bottom: 24px;
    }
  }
  &__desc {
    color: rgba(0, 0, 0, 0.45);
    font-size: 20px;
    line-height: 28px;
    margin-bottom: 16px;
  }
}
</style>
