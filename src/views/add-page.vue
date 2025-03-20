<script setup lang="ts">
import { IonPage, IonContent } from '@ionic/vue';
import { ref } from 'vue';

const activeTab = ref('income');
</script>
<template>
  <ion-page>
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
          <p class="flex items-center my-6 py-2">
            <span class="text-4xl">¥</span>
            <span class="text-5xl text-gray-500 font-bold ml-28">0.00</span>
          </p>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>
