<!-- 个人中心 -->
<template>
  <div class="personal-center">
    <div class="flex-x x-stretch gap10">
      <a-card class="left shadow2" title="个人信息">
        <a-card-meta :title="userInfo.nickName" :description="userInfo?.dept?.deptName">
          <template #avatar>
            <img :src="getFullUrl(userInfo.avatar) || DefaultAvatar" class="avatar shadow1">
          </template>
        </a-card-meta>
        <div class="border-top mt20 pt10">
          <span>用户昵称：</span>
          <span>{{ userInfo.nickName }}</span>
        </div>
        <div class="border-top mt10 pt10">
          <span>登录账号：</span>
          <span>{{ userInfo.userName }}</span>
        </div>
        <div class="border-top mt10 pt10">
          <span>手机号码：</span>
          <span>{{ userInfo.phonenumber }}</span>
        </div>
        <div class="border-top mt10 pt10">
          <span>所属部门：</span>
          <span>{{ userInfo?.dept?.deptName }}</span>
        </div>
        <div class="border-top mt10 pt10">
          <span>用户类型：</span>
          <span>{{ EUserType._of(userInfo.userType) }}</span>
        </div>
        <div class="border-top mt10 pt10">
          <span>电子邮箱：</span>
          <span>{{ userInfo.email || '-' }}</span>
        </div>
      </a-card>
      <a-card class="center shadow2 flex-auto" title="修改个人信息">
        <CForm isEdit :detail="userInfo" primaryKey="userId" :formConfig="infoFormConfig" :onSubmitHandle="onInfoSubmitHandle" confirmText="保存" :showCancel="false" confirmAlign="center" />
      </a-card>
      <a-card class="right shadow2" title="修改密码">
        <CForm isAdd :formConfig="pwdFormConfig" :onSubmitHandle="onPwdSubmitHandle" confirmText="保存" :showCancel="false" confirmAlign="center" />
      </a-card>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth-store.js'
import { message } from 'ant-design-vue'
import DefaultAvatar from '@/assets/images/avatar.jpeg'
import { EUserType, EControlType } from '@/enum/index.js'
import CForm from '@/components/crud/components/c-form.vue'
import axios from '@/api/index.js'
import { getFullUrl } from '@/utils/index.js'

const authStore = useAuthStore()
const userInfo = computed(() => authStore.userInfo)

const infoFormConfig = computed(() => {
  return {
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
    cols: 1, // 一行显示几列
    autoReset: false,
    // 表单字段
    fields: [
      {
        label: '头像',
        fieldName: 'avatar',
        type: EControlType.eImageUpload,
        props: {
          maxCount: 1,
          data: { prefix: 'avatar' } // 将文件放到服务器文件目录的 avatar 目录下，默认 temp
        }
      },
      {
        label: '用户昵称',
        fieldName: 'nickName',
        type: EControlType.eInput,
        required: true,
        props: {
          maxlength: 8
        }
      },
      {
        label: '手机号码',
        fieldName: 'phonenumber',
        type: EControlType.eInput,
        required: true,
        rules: {
          pattern: new RegExp(/^1[3456789]\d{9}$/),
          message: '请输入正确的手机号码',
          trigger: 'change'
        },
        props: {
          maxlength: 11
        }
      },
      {
        label: '邮箱地址',
        fieldName: 'email',
        type: EControlType.eInput,
        // required: true,
        rules: {
          type: 'email',
          message: '请输入正确的邮箱地址',
          trigger: 'change'
        },
        props: {
        }
      },
      {
        label: '用户性别',
        fieldName: 'sex',
        type: EControlType.eRadio,
        props: {
          dictType: 'sys_user_sex'
        }
      }
    ]
  }
})

async function onInfoSubmitHandle (submitData) {
  await axios.post('/system/user/profile/update', submitData)
  message.success('保存成功')
  // 更新本地缓存
  authStore.getUserInfo(true)
}

const pwdFormConfig = computed(() => {
  return {
    labelCol: { span: 7 },
    wrapperCol: { span: 17 },
    cols: 1, // 一行显示几列
    // 表单字段
    fields: [
      {
        label: '旧密码',
        fieldName: 'oldPassword',
        type: EControlType.eInput,
        required: true,
        props: {
          type: 'password',
          maxlength: 20
        }
      },
      {
        label: '新密码',
        fieldName: 'newPassword',
        type: EControlType.eInput,
        required: true,
        rules: [
          { required: true, message: '请输入密码' },
          { min: 8, message: '密码至少8位' }
        ],
        props: {
          type: 'password',
          maxlength: 20
        }
      },
      {
        label: '确认新密码',
        fieldName: 'confirmPassword',
        type: EControlType.eInput,
        required: true,
        rules: (formData) => [
          { required: true, message: '请输入确认密码' },
          { min: 8, message: '密码至少8位' },
          {
            validator (field, value) {
              if (value !== formData.newPassword) {
                return Promise.reject('新密码和确认新密码不一致')
              }
              if (value && value === formData.oldPassword) {
                return Promise.reject('新密码不能与旧密码一致')
              }
              return Promise.resolve()
            }
          }
        ],
        props: {
          type: 'password',
          maxlength: 20
        }
      }
    ]
  }
})

async function onPwdSubmitHandle (submitData) {
  await axios.post('/system/user/profile/updatePassword', {
    oldPassword: submitData.oldPassword,
    newPassword: submitData.newPassword
  })
  message.success('保存成功')
}
</script>

<style lang="scss" scoped>
.personal-center {
  .left {
    width: 300px;
    min-width: 300px;
    .avatar {
      width: 60px;
      height: 60px;
      object-fit: cover;
      border-radius: 60px;
    }
  }
  .right {
    width: 400px;
    min-width: 400px;
  }
}
</style>
