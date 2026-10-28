<template>
  <div class="login-form">
    <div class="login-form__body">
      <div class="tc">
        <h2 class="login-form__heading">
          欢迎您登录
        </h2>
      </div>
      <a-form ref="aFromModel" :model="form" :rules="rules" @finish="onSubmitHandle">
        <a-form-item name="account">
          <a-input v-model:value="form.account" :max-length="11" placeholder="用户名">
            <template #prefix>
              <a-icon type="UserOutlined" class="text-gray" />
            </template>
          </a-input>
        </a-form-item>
        <a-form-item name="password">
          <a-input-password v-model:value="form.password" :max-length="11" placeholder="密码" type="password">
            <template #prefix>
              <a-icon type="LockOutlined" class="text-gray" />
            </template>
          </a-input-password>
        </a-form-item>
        <a-form-item name="code">
          <div class="flex-x">
            <a-input ref="codeRef" v-model:value="form.code" :max-length="6" placeholder="校验码">
              <template #prefix>
                <a-icon type="SafetyCertificateOutlined" class="text-gray" />
              </template>
            </a-input>
            <a-spin :spinning="spinning">
              <img :src="codeSrc" class="login-form__code pointer radius5 ml5" @click="getCode">
            </a-spin>
          </div>
        </a-form-item>
        <div class="flex-x-between">
          <a-checkbox v-model:checked="checked">记住密码</a-checkbox>
          <a href="javascript:;">忘记密码</a>
        </div>
        <a-button
          class="login-form__submit"
          type="primary"
          size="large"
          :loading="loading"
          :disabled="loading"
          html-type="submit"
        >
          登录
        </a-button>
      </a-form>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth-store.js'
import { useCacheStore } from '@/stores/cache-store.js'
import { message } from 'ant-design-vue'


const loading = ref(false)
const spinning = ref(false)
const form = reactive({
  account: undefined,
  password: undefined,
  code: undefined,
  uuid: undefined
})
const codeSrc = ref()
const codeRef = ref()
const checked = ref(false)
const rules = {
  account: [{ required: true, message: '请输入用户名' }],
  password: [{ required: true, message: '请输入密码' }],
  code: [{ required: true, message: '请输入校验码' }]
}
const authStore = useAuthStore()
const cacheStore = useCacheStore()

onMounted(() => {
  getCode()
  const accountInfo = cacheStore.getLoginAccount()
  if (accountInfo) {
    form.account = accountInfo.account,
    form.password = accountInfo.password
  }
})

async function getCode () {
  try {
    spinning.value = true
    form.code = undefined
    form.uuid = undefined
    const result = await authStore.getCode()
    result?.img && (codeSrc.value = 'data:image/gif;base64,' + result.img)
    form.uuid = result?.uuid
    codeRef.value.input.focus()
  } finally {
    spinning.value = false
  }
}

async function onSubmitHandle (values) {
  try {
    loading.value = true
    await authStore.login({
      ...form,
      remember: checked.value
    })
    message.success('登录成功')
  } catch (e) {
    getCode()
  } finally {
    loading.value = false
  }
}
</script>

<style lang="less" scoped>
.login-form {
  padding: 36px;
  &__heading {
    font-size: 26px;
    line-height: 39px;
    margin-bottom: 36px;
    color: #333;
  }
  &__code {
    height: 32px;
    min-height: 32px;
    min-width: 85px;
    background-color: #a9a9a954;
  }
  &__submit {
    margin-top: 20px;
    width: 100%;
  }
}
</style>
