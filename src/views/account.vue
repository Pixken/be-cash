<script setup lang="ts">
import { IonPage, IonContent } from '@ionic/vue';

const accounts = ref([
  {
    id: 1,
    name: '现金',
    amount: 10000,
    icon: 'mingcute:cash-fill',
    color: '#10b981',
    updatedAt: '今天',
    type: 'cash',
  },
  {
    id: 2,
    name: '支付宝',
    amount: 10000,
    icon: 'tdesign:logo-alipay',
    color: '#3b82f6',
    updatedAt: '今天',
    type: 'alipay',
  },
  {
    id: 3,
    name: '微信',
    amount: 10000,
    icon: 'ic:twotone-wechat',
    color: '#22c55e',
    updatedAt: '今天',
    type: 'wechat',
  },
  {
    id: 4,
    name: '工商银行',
    amount: 10000,
    icon: 'streamline:credit-card-1-solid',
    color: '#f59e0b',
    updatedAt: '今天',
    type: 'card',
    cardNumber: '1234567890123456',
  },
]);

const creditCards = ref([
  {
    id: 1,
    name: '招商银行',
    amount: 10000,
    icon: 'streamline:credit-card-1-solid',
    color: '#ef4444',
    updatedAt: '今天',
    type: 'card',
    cardNumber: '1234567890123456',
  },
]);
</script>
<template>
  <ion-page>
    <be-header title="账户" />
    <ion-content>
      <div class="p-4">
        <div style="background: linear-gradient(135deg, #4f46e5 0%, #818cf8 100%);"
          class="w-full h-32 rounded-2xl text-white p-4 flex flex-col">
          <h2 class="text-lg mb-1">总资产</h2>
          <p class="text-4xl font-bold mt-3">¥ 114,514.00</p>
        </div>
        <div class="w-full mt-4">
          <div class="flex items-center justify-between">
            <p class="text-lg font-bold">我的账户</p>
          </div>
          <ul class="mt-2">
            <li class="flex items-center justify-between py-6 not-last-border-b" v-for="item in accounts"
              :key="item.id">
              <div class="flex items-center gap-2">
                <div class="flex items-center justify-center w-12 h-12 rounded-full" :style="{ backgroundColor: item.color }">
                  <svg-icon :icon="item.icon" color="#ffffff"></svg-icon>
                </div>
                <div class="h-12 flex flex-col justify-between">
                  <p class="text-base font-bold">{{ item.name }}</p>
                  <p class="text-sm text-[#7a818a]" v-if="item.type !== 'card'">上次更新：{{ item.updatedAt }}</p>
                  <p class="text-sm text-[#7a818a]" v-else>储蓄卡 (****{{ item.cardNumber?.slice(8, 12) }})</p>
                </div>
              </div>
              <p class="text-lg font-bold">¥{{ item.amount }} </p>
            </li>
          </ul>
        </div>
        <div class="w-full mt-4">
          <div class="flex items-center justify-between">
            <p class="text-lg font-bold">信用卡</p>
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
                  <p class="text-sm text-[#7a818a]" v-if="item.type !== 'card'">上次更新：{{ item.updatedAt }}</p>
                  <p class="text-sm text-[#7a818a]" v-else>信用卡 (****{{ item.cardNumber?.slice(8, 12) }})</p>
                </div>
              </div>
              <p class="text-lg font-bold">¥{{ item.amount }} </p>
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
</style>
