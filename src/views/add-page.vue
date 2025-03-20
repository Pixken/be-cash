<script setup lang="ts">
import { IonPage, IonContent } from '@ionic/vue';
import { ref } from 'vue';

const activeTab = ref('income');

const form = ref({
  remark: '',
  account: '1',
  date: new Date().toISOString().split('T')[0],
});

const onSubmit = () => {
  console.log(form.value);
};

const categories = ref([
  {
    id: 1,
    name: '餐饮',
    icon: 'mdi:silverware-fork-knife',
    color: '#818cf8',
  },
  {
    id: 2,
    name: '购物',
    icon: 'ri:shopping-bag-fill',
    color: '#10b981',
  },
  {
    id: 3,
    name: '交通',
    icon: 'material-symbols:local-taxi-rounded',
    color: '#f59e0b',
  },
  {
    id: 4,
    name: '住房',
    icon: 'mingcute:home-3-fill',
    color: '#8b5cf6',
  },
  {
    id: 5,
    name: '娱乐',
    icon: 'mdi:gamepad-variant',
    color: '#f97316',
  },
  {
    id: 6,
    name: '医疗',
    icon: 'healthicons:hospital-outline-24px',
    color: '#14b8a6',
  },
  {
    id: 7,
    name: '服饰',
    icon: 'map:clothing-store',
    color: '#ec4899',
  },
  {
    id: 8,
    name: '更多',
    icon: 'material-symbols:more-horiz',
    color: '#ef4444',
  },
]);
</script>
<template>
  <ion-page>
    <be-header title="记账" />
    <ion-content>
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
        <div class="mt-4 border border-gray-200 rounded-2xl p-4">
          <p class="text-gray-500">金额</p>
          <p class="flex items-center justify-center relative my-6 py-2">
            <span class="text-4xl absolute top-[calc(50%-1.25rem)] left-0">¥</span>
            <span class="text-5xl text-gray-500 font-bold ml-6">0.00</span>
          </p>
        </div>
        <div class="mt-4 border border-gray-200 rounded-2xl p-4">
          <p class="text-xl font-bold">分类</p>
          <ul class="grid grid-cols-4 gap-4 mt-4 mb-2">
            <li v-for="item in categories" :key="item.id" class="flex flex-col items-center justify-center gap-1">
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
            <input type="text" id="remark" v-model="form.remark"
              class="w-full block h-12 p-2 rounded-md border border-gray-300" placeholder="请输入备注" />

            <label for="account" class="text-gray-500">账户</label>
            <select id="account" v-model="form.account"
              class="w-full block h-12 p-2 rounded-md border border-gray-300 bg-white">
              <option value="0">现金</option>
              <option value="1">支付宝</option>
              <option value="2">微信</option>
              <option value="3">银行卡</option>
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
