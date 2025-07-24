<template>
  <div class="px-6 py-20">
    <div class="text-2xl font-bold tracking-widest">
      欢迎登录
    </div>
    <div class="mt-12">
      <form action="" class="flex flex-col gap-6" @submit.prevent>
        <div class="flex flex-col gap-2">
          <input type="text" placeholder="请输入用户名" class="w-full p-2 outline-none" v-model="username"
            @input="validateUsername">
          <span class="text-sm text-red-500 pl-2">{{ usernameError }}</span>
        </div>
        <div class="flex flex-col gap-2">
          <input type="password" placeholder="请输入密码" class="w-full p-2 outline-none" v-model="password"
            @input="validatePassword">
          <span class="text-sm text-red-500 pl-2">{{ passwordError }}</span>
        </div>
        <button type="submit" class="w-full bg-blue-600 text-white rounded-full p-2 mt-4 tracking-widest"
          @click="login">登录</button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ref } from 'vue';
import { post } from '@/utils/request';
import { storage } from '@/utils/storage';
import NotificationListener from '@/plugins/notification-listener';

const router = useRouter();


const username = ref('');
const password = ref('');

const usernameError = ref('');
const passwordError = ref('');

const validateUsername = () => {
  if (!username.value) {
    usernameError.value = '请输入用户名';
  } else {
    usernameError.value = '';
  }
}

const validatePassword = () => {
  if (!password.value) {
    passwordError.value = '请输入密码';
  } else {
    passwordError.value = '';
  }
}

const login = () => {
  validatePassword();
  validateUsername();
  if (usernameError.value || passwordError.value) {
    return;
  }
  const params = {
    email: username.value,
    password: password.value
  }
  post('/auth/login', params).then(async res => {
    storage.setItem('access_token', res.data.access_token);
    storage.setItem('user_info', JSON.stringify(res.data.user));

    // 登录成功后，重试之前失败的通知请求
    try {
      // 设置认证信息
      await NotificationListener.setAuthInfo({
        userId: res.data.user.id,
        token: res.data.access_token
      });
      await NotificationListener.retryFailedRequests();
      console.log('Successfully retried failed notification requests');
    } catch (error) {
      console.log('No failed requests to retry or retry failed:', error);
    }
    
    router.push('/');
  }).catch(err => {
    console.log(err);
  })
}
</script>