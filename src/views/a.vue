<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button></ion-back-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div class="bg-white m-3 rounded-md px-6">
        <div class="py-12 border-b">
          <div class="flex flex-col items-center gap-6 mb-9">
            <div class="flex items-center gap-2">
              <div class="bg-blue-500 w-fit p-[2px] rounded-full"><img src="@/assets/money.svg" alt="" class="w-5 h-5"></img></div>
              <span class="text-sm">{{  data?.category || '其他'  }}</span>
            </div>
            <div class="text-4xl font-semibold">{{ data?.type === 'income' ? '+' : '-' + data?.amount }}</div>
          </div>
          <div class="flex flex-col gap-2">
            <div>
              <span class="text-gray-400 text-sm inline-block w-20">记录时间</span>
              <span class="text-sm">{{ new Date(data?.time as string).toLocaleString().replace('/', '年').replace('/', '月').replace(' ', '日 ') }}</span>
            </div>
            <div>
              <span class="text-gray-400 text-sm inline-block w-20">应用来源</span>
              <span class="text-sm">{{ data?.appName || '未知' }}</span>
            </div>
            <div>
              <span class="text-gray-400 text-sm inline-block w-20">备注</span>
              <span class="text-sm">{{ data?.description }}</span>
            </div>
          </div>
        </div>
        <div class="">
          shanhu 
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonRefresher, IonRefresherContent, IonBackButton, IonButtons } from '@ionic/vue';
import { useRoute } from 'vue-router'
import { AccountbookItem } from '@/types/bill'

const route = useRoute()

const data = ref<AccountbookItem>()

data.value = {
  id: route.query.id as unknown as number,
  description: route.query.description as unknown as string,
  amount: route.query.amount as unknown as number,
  type: route.query.type as unknown as 'income' | 'expense',
  time: route.query.time as unknown as string,
  appName: route.query.appName as unknown as string,
  category: route.query.category as unknown as string
}
</script>

<style scoped>

</style>