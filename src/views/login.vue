<script setup lang='ts'>
import { IonContent, IonPage, onIonViewDidEnter } from "@ionic/vue";
import { z } from "zod";
import { useRouter } from "vue-router";
import { login, userInfo, getCaptcha } from "@/api/user";
import emitter from "@/utils/emitter";
import useUserStore from "@/store/user";
import { storage } from "@/utils/storage";
const userStore = useUserStore();
const router = useRouter();

const checkLogin = () => {
  if (userStore.user.id) {
    router.replace("/tabs/home");
  }
};
checkLogin();

const toRegister = async () => {
  console.log(await router.replace("/register"));
  router.replace("/register");
};

const form = ref({
  username: "",
  password: "",
  code: "",
});

const validateForm = async (values: any) => {
  const schema = z.object({
    username: z.string().min(1, "用户名不能为空"),
    password: z.string().min(1, "密码不能为空"),
    code: z.string().min(1, "验证码不能为空"),
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
};

// 验证码相关
const captchaUrl = ref("");
const captchaId = ref("");
const formatCaptchaUrl = computed(() => {
  // 判断 url 是不是 svg 格式
  if (captchaUrl.value.includes("data:image/svg+xml;base64,")) {
    return captchaUrl.value;
  }
  return `data:image/png;base64,${captchaUrl.value}`;
});

const getCaptchaInfo = async () => {
  const res = await getCaptcha();
  console.log(res);

  captchaUrl.value = res.data.image;
  captchaId.value = res.data.uuid;
};

// 在组件挂载后加载验证码
onMounted(async () => {
  await getCaptchaInfo();

  // 获取存储的用户信息，并处理可能为空的情况
  const savedUser = storage.getItem("user") || {};
  
  // 设置默认值
  const defaultUsername = import.meta.env.VITE_ENV === "local" ? "test1" : "lgb";
  const defaultPassword = import.meta.env.VITE_ENV === "local" ? "Test123456" : "123LGBlgb";
  
  // 优先使用保存的值，如果没有则使用默认值
  form.value.username = savedUser.username || defaultUsername;
  form.value.password = savedUser.password || defaultPassword;
});

// 登录状态
const isLoading = ref(false);

// 表单提交处理
const onSubmit = async (e: Event) => {
  e.preventDefault();
  const values = form.value;
  // 验证表单
  const errors = await validateForm(values);
  if (errors) {
    emitter.emit("message", {
      msg: `${errors[Object.keys(errors)[0]]}${JSON.stringify(form.value)}`,
      type: "error",
    });
    return;
  }

  // 发送登录请求
  console.log(values);
  isLoading.value = true;
  login({ ...values, uuid: captchaId.value })
    .then(async (res) => {
      console.log(res);
      // await userStore.setToken(res.data.access_token, res.data.refresh_token);
      // const user = await userInfo()
      if (res.code === '0000') {
        await userStore.setUser(res.data);
        emitter.emit("message", { msg: "登录成功", type: "success" });
        router.replace("/tabs/home");
      } else {
        emitter.emit("message", { msg: res.info, type: "error" });
        await getCaptchaInfo();
      }
    })
    .catch(async (err) => {
      // 登录失败时刷新验证码
      await getCaptchaInfo();
      console.log(err);
      emitter.emit("message", { msg: err, type: "error" });
    })
    .finally(() => {
      isLoading.value = false;
    });
};

const remember = ref(storage.getItem("user")?.username ? true : false);
watch(remember, (val) => {
  if (val) {
    storage.setItem("user", {
      username: form.value.username,
      password: form.value.password,
    });
  } else {
    storage.removeItem("user");
  }
});

const content = ref();

onIonViewDidEnter(() => {
  content.value?.$el.scrollToTop(0);
});

const onInput = (e: Event, key: keyof typeof form.value) => {
  const input = e.target as HTMLInputElement;
  form.value[key] = input.value;
};
</script>

<template>
  <ion-page>
    <ion-content ref="content" class="ion-padding">
      <div class="content-wapper">
      <!-- 背景渐变和装饰元素 -->
      <div
        class="absolute top-0 left-0 w-full h-80 bg-gradient-to-b from-primary-500 to-primary-700 rounded-b-[40px] z-0"
      ></div>
      <div
        class="absolute top-10 right-10 w-24 h-24 bg-white opacity-10 rounded-full"
      ></div>
      <div
        class="absolute top-40 left-10 w-16 h-16 bg-white opacity-10 rounded-full"
      ></div>

      <!-- 登录表单区域 -->
      <div
        class="relative z-10 h-full flex flex-col items-center justify-center mt-[32px]"
      >
        <!-- Logo区域 - 带动画 -->
        <div class="animate-bounce-slow">
          <div class="bg-white p-4 rounded-2xl shadow-xl">
            <img
              src="@/assets/logo.webp"
              alt="logo"
              class="w-20 h-20 rounded-xl"
            />
          </div>
        </div>

        <!-- 欢迎文字 -->
        <div class="flex flex-col items-center mt-6 mb-8">
          <h1 class="text-3xl font-bold text-white">欢迎回来</h1>
          <p class="text-gray-100 mt-1">登录您的账户继续使用</p>
        </div>

        <!-- 登录卡片 -->
        <div
          class="w-full max-w-md app-card bg-white p-6 md:p-8 animate-slide-up"
        >
          <form @submit="onSubmit" class="flex flex-col">
            <!-- 用户名输入框 -->
            <div class="form-group mb-4">
              <label
                for="username"
                class="text-neutral-600 text-sm font-medium block mb-2"
                >用户名</label
              >
              <div
                class="relative flex items-center bg-neutral-50 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary-400"
              >
                <span class="absolute left-4 text-neutral-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </span>
                <input
                  id="username"
                  type="text"
                  v-model="form.username"
                  @input="onInput($event, 'username')"
                  class="app-input border-none bg-transparent pl-12 pr-4 py-3 w-full focus:outline-none text-neutral-800"
                  placeholder="请输入用户名"
                />
              </div>
            </div>

            <!-- 密码输入框 -->
            <div class="form-group mb-4">
              <label
                for="password"
                class="text-neutral-600 text-sm font-medium block mb-2"
                >密码</label
              >
              <div
                class="relative flex items-center bg-neutral-50 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary-400"
              >
                <span class="absolute left-4 text-neutral-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </span>
                <input
                  id="password"
                  type="password"
                  v-model="form.password"
                  @input="onInput($event, 'password')"
                  class="app-input border-none bg-transparent pl-12 pr-4 py-3 w-full focus:outline-none text-neutral-800"
                  placeholder="请输入密码"
                />
              </div>
            </div>

            <!-- 验证码区域 -->
            <div class="form-group mb-6">
              <label
                for="captcha"
                class="text-neutral-600 text-sm font-medium block mb-2"
                >验证码</label
              >
              <div class="flex space-x-3">
                <div
                  class="relative flex items-center flex-1 bg-neutral-50 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary-400"
                >
                  <span class="absolute left-4 text-neutral-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path
                        fill-rule="evenodd"
                        d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </span>
                  <input
                    id="captcha"
                    type="text"
                    v-model="form.code"
                    @input="onInput($event, 'code')"
                    class="app-input border-none bg-transparent pl-12 pr-4 py-3 w-full focus:outline-none text-neutral-800"
                    placeholder="请输入验证码"
                  />
                </div>
                <div
                  class="flex-shrink-0 overflow-hidden rounded-xl border border-neutral-100 cursor-pointer"
                  @click="getCaptchaInfo()"
                >
                  <img
                    :src="formatCaptchaUrl"
                    alt="验证码"
                    class="h-full w-28 object-cover"
                    v-if="captchaUrl"
                  />
                </div>
              </div>
            </div>

            <!-- 记住密码选项 -->
            <div class="flex items-center justify-between mb-6">
              <label class="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  v-model="remember"
                  class="form-checkbox h-5 w-5 text-primary-600 rounded-md border-neutral-300 focus:ring-primary-500"
                />
                <span class="ml-2 text-sm text-neutral-600">记住账号密码</span>
              </label>
              <span class="text-sm text-primary-600 cursor-pointer"
                >忘记密码?</span
              >
            </div>

            <!-- 登录按钮 -->
            <button
              type="submit"
              class="app-button-primary app-button h-12 flex items-center justify-center relative mb-5"
              :disabled="isLoading"
            >
              <span class="text-white font-medium">{{ isLoading ? '登录中...' : '登录' }}</span>
              <svg
                v-if="isLoading"
                class="animate-spin ml-2 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </button>

            <!-- 注册链接 -->
            <div class="text-center">
              <span class="text-neutral-600 text-sm">还没有账号? </span>
              <a
                @click="toRegister"
                class="text-primary-600 hover:text-primary-800 text-sm font-medium cursor-pointer"
                >注册</a
              >
            </div>
          </form>
        </div>
      </div>
    </div>
    </ion-content>
  </ion-page>
</template>

<style scoped>
/* 添加一些动画 */
@keyframes slide-up {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-slide-up {
  animation: slide-up 0.5s ease-out forwards;
}

.animate-bounce-slow {
  animation: bounce 3s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

input[type="checkbox"] {
  @apply accent-primary-600;
}

input[type="text"], input[type="password"] {
  padding-left: 3em;
}
</style>