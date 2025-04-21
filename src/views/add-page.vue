<script setup lang="ts">
import { getCashCategory } from '@/api/cashCategory';
import { addCash } from '@/api/cash';
import { getAccount } from '@/api/account';
import { IonPage, IonContent, onIonViewDidEnter, IonModal } from '@ionic/vue';
import { Form, FormItem, Select, Input, InputNumber, Button, DatePicker } from 'ant-design-vue';
import { ref } from 'vue';
import emitter from '@/utils/emitter';
import useUserStore from '@/store/user';
import { deepClone } from '@/utils/common';
import { useRouter } from 'vue-router';
import dayjs from 'dayjs';
import locale from 'ant-design-vue/es/date-picker/locale/zh_CN';
const userStore = useUserStore();
const activeTab = ref('EXPENSE');
const router = useRouter();
const modal = ref();
const accounts = ref<any[]>([]);

const noAccount = ref(false)

const getAccounts = async () => {
  const res = await getAccount();
  if (!res.data && res.data.legth === 0) {
    noAccount.value = true
    return
  } 
  accounts.value = res.data.map((item: any) => ({
    label: item.name,
    value: item.id,
  }));
  form.value.accountId = accounts.value[0]?.value;
}

getAccounts();

const date = ref(dayjs());
const initForm = {
  description: '',
  amount: 0,
  categoryId: '',
  transactionDate: date.value,
  accountId: accounts.value[0]?.value.toString(),
}
const form = ref(deepClone(initForm));

const onSubmit = () => {
  if (!form.value.amount || !form.value.description || !form.value.categoryId) {
    emitter.emit('message', { msg: '请填写完整', type: 'error' });
    return;
  }
  form.value.transactionDate = dayjs(form.value.transactionDate).format('YYYY-MM-DD HH:mm:ss');
  addCash(form.value, activeTab.value).then(res => {
    emitter.emit('message', { msg: '添加成功', type: 'success' });
    form.value = deepClone(initForm);
  }).catch(err => {
    emitter.emit('message', { msg: err, type: 'error' });
  })
};

const categories = ref([]);
const filterCategories = computed<any[]>(() => {
  // 把其他类型放到最后
  // const current = categories.value.filter((item: any) => item.type === activeTab.value && item.name !== '其他');
  // const other = categories.value.filter((item: any) => item.name === '其他' && item.type === activeTab.value);
  // return [...current, ...other];
  
  return categories.value.filter((item: any) => item.type === activeTab.value);
})

watch(activeTab, () => {
  form.value.categoryId = '';
})
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
  return form.value.amount.toFixed(2);
})

const handleSelectCategory = (item: any) => {
  form.value.categoryId = item.id;
}

const handleTOAccount = () => {
  noAccount.value = false
  router.push('/tabs/account')
  modal.value?.$el.dismiss()
}
</script>
<template>
  <ion-page>
    <be-header title="记账" />
    <ion-content ref="content">
      <ion-modal ref="modal" :is-open="noAccount">
        <div class="p-4">
          <p>请先添加账户</p>
          <button class="w-full bg-blue-500 text-white rounded-md h-12 mt-4" @click="handleTOAccount">添加账户</button>
        </div>
      </ion-modal>
      <div class="p-4">
        <div class="flex items-center justify-between bg-gray-100 rounded-md h-16 relative">
          <p class="text-center w-1/2 z-10 transition-all duration-300"
            :class="{ 'text-white': activeTab === 'INCOME' }" @click="activeTab = 'INCOME'">收入</p>
          <p class="text-center w-1/2 z-10 transition-all duration-300"
            :class="{ 'text-white': activeTab === 'EXPENSE' }" @click="activeTab = 'EXPENSE'">支出</p>
          <div class="absolute left-2 w-[calc(50%-1rem)] h-12 bg-[#4f46e5] rounded-md transition-all duration-300"
            :class="{ 'translate-x-0': activeTab === 'INCOME', 'translate-x-[calc(100%+1rem)]': activeTab === 'EXPENSE' }">
          </div>
        </div>
        <div class="mt-4 border border-gray-200 rounded-2xl p-4 relative">
          <p class="text-gray-500">金额</p>
          <p class="flex items-center justify-center relative my-6 py-2" @click="handleAmountInput">
            <span class="text-4xl absolute top-[calc(50%-1.25rem)] left-0">¥</span>
            <span class="text-5xl text-gray-500 font-bold ml-6">{{ amount }}</span>
          </p>
          <input type="number" class="opacity-0 absolute top-[-9999%] left-[-9999%] w-full h-full" ref="amountInput"
            v-model="form.amount">
        </div>
        <div class="mt-4 border border-gray-200 rounded-2xl p-4">
          <p class="text-xl font-bold">分类</p>
          <ul class="grid grid-cols-4 gap-2 mt-4 mb-2">
            <li v-for="item in filterCategories" :key="item.id"
              class="flex flex-col items-center justify-center gap-1 p-2 border border-white rounded-xl"
              :class="{ '!bg-gray-200': item.id === form.categoryId }" @click="handleSelectCategory(item)">
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
            <FormItem name="description">
              <Input v-model:value="form.description" placeholder="请输入备注" size="large" />
            </FormItem>

            <label for="account" class="text-gray-500">账户</label>
            <FormItem name="accountId">
              <Select v-model:value="form.accountId" :options="accounts" size="large" />
            </FormItem>

            <label for="date" class="text-gray-500">日期</label>
            <FormItem name="date">
              <DatePicker v-model:value="date" size="large" :locale="locale" class="w-full" />
            </FormItem>
          </form>
        </div>
        <button class="w-full bg-blue-500 text-white rounded-md h-12 mt-4" @click="onSubmit">提交</button>
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
</style>
