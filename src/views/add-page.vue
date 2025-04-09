<script setup lang="ts">
import { getCashCategory } from '@/api/cashCategory';
import { addCash } from '@/api/cash';
import { getAccount } from '@/api/account';
import { IonPage, IonContent, onIonViewDidEnter } from '@ionic/vue';
import { ref } from 'vue';
import emitter from '@/utils/emitter';
import useUserStore from '@/store/user';
import { deepClone } from '@/utils/common';
const userStore = useUserStore();
const activeTab = ref('expense');

const accounts = ref<any[]>([]);

const getAccounts = async () => {
  const res = await getAccount(userStore.user?.id || '');
  accounts.value = res.data;
  form.value.accountId = accounts.value[0]?.id;
}

getAccounts();

const initForm = {
  cash: {
    price: 0,
    description: '',
    type: activeTab.value,
    categoryId: '',
  },
  date: new Date().toISOString().split('T')[0],
  userId: userStore.user?.id,
  accountId: accounts.value[0]?.id,
}

const form = ref(deepClone(initForm));

const onSubmit = () => {
  if (!form.value.cash.price || !form.value.cash.description || !form.value.cash.categoryId) {
    emitter.emit('message', { msg: '请填写完整', type: 'error' });
    return;
  }
  addCash(form.value).then(res => {
    emitter.emit('message', { msg: '添加成功', type: 'success' });
    form.value = deepClone(initForm);
  }).catch(err => {
    emitter.emit('message', { msg: err, type: 'error' });
  })
};

const categories = ref([]);
const filterCategories = computed<any[]>(() => {
  // 把其他类型放到最后
  const current = categories.value.filter((item: any) => item.type === activeTab.value && item.name !== '其他');
  const other = categories.value.filter((item: any) => item.name === '其他' && item.type === activeTab.value);
  return [...current, ...other];
})

watch(activeTab, () => {
  form.value.cash.type = activeTab.value;
  form.value.cash.categoryId = '';
})

const colors = ['#818cf8', '#10b981', '#f59e0b', '#8b5cf6', '#f97316', '#14b8a6', '#ec4899', '#ef4444']
const getCashCategorys = async () => {
  try {
    const res = await getCashCategory(userStore.user?.id || '');
    categories.value = res.data.map((item: any) => ({
      id: item.id,
      name: item.name,
      type: item.type,
      icon: item.icon,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
  } catch (error) {
    console.log(error);
  }
}

const content = ref();

onIonViewDidEnter(() => {
  getCashCategorys();
  content.value?.$el.scrollToTop(0);
});

const amountInput = ref();

const handleAmountInput = () => {
  amountInput.value.focus();
}

const amount = computed(() => {
  return form.value.cash.price.toFixed(2);
})

const handleSelectCategory = (item: any) => {
  form.value.cash.categoryId = item.id;
}
</script>
<template>
  <ion-page>
    <be-header title="记账" />
    <ion-content ref="content">
      <div class="p-4">
        <div class="flex items-center justify-between bg-gray-100 rounded-md h-16 relative">
          <p class="text-center w-1/2 z-10 transition-all duration-300"
            :class="{ 'text-white': activeTab === 'income' }" @click="activeTab = 'income'">收入</p>
          <p class="text-center w-1/2 z-10 transition-all duration-300"
            :class="{ 'text-white': activeTab === 'expense' }" @click="activeTab = 'expense'">支出</p>
          <div class="absolute left-2 w-[calc(50%-1rem)] h-12 bg-[#4f46e5] rounded-md transition-all duration-300"
            :class="{ 'translate-x-0': activeTab === 'income', 'translate-x-[calc(100%+1rem)]': activeTab === 'expense' }">
          </div>
        </div>
        <div class="mt-4 border border-gray-200 rounded-2xl p-4 relative">
          <p class="text-gray-500">金额</p>
          <p class="flex items-center justify-center relative my-6 py-2" @click="handleAmountInput">
            <span class="text-4xl absolute top-[calc(50%-1.25rem)] left-0">¥</span>
            <span class="text-5xl text-gray-500 font-bold ml-6">{{ amount }}</span>
          </p>
          <input type="number" class="opacity-0 absolute top-[-9999%] left-[-9999%] w-full h-full" ref="amountInput"
            v-model="form.cash.price">
        </div>
        <div class="mt-4 border border-gray-200 rounded-2xl p-4">
          <p class="text-xl font-bold">分类</p>
          <ul class="grid grid-cols-4 gap-4 mt-4 mb-2">
            <li v-for="item in filterCategories" :key="item.id"
              class="flex flex-col items-center justify-center gap-1 p-2 border border-white rounded-xl"
              :class="{ '!bg-gray-200': item.id === form.cash.categoryId }" @click="handleSelectCategory(item)">
              <div class="flex flex-col items-center justify-center w-14 h-14 rounded-full"
                :style="{ backgroundColor: item.color }">
                <svg-icon :icon="item.icon" color="#ffffff"></svg-icon>
              </div>
              <p class="text-sm">{{ item.name }}</p>
            </li>
          </ul>
        </div>
        <div class="mt-4 border border-gray-200 rounded-2xl p-4">
          <form class="flex flex-col gap-2 w-full">
            <label for="remark" class="text-gray-500">备注</label>
            <input type="text" id="remark" v-model="form.cash.description"
              class="w-full block h-12 p-2 rounded-md border border-gray-300" placeholder="请输入备注" />

            <label for="account" class="text-gray-500">账户</label>
            <select id="account" v-model="form.accountId"
              class="w-full block h-12 p-2 rounded-md border border-gray-300 bg-white">
              <option v-for="item in accounts" :key="item.id" :value="item.id">{{ item.name }}</option>
            </select>

            <label for="date" class="text-gray-500">日期</label>
            <input type="date" id="date" v-model="form.date"
              class="w-full block h-12 p-2 rounded-md border border-gray-300 bg-white" />
          </form>
        </div>
        <button class="w-full bg-blue-500 text-white rounded-md h-12 mt-4" @click="onSubmit">提交</button>
      </div>
    </ion-content>
  </ion-page>
</template>
