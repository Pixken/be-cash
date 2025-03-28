<script setup lang='ts'>
import { IonContent, IonPage } from '@ionic/vue'
import { useForm } from 'vee-validate';
import * as yup from 'yup';
import userApi from '@/api/user';
const { errors, handleSubmit, defineField } = useForm({
  validationSchema: yup.object({
    email: yup.string().email('请输入正确的邮箱').required('请输入邮箱'),
    password: yup.string().min(6, '密码长度至少为6位').required('请输入密码'),
    confirmPassword: yup.string().min(6, '密码长度至少为6位').oneOf([yup.ref('password')], '密码不一致').required('请确认密码'),
    code: yup.string().required('请输入验证码'),
  }),
});

// Creates a submission handler
// It validate all fields and doesn't call your function unless all fields are valid
const onSubmit = handleSubmit(values => {
  userApi.register(values).then(res => {
    console.log(res)
  }).catch(err => {
    console.log(err)
  })
});

const [email, emailAttrs] = defineField('email');
const [password, passwordAttrs] = defineField('password');
const [confirmPassword, confirmPasswordAttrs] = defineField('confirmPassword');
const [code, codeAttrs] = defineField('code');
</script>

<template>
  <ion-page class="h-full flex flex-col items-center bg-white">
    <be-header title="注册账号" show-back />
    <ion-content class="w-full flex flex-col items-center justify-center">
      <div class="w-full flex flex-col items-center justify-center p-6">
        <p class="text-gray-500 text-left w-full">创建一个账户，开始管理您的财务</p>
        <form @submit="onSubmit" class="flex flex-col gap-2 mt-4 w-full">
          <label for="email" class="text-gray-500">邮箱</label>
          <input type="text" id="email" v-model="email" v-bind="emailAttrs"
            class="w-full block h-12 p-2 rounded-md border border-gray-300"
            :class="{ 'border-red-500': errors.email }" placeholder="请输入邮箱" />
          <span class="text-red-500 block h-4">{{ errors.email }}</span>

          <label for="password" class="text-gray-500">设置密码</label>
          <input type="password" id="password" v-model="password" v-bind="passwordAttrs"
            class="w-full block h-12 p-2 rounded-md border border-gray-300"
            :class="{ 'border-red-500': errors.password }" placeholder="请输入密码" />
          <span class="text-red-500 block h-4">{{ errors.password }}</span>

          <label for="confirmPassword" class="text-gray-500">确认密码</label>
          <input type="password" id="confirmPassword" v-model="confirmPassword" v-bind="confirmPasswordAttrs"
            class="w-full block h-12 p-2 rounded-md border border-gray-300"
            :class="{ 'border-red-500': errors.confirmPassword }" placeholder="请输入密码" />
          <span class="text-red-500 block h-4">{{ errors.confirmPassword }}</span>

          <label for="code" class="text-gray-500">验证码</label>
          <div class="flex items-center gap-2">
            <input type="text" id="code" v-model="code" v-bind="codeAttrs"
              class="w-full block h-12 p-2 rounded-md border border-gray-300" :class="{ 'border-red-500': errors.code }"
              placeholder="请输入验证码" />
            <img src="" alt="验证码" class="w-48 h-12 rounded-md">
          </div>
          <span class="text-red-500 block h-4">{{ errors.code }}</span>

          <div class="flex items-center justify-start gap-2 w-full">
            <p>我已阅读并同意</p>
            <a href="#" class="text-blue-500">用户协议</a>
            <p>和</p>
            <a href="#" class="text-blue-500">隐私政策</a>
          </div>

          <button type="submit" class="w-full bg-blue-500 text-white p-2 rounded-md mt-4">注册</button>

          <div class="flex items-center justify-center gap-2 mt-4">
            <p>已有账户？</p>
            <a href="/login" class="text-blue-500">立即登录</a>
          </div>
        </form>
      </div>
    </ion-content>
  </ion-page>
</template>