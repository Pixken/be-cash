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
  const defaultUsername = "";
  const defaultPassword = "";
  
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
        class="absolute top-0 left-0 w-full h-80 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-b-[40px] z-0"
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
          class="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 md:p-8 animate-slide-up"
        >
          <form @submit="onSubmit" class="flex flex-col">
            <!-- 邮箱输入框 -->
            <div class="form-group mb-4">
              <label
                for="email"
                class="text-gray-600 text-sm font-medium block mb-2"
                >用户名</label
              >
              <div class="relative">
                <div class="absolute left-3 top-3.5 text-gray-400">
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
                </div>
                <input
                  type="text"
                  id="username"
                  v-model="form.username"
                  @blur="onInput($event, 'username')"
                  class="w-full h-12 pl-10 pr-4 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all outline-none"
                  placeholder="请输入用户名"
                  enterkeyhint="next"
                />
              </div>
              <div class="text-red-500 text-xs h-5 mt-1">
                <!-- {{ errors.username }} -->
              </div>
            </div>

            <!-- 密码输入框 -->
            <div class="form-group mb-5">
              <label
                for="password"
                class="text-gray-600 text-sm font-medium block mb-2"
                >密码</label
              >
              <div class="relative">
                <div class="absolute left-3 top-3.5 text-gray-400">
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
                </div>
                <input
                  type="password"
                  id="password"
                  v-model="form.password"
                  @blur="onInput($event, 'password')"
                  class="w-full h-12 pl-10 pr-4 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all outline-none"
                  placeholder="请输入密码"
                  enterkeyhint="next"
                />
              </div>
              <div class="text-red-500 text-xs h-5 mt-1">
                <!-- {{ errors.password }} -->
              </div>
            </div>

            <!-- 验证码 -->
            <div class="form-group mb-5">
              <label
                for="code"
                class="text-gray-600 text-sm font-medium block mb-2"
                >验证码</label
              >
              <div class="flex gap-2">
                <div class="relative flex-1">
                  <div class="absolute left-3 top-3.5 text-gray-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="code"
                    v-model="form.code"
                    @blur="onInput($event, 'code')"
                    class="w-full h-12 pl-10 pr-4 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all outline-none"
                    placeholder="请输入验证码"
                    enterkeyhint="next"
                  />
                </div>
                <div
                  class="w-32 h-12 bg-gray-100 rounded-xl border border-gray-200 flex items-center justify-center overflow-hidden"
                >
                  <img
                    :src="formatCaptchaUrl"
                    alt="验证码"
                    class="w-full h-full object-cover cursor-pointer"
                    @click="getCaptchaInfo"
                  />
                </div>
              </div>
              <!-- <div class="text-red-500 text-xs h-5 mt-1">{{ errors.code }}</div> -->
              <div class="text-xs text-gray-500 mt-1">点击图片可刷新验证码</div>
            </div>

            <!-- 记住我和忘记密码 -->
            <div class="flex items-center justify-between mb-6">
              <div class="flex items-center gap-2">
                <div
                  class="relative inline-block w-10 align-middle select-none transition duration-200 ease-in"
                >
                  <input
                    type="checkbox"
                    id="remember"
                    v-model="remember"
                    class="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 border-gray-300 appearance-none cursor-pointer"
                    enterkeyhint="next"
                  />
                  <label
                    for="remember"
                    class="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"
                  ></label>
                </div>
                <label for="remember" class="text-gray-600 text-sm"
                  >记住我</label
                >
              </div>
              <!-- <a href="#" class="text-blue-500 text-sm hover:underline"
                >忘记密码？</a
              > -->
            </div>

            <!-- 登录按钮 -->
            <button
              type="submit"
              class="h-12 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center relative overflow-hidden"
              :disabled="isLoading"
              enterkeyhint="done"
            >
              <span class="relative z-10 flex items-center">
                <svg
                  v-if="isLoading"
                  class="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
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
                <span>{{ isLoading ? "登录中..." : "登录" }}</span>
              </span>
              <div
                class="absolute top-0 left-0 w-full h-full bg-white opacity-0 hover:opacity-20 transition-opacity"
              ></div>
            </button>
          </form>

          <!-- 注册链接 -->
          <div class="flex items-center justify-center gap-2 mt-6">
            <p class="text-gray-600">还没有账号？</p>
            <span
              class="text-blue-500 font-medium cursor-pointer"
              @click="toRegister"
              >立即注册</span
            >
          </div>
        </div>
      </div>
    </div>
    </ion-content>
  </ion-page>
</template>

<style scoped>
/* 自定义动画 */
@keyframes bounce-slow {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

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

.animate-bounce-slow {
  animation: bounce-slow 3s infinite;
}

.animate-slide-up {
  animation: slide-up 0.5s ease-out forwards;
}

/* 自定义开关样式 */
.toggle-checkbox:checked {
  right: 0;
  border-color: #3b82f6;
}

.toggle-checkbox:checked + .toggle-label {
  background-color: #3b82f6;
}

/* 聚焦效果 */
input:focus {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
}

/* 适配沉浸式状态栏 */
ion-content::part(scroll) {
  padding-top: var(--ion-safe-area-top, 0);
}

/* 按钮发光效果 */
button[type="submit"]:not(:disabled):hover {
  box-shadow: 0 0 15px rgba(59, 130, 246, 0.5);
}
</style>