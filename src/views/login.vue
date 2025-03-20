<script setup lang='ts'>
import { IonContent, IonPage } from '@ionic/vue'
import { useForm } from 'vee-validate';
import * as yup from 'yup';
import { Storage } from '@ionic/storage';
const { errors, handleSubmit, defineField } = useForm({
  validationSchema: yup.object({
    username: yup.string().required(),
    password: yup.string().min(6).required(),
  }),
});

// Creates a submission handler
// It validate all fields and doesn't call your function unless all fields are valid
const onSubmit = handleSubmit(values => {
  alert(JSON.stringify(values, null, 2));
});

const [username, usernameAttrs] = defineField('username');
const [password, passwordAttrs] = defineField('password');

// 在组件挂载后检查是否有保存的用户信息
onMounted(async () => {
  if (storage) {
    const savedUser = await storage.get('user');
    if (savedUser && savedUser.username) {
      username.value = savedUser.username;
      if (savedUser.password) {
        password.value = savedUser.password;
        remember.value = true;
      }
    }
  }
});

const remember = ref(false);
const storage = inject<Storage>('storage'); // 获取存储实例
console.log(storage);
watch(remember, (val) => {
  if (val) {
    storage?.set('user', {
      username: username.value,
      password: password.value,
    });
  } else {
    storage?.remove('user');
  }
});
</script>

<template>
  <ion-page class="h-full flex flex-col items-center p-6">
    <div>
      <img src="@/assets/logo.webp" alt="logo" class="w-20 h-20 rounded-2xl">
    </div>
    <div class="flex flex-col items-center mt-10 gap-2">
      <p class="text-3xl font-bold">欢迎回来</p>
      <p class="text-gray-500">登录您的账户继续使用</p>
    </div>
    <ion-content class="w-full flex flex-col items-center justify-center">
      <form @submit="onSubmit" class="flex flex-col gap-2 mt-10">
        <label for="username" class="text-gray-500">用户名/手机号</label>
        <input type="text" id="username" v-model="username" v-bind="usernameAttrs"
          class="w-full block h-12 p-2 rounded-md border border-gray-300" :class="{ 'border-red-500': errors.username }"
          placeholder="请输入用户名/手机号" />
        <span class="text-red-500 block h-4">{{ errors.username }}</span>

        <label for="password" class="text-gray-500">密码</label>
        <input type="password" id="password" v-model="password" v-bind="passwordAttrs"
          class="w-full block h-12 p-2 rounded-md border border-gray-300" :class="{ 'border-red-500': errors.password }"
          placeholder="请输入密码" />
        <span class="text-red-500 block h-4">{{ errors.password }}</span>

        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <input type="checkbox" id="remember" v-model="remember" />
            <label for="remember" class="text-gray-500">记住我</label>
          </div>
          <a href="#" class="text-blue-500">忘记密码？</a>
        </div>

        <button type="submit" class="w-full bg-blue-500 text-white p-2 rounded-md">登录</button>

        <div class="flex items-center justify-center gap-2 mt-4">
          <p>还没有账号？</p>
          <a href="#" class="text-blue-500">立即注册</a>
        </div>
      </form>
    </ion-content>
  </ion-page>
</template>