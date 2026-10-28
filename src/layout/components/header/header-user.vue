<template>
  <div class="header-user">
    <a-dropdown v-if="authStore.hasLogin" class="">
      <a-space class="pointer">
        <a-avatar :src="getFullUrl(authStore.userInfo.avatar) || DefaultAvatar" class="shadow1">
          <!-- <img :src="DefaultAvatar" width="33" /> -->
          <UserOutlined />
        </a-avatar>
        <span class="header-user-name">
          {{ authStore.userInfo.nickName }}
        </span>
        <CaretDownOutlined />
      </a-space>
      <template #overlay>
        <a-menu>
          <a-menu-item @click="toPersonalCenter">
            <span>
              <UserOutlined />
              {{ $t('frame.personalCenter') }}
            </span>
          </a-menu-item>
          <a-menu-item @click="authStore.logout">
            <span>
              <LogoutOutlined />
              {{ $t('frame.logout') }}
            </span>
          </a-menu-item>
        </a-menu>
      </template>
    </a-dropdown>
    <span v-else class="username" @click="toLogin">{{ $t('frame.notLogin') }}</span>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth-store'
import { CaretDownOutlined, LogoutOutlined, UserOutlined } from '@ant-design/icons-vue'
import DefaultAvatar from '@/assets/images/avatar.jpeg'
import { getFullUrl } from '@/utils/index.js'

const authStore = useAuthStore()
const router = useRouter()
authStore.getUserInfo(true)

function toLogin () {
  router.push({ name: 'login' })
}
function toPersonalCenter () {
  router.push('/personal-center')
}
</script>

<style lang="less" scoped>
</style>
