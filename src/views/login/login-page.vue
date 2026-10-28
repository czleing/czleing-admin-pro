<template>
  <div class="login_page flex-y-center">
    <div class="login_page__modal flex-x-center">
      <div class="login_page__modal__logo flex-y-center">
        <img class="img" :src="setting.logo">
        <div class="title text-black bold my10 em15">
          {{ setting.systemName }}
        </div>
        <div class="sub-title">
          {{ setting.systemDesc }}
        </div>
      </div>
      <div class="login_page__modal__form">
        <a-config-provider :theme="{
          algorithm: theme.defaultAlgorithm
        }">
          <LoginForm />
        </a-config-provider>
      </div>
    </div>
    <footer class="login_page__footer">
      <a :href="setting.copyrightLink" target="_blank">
        <a-icon type="CopyrightOutlined" />
        {{ setting.copyright }}
      </a>
    </footer>
  </div>
</template>

<script setup>
import LoginForm from './components/login-page-form.vue'
import settings from '@/config/setting.js'
import { theme } from 'ant-design-vue'

const setting = settings.websiteInfo
</script>
<style lang="less" scoped>
.login_page {
  min-height: 100vh;
  background: #0787c6 url('/login-bg.jpeg') center no-repeat;
  background-size: cover;
  &__modal {
    background-color: rgba(255, 255, 255, .1) !important;
    backdrop-filter: saturate(110%) blur(10px);
    border: solid var(--ant-lineWidth) rgba(255, 255, 255, .1);
    border-radius: 5px;
    overflow: hidden;
    align-items: stretch;
    &__logo {
      user-select: none;
      padding: 20px 40px;
      // height: 400px;
      flex: 1;
      min-width: 380px;
      background: #a7d2ff66;
      .img {
        width: 80px;
        height: 80px;
        object-fit: contain;
        display: block;
      }
      .title {
      }
      .sub-title {
        color: #3f3f3f;
      }
    }
    &__form {
      flex: 1;
      min-width: 380px;
      background-color: rgba(255, 255, 255, .7);
      padding: 20px;
    }
  }
  &__footer {
    position: absolute;
    bottom: 20px;
    width: 100%;
    text-align: center;
    font-size: 12px;
    line-height: 1.5;
    a {
      color: rgba(58, 58, 58, 0.9);
      text-shadow: 0 0 1px rgb(255, 255, 255);
    }
  }
}
</style>
