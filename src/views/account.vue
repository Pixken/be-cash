<script setup lang="ts">
import { IonPage, IonContent, IonModal, onIonViewDidEnter } from '@ionic/vue';
import { ref } from 'vue';
import { Form, FormItem, Select, Input, InputNumber, Button } from 'ant-design-vue';
import useUserStore from '@/store/user';
import { createAccount, getAccount } from '@/api/account';
import { format } from 'timeago.js';

const userStore = useUserStore();

const accounts = ref<any[]>([]);

const creditCards = computed(() => {
  return accounts.value.filter((item: any) => item.type === 'credit');
});

const getAccounts = async () => {
  try {
    const res = await getAccount(userStore.user?.id || '');
    accounts.value = res.data;
  } catch (error) {
    console.log(error);
  }
}

getAccounts();

const modal = ref();
const form = ref({
  cardNumber: '',
  name: '',
  amount: 0,
});
const dismiss = () => {
  modal.value?.$el.dismiss()
};

const accounts_select = ref([
  {
    label: '现金',
    value: '现金',
    icon: 'mingcute:cash-fill',
    color: '#10b981',
  },
  {
    label: '支付宝',
    value: '支付宝',
    icon: 'tdesign:logo-alipay',
    color: '#3b82f6',
  },
  {
    label: '微信',
    value: '微信',
    icon: 'ic:twotone-wechat',
    color: '#22c55e',
  },
  {
    label: '储蓄卡',
    value: '储蓄卡',
    icon: 'streamline:credit-card-1-solid',
    color: '#f59e0b',
  },
  {
    label: '信用卡',
    value: '信用卡',
    icon: 'streamline:credit-card-1-solid',
    color: '#f59e0b',
  },
]);

const rules = ref({
  cardNumber: [{ required: true, message: '请输入卡号' }],
  name: [{ required: true, message: '请选择账户类型' }],
  amount: [{ required: true, message: '请输入账户金额' }],
});

const formRef = ref();

const handleSubmit = () => {
  formRef.value.validate().then(async () => {
    const { id } = userStore.user || {};
    let cardType;
    if (form.value.name === '信用卡') {
      cardType = 'credit';
    } else if (form.value.name === '储蓄卡') {
      cardType = 'debit';
    }
    const res = await createAccount({
      name: form.value.name,
      balance: form.value.amount,
      cardNumber: form.value.cardNumber,
      cardType,
      userId: id,
    });
    console.log(res);
  }).catch(() => {
    console.log('error');
  });
};

const content = ref();

onIonViewDidEnter(() => {
  content.value?.$el.scrollToTop(0);
});
</script>
<template>
  <ion-page>
    <be-header title="账户" />
    <ion-content ref="content">
      <div class="p-4">
        <div style="background: linear-gradient(135deg, #4f46e5 0%, #818cf8 100%);"
          class="w-full h-32 rounded-2xl text-white p-4 flex flex-col">
          <h2 class="text-lg mb-1">总资产</h2>
          <p class="text-4xl font-bold mt-3">¥ {{ accounts.reduce((acc, item) => acc + item.balance, 0) }}</p>
        </div>
        <div class="w-full mt-4">
          <div class="flex items-center justify-between">
            <p class="text-lg font-bold">我的账户</p>
            <span class="text-sm text-[#4f46e5]" id="open-modal">添加账户</span>
            <ion-modal ref="modal" trigger="open-modal">
              <ion-content>
                <div class="p-4">
                  <div class="flex items-center justify-between">
                    <p class="text-lg font-bold">添加账户</p>
                    <span class="text-sm text-[#4f46e5]" @click="dismiss">取消</span>
                  </div>
                  <div class="flex items-center justify-between mt-4">
                    <Form ref="formRef" :model="form" :rules="rules" class="w-full" layout="horizontal" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
                      <FormItem label="账户类型" name="name">
                        <Select v-model:value="form.name" :options="accounts_select"></Select>
                      </FormItem>
                      <FormItem label="卡号" name="cardNumber" v-if="form.name === '储蓄卡' || form.name === '信用卡'">
                        <Input v-model:value="form.cardNumber" />
                      </FormItem>
                      <FormItem label="账户金额" name="amount">
                        <InputNumber v-model:value="form.amount" class="w-full" />
                      </FormItem>
                      <FormItem>
                        <Button type="primary" @click="handleSubmit" class="w-full">添加</Button>
                      </FormItem>
                    </Form>
                  </div>
                </div>
              </ion-content>
            </ion-modal>
          </div>
          <ul class="mt-2">
            <li class="flex items-center justify-between py-6 not-last-border-b" v-for="item in accounts"
              :key="item.id">
              <div class="flex items-center gap-2">
                <div class="flex items-center justify-center w-12 h-12 rounded-full" :style="{ backgroundColor: accounts_select.find(i => i.value === item.name)?.color }">
                  <svg-icon :icon="accounts_select.find(i => i.value === item.name)?.icon || ''" color="#ffffff"></svg-icon>
                </div>
                <div class="h-12 flex flex-col justify-between">
                  <p class="text-base font-bold">{{ accounts_select.find(i => i.value === item.name)?.label || '' }}</p>
                  <p class="text-sm text-[#7a818a]" v-if="item.type !== 'card'">上次更新：{{ format(item.updateTime, 'zh_CN') }}</p>
                  <p class="text-sm text-[#7a818a]" v-else>储蓄卡 (****{{ item.cardNumber?.slice(8, 12) }})</p>
                </div>
              </div>
              <p class="text-lg font-bold">¥{{ item.balance }} </p>
            </li>
          </ul>
        </div>
        <div class="w-full mt-4">
          <div class="flex items-center justify-between">
            <p class="text-lg font-bold">信用卡</p>
            <span class="text-sm text-[#4f46e5]">添加信用卡</span>
          </div>
          <ul class="mt-2">
            <li class="flex items-center justify-between py-6 not-last-border-b" v-for="item in creditCards"
              :key="item.id">
              <div class="flex items-center gap-2">
                <div class="flex items-center justify-center w-12 h-12 rounded-full" :style="{ backgroundColor: item.color }">
                  <svg-icon :icon="item.icon" color="#ffffff"></svg-icon>
                </div>
                <div class="h-12 flex flex-col justify-between">
                  <p class="text-base font-bold">{{ item.name }}</p>
                  <p class="text-sm text-[#7a818a]" v-if="item.type !== 'card'">上次更新：{{ format(item.updateTime, 'zh_CN') }}</p>
                  <p class="text-sm text-[#7a818a]" v-else>信用卡 (****{{ item.cardNumber?.slice(8, 12) }})</p>
                </div>
              </div>
              <p class="text-lg font-bold">¥{{ item.balance }} </p>
            </li>
          </ul>
        </div>
      </div>

    </ion-content>
  </ion-page>
</template>

<style scoped>
.not-last-border-b:not(:last-child) {
  border-bottom: 1px solid #E5E7EB;
}
ion-modal {
  --height: 50%;
  --width: 80%;
  --border-radius: 16px;
  --box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
}

ion-modal::part(backdrop) {
  background: rgba(209, 213, 219);
  opacity: 1;
}

ion-modal ion-toolbar {
  --background: rgb(14 116 144);
  --color: white;
}
</style>
