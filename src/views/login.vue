<template>
  <div class="px-6 py-20">
    <div class="text-2xl font-bold tracking-widest">
      欢迎登录
    </div>
    <div class="mt-12">
      <form action="" class="flex flex-col gap-6" @submit.prevent>
        <div class="flex flex-col gap-2">
          <input type="text" placeholder="请输入用户名" class="w-full p-2 outline-none bg-transparent" v-model="username"
            @input="handleUsernameInput" @compositionstart="onCompositionStart"
            @compositionend="onUsernameCompositionEnd" @change="validateUsername">
          <span class="text-sm text-red-500 pl-2 h-2 block">{{ usernameError }}</span>
        </div>
        <div class="flex flex-col gap-2">
          <input type="password" placeholder="请输入密码" class="w-full p-2 outline-none bg-transparent" v-model="password"
            @input="handlePasswordInput" @compositionstart="onCompositionStart"
            @compositionend="onPasswordCompositionEnd" @change="validatePassword">
          <span class="text-sm text-red-500 pl-2 h-2 block">{{ passwordError }}</span>
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

// 中文输入法组合状态
const isComposing = ref(false);

const onCompositionStart = () => {
  isComposing.value = true;
}

const onUsernameCompositionEnd = (event: CompositionEvent) => {
  isComposing.value = false;
  // 组合输入结束后，确保 v-model 同步并验证
  username.value = (event.target as HTMLInputElement).value;
  validateUsername();
}

const onPasswordCompositionEnd = (event: CompositionEvent) => {
  isComposing.value = false;
  // 组合输入结束后，确保 v-model 同步并验证
  password.value = (event.target as HTMLInputElement).value;
  validatePassword();
}

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

const handleUsernameInput = (event: Event) => {
  // 在非组合输入状态下同步值并验证
  if (!isComposing.value) {
    username.value = (event.target as HTMLInputElement).value;
    validateUsername();
  }
}

const handlePasswordInput = (event: Event) => {
  // 在非组合输入状态下同步值并验证
  if (!isComposing.value) {
    password.value = (event.target as HTMLInputElement).value;
    validatePassword();
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

      // 尝试多种可能的 userId 字段
      let userId = res.data.user?.id || res.data.user?.userId || res.data.user?.user_id || res.data.userId;

      // 如果还是没有 userId，尝试从 JWT token 中解析
      if (!userId && res.data.access_token) {
        try {
          const tokenParts = res.data.access_token.split('.');
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]));
            console.log('JWT payload:', payload);
            userId = payload.sub || payload.userId || payload.user_id || payload.id;
          }
        } catch (e) {
          console.log('Failed to parse JWT token:', e);
        }
      }

      // 最后的备选方案
      if (!userId) {
        userId = String(res.data.user?.email) || 'unknown';
      }

      console.log('Final userId to use:', userId);

      const authResult = await NotificationListener.setAuthInfo({
        userId: String(userId),
        token: res.data.access_token
      });

      console.log('Auth info set result:', authResult);

      // 调试：检查认证信息是否正确保存
      const debugInfo = await NotificationListener.debugAuthInfo();
      console.log('Debug auth info:', debugInfo);

      await NotificationListener.retryFailedRequests();
      console.log('Successfully retried failed notification requests');
    } catch (error) {
      console.log('No failed requests to retry or retry failed:', error);
    } finally {
      setTimeout(() => {
        console.log(storage.getItem('access_token'));
        console.log(storage.getItem('user_info'));
        router.push('/');
      }, 1000);
    }

  }).catch(err => {
    console.log(err);
  })
}
</script>