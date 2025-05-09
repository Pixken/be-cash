<script setup lang='ts'>
import { IonContent, IonPage, onIonViewDidEnter } from '@ionic/vue'
import { z } from "zod";
import { register } from '@/api/user';
import { useRouter } from 'vue-router';
import emitter from '@/utils/emitter';

const router = useRouter();

const form = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const validateForm = async (values: any) => {
  const schema = z.object({
    username: z.string().min(1, "用户名不能为空"),
    email: z.string().email("请输入正确的邮箱"),
    password: z.string().min(8, "密码长度至少为8位"),
    confirmPassword: z.string().min(8, "确认密码长度至少为8位"),
  });
  try {
    await schema.parseAsync(values);
    return false;
  } catch (err) {
    if (err instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      err.issues.forEach((issue) => {
        errors[issue.path[0]] = issue.message;
      });
      return errors;
    }
    return false;
  }
}

// 注册状态
const isLoading = ref(false);

// Creates a submission handler
// It validate all fields and doesn't call your function unless all fields are valid
const onSubmit = async (e: Event) => {
  e.preventDefault();
  const values = form.value;
  isLoading.value = true;
  // 验证表单
  const errors = await validateForm(form.value);
  if (errors) {
    emitter.emit('message', { msg: '请检查表单', type: 'error' });
    return;
  }
  // 验证密码是否一致
  if (form.value.password !== form.value.confirmPassword) {
    emitter.emit('message', { msg: '密码不一致', type: 'error' });
    return;
  }
  // 验证是否同意条款
  if (!acceptTerms.value) {
    emitter.emit('message', { msg: '请同意条款', type: 'error' });
    return;
  }
  // 提交表单
  register({ username: values.username, email: values.email, password: values.password }).then(res => {
    emitter.emit('message', { msg: '注册成功，请登录', type: 'success' });
    router.push('/login');
  }).catch(err => {
    emitter.emit('message', { msg: err, type: 'error' });
  }).finally(() => {
    isLoading.value = false;
  });
}

const resetForm = () => {
  form.value = {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  }
}

const acceptTerms = ref(false);

const content = ref();

onIonViewDidEnter(() => {
  content.value?.$el.scrollToTop(0);
  // 重置表单
  resetForm();
  // 重置接受条款复选框
  acceptTerms.value = false;
});

const onInput = (e: Event, key: keyof typeof form.value) => {
  const input = e.target as HTMLInputElement;
  form.value[key] = input.value;
};
</script>

<template>
  <ion-page>
    <ion-content ref="content" class="ion-padding">
      <!-- 背景渐变和装饰元素 -->
      <div class="absolute top-0 left-0 w-full h-64 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-b-[40px] z-0"></div>
      <div class="absolute top-10 right-10 w-24 h-24 bg-white opacity-10 rounded-full"></div>
      <div class="absolute top-40 left-10 w-16 h-16 bg-white opacity-10 rounded-full"></div>
      
      <!-- 注册表单区域 -->
      <div class="relative z-10 h-full flex flex-col items-center mt-[32px]">
        
        <!-- 欢迎文字 -->
        <div class="flex flex-col items-center mt-6 mb-8">
          <h1 class="text-3xl font-bold text-white">创建账户</h1>
          <p class="text-gray-100 mt-1">加入我们，开始管理您的财务</p>
        </div>
        
        <!-- 注册卡片 -->
        <div class="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 animate-slide-up">
          <form @submit="onSubmit" class="flex flex-col">
            <!-- 用户名输入框 -->
            <div class="form-group mb-4">
              <label for="username" class="text-gray-600 text-sm font-medium block mb-2">用户名</label>
              <div class="relative">
                <div class="absolute left-3 top-3.5 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                  </svg>
                </div>
                <input 
                  type="text" 
                  id="register-username" 
                  v-model="username"
                  @input="onInput($event, 'username')"
                  @change="onInput($event, 'username')"
                  class="w-full h-12 pl-10 pr-4 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition-all outline-none" 
                  :class="{ 'border-red-500 bg-red-50': errors.username }"
                  placeholder="请输入用户名"
                />
              </div>
              <div class="text-red-500 text-xs h-5 mt-1">{{ errors.username }}</div>
            </div>
            
            <!-- 邮箱输入框 -->
            <div class="form-group mb-4">
              <label for="email" class="text-gray-600 text-sm font-medium block mb-2">邮箱</label>
              <div class="relative">
                <div class="absolute left-3 top-3.5 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <input 
                  type="text" 
                  id="email" 
                  v-model="email"
                  @input="onInput($event, 'email')"
                  @change="onInput($event, 'email')"
                  class="w-full h-12 pl-10 pr-4 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition-all outline-none" 
                  :class="{ 'border-red-500 bg-red-50': errors.email }"
                  placeholder="请输入邮箱" 
                />
              </div>
              <div class="text-red-500 text-xs h-5 mt-1">{{ errors.email }}</div>
            </div>

            <!-- 密码输入框 -->
            <div class="form-group mb-4">
              <label for="password" class="text-gray-600 text-sm font-medium block mb-2">设置密码</label>
              <div class="relative">
                <div class="absolute left-3 top-3.5 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
                  </svg>
                </div>
                <input 
                  type="password" 
                  id="register-password" 
                  v-model="password"
                  @input="onInput($event, 'password')"
                  @change="onInput($event, 'password')"
                  class="w-full h-12 pl-10 pr-4 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition-all outline-none" 
                  :class="{ 'border-red-500 bg-red-50': errors.password }"
                  placeholder="请输入密码" 
                />
              </div>
              <div class="text-red-500 text-xs h-5 mt-1">{{ errors.password }}</div>
            </div>

            <!-- 确认密码输入框 -->
            <div class="form-group mb-4">
              <label for="confirmPassword" class="text-gray-600 text-sm font-medium block mb-2">确认密码</label>
              <div class="relative">
                <div class="absolute left-3 top-3.5 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
                  </svg>
                </div>
                <input 
                  type="password" 
                  id="confirmPassword" 
                  v-model="confirmPassword"
                  @input="onInput($event, 'confirmPassword')"
                  @change="onInput($event, 'confirmPassword')"
                  class="w-full h-12 pl-10 pr-4 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition-all outline-none" 
                  :class="{ 'border-red-500 bg-red-50': errors.confirmPassword }"
                  placeholder="请确认密码" 
                />
              </div>
              <div class="text-red-500 text-xs h-5 mt-1">{{ errors.confirmPassword }}</div>
            </div>
            
            <!-- 用户协议 -->
            <div class="flex items-center mb-6">
              <div class="relative inline-block w-5 h-5 mr-2">
                <input 
                  type="checkbox" 
                  id="accept-terms" 
                  v-model="acceptTerms"
                  class="absolute w-5 h-5 opacity-0 cursor-pointer z-10"
                />
                <div class="w-5 h-5 border border-gray-300 rounded flex items-center justify-center" :class="{'bg-indigo-500 border-indigo-500': acceptTerms}">
                  <svg v-if="acceptTerms" xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                </div>
              </div>
              <div class="text-gray-600 text-sm">
                我已阅读并同意
                <span class="text-indigo-500 cursor-pointer">用户协议</span>
                和
                <span class="text-indigo-500 cursor-pointer">隐私政策</span>
              </div>
            </div>

            <!-- 注册按钮 -->
            <button 
              type="submit" 
              class="h-12 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center"
              :disabled="isLoading || !acceptTerms"
              :class="{'opacity-70': !acceptTerms}"
            >
              <svg v-if="isLoading" class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>{{ isLoading ? '注册中...' : '立即注册' }}</span>
            </button>
          </form>

          <!-- 登录链接 -->
          <div class="flex items-center justify-center gap-2 mt-8">
            <p class="text-gray-600">已有账号？</p>
            <span class="text-indigo-500 font-medium hover:underline cursor-pointer" @click="router.push('/login')">立即登录</span>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<style scoped>
/* 自定义动画 */
@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-up {
  animation: slide-up 0.5s ease-out forwards;
}

/* 聚焦效果 */
input:focus {
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.3);
}
</style>