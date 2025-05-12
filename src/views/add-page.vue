<script setup lang="ts">
import { getCashCategory } from "@/api/cashCategory";
import { addCash } from "@/api/cash";
import { getAccount } from "@/api/account";
import { IonPage, IonContent, onIonViewDidEnter, IonModal } from "@ionic/vue";
import {
  Form,
  FormItem,
  Select,
  Input,
  InputNumber,
  Button,
  DatePicker,
} from "ant-design-vue";
import { ref } from "vue";
import emitter from "@/utils/emitter";
import useUserStore from "@/store/user";
import { deepClone } from "@/utils/common";
import { useRouter } from "vue-router";
import dayjs from "dayjs";
import locale from "ant-design-vue/es/date-picker/locale/zh_CN";
import { z } from "zod";
import { debounce } from '@/utils/common';

const userStore = useUserStore();
const activeTab = ref("EXPENSE");
const router = useRouter();
const modal = ref();
const accounts = ref<any[]>([]);

const noAccount = ref(false);

const form = ref({
  amount: 0,
  categoryId: "",
  description: "",
  accountId: "",
  transactionDate: dayjs(),
});

const resetForm = () => {
  form.value = {
    amount: 0,
    categoryId: "",
    description: "",
    accountId: accounts.value[0]?.value,
    transactionDate: dayjs()
  };
};

const validateForm = async (values: any) => {
  const schema = z.object({
    amount: z.number().min(1, "金额必须大于0"),
    categoryId: z.string().min(1, "请选择分类"),
    description: z.string().min(1, "请输入备注"),
    accountId: z.number().min(1, "请选择账户"),
    transactionDate: z.string(),
  })
  try {
    const { transactionDate,...sss } = values;
    await schema.parseAsync({ ...sss, transactionDate: transactionDate.format('YYYY-MM-DD HH:mm:ss') });
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

const getAccounts = async () => {
  const res = await getAccount();
  if (!res.data && res.data.legth === 0) {
    noAccount.value = true;
    return;
  }
  accounts.value = res.data.map((item: any) => ({
    label: item.name,
    value: item.id,
  }));
  form.value.accountId = accounts.value[0]?.value;
};

// 表单提交处理
// 创建防抖提交函数
const debouncedSubmit = debounce((e: Event) => {
  // 阻止默认的表单提交行为
  e.preventDefault();
  onSubmit(e);
}, 500);

// 修改原来的onSubmit函数，移除preventDefault
const onSubmit = async (e: Event) => {
  // 验证表单
  const errors = await validateForm(form.value);
  if (errors) {
    console.log(errors);
    
    emitter.emit("message", { msg: errors[Object.keys(errors)[0]], type: "error" });
    return;
  }
  // 提交表单
  const { transactionDate, amount, ...values } = form.value;
  addCash(
    {
      ...values,
      amount: Number(amount),
      transactionDate: dayjs(transactionDate).format("YYYY-MM-DD HH:mm:ss"),
    },
    activeTab.value
  )
    .then(async (res) => {
      emitter.emit("message", { msg: "记账成功", type: "success" });
    })
    .catch(async (err) => {
      if (err) emitter.emit("message", { msg: err, type: "error" });
    })
    .finally(() => {
      resetForm();
      router.push("/");
    });
};
const categories = ref([]);
const filterCategories = computed<any[]>(() => {
  // 把其他类型放到最后
  // const current = categories.value.filter((item: any) => item.type === activeTab.value && item.name !== '其他');
  // const other = categories.value.filter((item: any) => item.name === '其他' && item.type === activeTab.value);
  // return [...current, ...other];

  return categories.value.filter((item: any) => item.type === activeTab.value);
});

watch(activeTab, () => {
  form.value.categoryId = "";
});
const getCashCategorys = async () => {
  try {
    const res = await getCashCategory();
    // console.log(res);
    categories.value = res.data.map((item: any) => ({
      id: item.id.value,
      name: item.name,
      type: item.type,
      icon: item.icon,
      color: item.color,
    }));
    console.log(categories.value);
  } catch (error) {
    console.log(error);
  }
};

const content = ref();

onIonViewDidEnter(() => {
  getCashCategorys();
  getAccounts();
  content.value?.$el.scrollToTop(0);
});

const amountInput = ref();

const handleAmountInput = () => {
  amountInput.value.focus();
};

const formateamount = computed(() => {
  return (form.value.amount || 0).toFixed(2);
});

const handleSelectCategory = (item: any) => {
  form.value.categoryId = item.id;
};

const handleTOAccount = () => {
  noAccount.value = false;
  router.push("/tabs/account");
  modal.value?.$el.dismiss();
};
</script>
<template>
  <ion-page>
    <be-header title="记账" />
    <ion-content ref="content">
      <ion-modal ref="modal" :is-open="noAccount">
        <div class="p-4">
          <p>请先添加账户</p>
          <button
            class="w-full bg-blue-500 text-white rounded-md h-12 mt-4"
            @click="handleTOAccount"
          >
            添加账户
          </button>
        </div>
      </ion-modal>
      <div class="p-4">
        <div
          class="flex items-center justify-between bg-gray-100 rounded-md h-16 relative"
        >
          <p
            class="text-center w-1/2 z-10 transition-all duration-300"
            :class="{ 'text-white': activeTab === 'INCOME' }"
            @click="activeTab = 'INCOME'"
          >
            收入
          </p>
          <p
            class="text-center w-1/2 z-10 transition-all duration-300"
            :class="{ 'text-white': activeTab === 'EXPENSE' }"
            @click="activeTab = 'EXPENSE'"
          >
            支出
          </p>
          <div
            class="absolute left-2 w-[calc(50%-1rem)] h-12 bg-[#4f46e5] rounded-md transition-all duration-300"
            :class="{
              'translate-x-0': activeTab === 'INCOME',
              'translate-x-[calc(100%+1rem)]': activeTab === 'EXPENSE',
            }"
          ></div>
        </div>
        <div class="mt-4 border border-gray-200 rounded-2xl p-4 relative">
          <p class="text-gray-500">金额</p>
          <p
            class="flex items-center justify-center relative my-6 py-2"
            @click="handleAmountInput"
          >
            <span class="text-4xl absolute top-[calc(50%-1.25rem)] left-0"
              >¥</span
            >
            <span class="text-5xl text-gray-500 font-bold ml-6">{{
              formateamount
            }}</span>
          </p>
          <input
            type="number"
            class="opacity-0 absolute top-[-9999%] left-[-9999%] w-full h-full"
            ref="amountInput"
            v-model="form.amount"
          />
        </div>
        <div class="mt-4 border border-gray-200 rounded-2xl p-4">
          <p class="text-xl font-bold">分类</p>
          <ul class="grid grid-cols-4 gap-2 mt-4 mb-2">
            <li
              v-for="item in filterCategories"
              :key="item.id"
              class="flex flex-col items-center justify-center gap-1 py-2 border border-white rounded-xl"
              :class="{ '!bg-gray-200': item.id === form.categoryId }"
              @click="handleSelectCategory(item)"
            >
              <div
                class="flex flex-col items-center justify-center w-14 h-14 rounded-full"
                :style="{ backgroundColor: item.color }"
              >
                <svg-icon :icon="item.icon" color="#ffffff"></svg-icon>
              </div>
              <p class="text-sm">{{ item.name }}</p>
            </li>
          </ul>
        </div>
        <div class="mt-4 border border-gray-200 rounded-2xl p-4">
          <form class="flex flex-col gap-2 w-full" @submit.prevent="debouncedSubmit">
            <label for="description" class="text-gray-500">备注</label>
            <input
              class="h-12 border border-gray-200 rounded-md p-2 focus:outline-none focus:border-blue-500 transition-all duration-300"
              type="text"
              v-model="form.description"
              @blur="form.description = $event.target?.value"
              placeholder="请输入备注"
            />
            <label for="account" class="text-gray-500">账户</label>
            <Select
              placeholder="请选择账户"
              v-model:value="form.accountId"
              :options="accounts"
              size="large"
              class="h-12"
            />

            <label for="date" class="text-gray-500">日期</label>
            <DatePicker
              placeholder="请选择日期"
              v-model:value="form.transactionDate"
              size="large"
              :locale="locale"
              class="w-full h-12"
            />
            <button
              class="w-full bg-blue-500 text-white rounded-md h-12 mt-4"
              type="submit"
            >
              提交
            </button>
          </form>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>
<style scoped>
ion-modal {
  --height: 15%;
  --width: 80%;
  --border-radius: 16px;
}
:deep(.ant-select-selector) {
  height: 100% !important;
}
:deep(.ant-select-selection-item) {
  line-height: 3rem !important;
}
</style>
