<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-title>
          <div class="w-full text-center text-white font-bold">记账本</div>
        </ion-title>
      </ion-toolbar>
      <div class="bg-blue-500 text-white py-3 px-5 text-sm font-bold">
        <div>
          总余额¥<span>{{ totalBalance }}</span>
        </div>
        总支出¥<span class="pr-2">{{ totalExpense }}</span>总收入¥<span>{{ totalIncome }}</span>
      </div>
    </ion-header>
    <ion-content>
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>
      <div v-for="(computedAccountbook, key) in computedAccountbookList" :key="key" class="m-2 bg-white rounded-lg px-4 pt-6 pb-4">
        <div class="flex justify-between items-center mb-11">
          <span class="font-bold">{{ key }}</span>
          <div class="text-sm flex items-center gap-5">
            <span class="text-gray-500 flex items-center gap-2">
              <span>出</span>
              <span class="text-black font-bold">{{ computedAccountbook.filter(item => item.type === 'expense').reduce((acc, item) => acc + item.amount, 0).toFixed(2) }}</span>
            </span>
            <span class="text-gray-500 flex items-center gap-2">
              <span>入</span>
              <span class="text-black font-bold">{{ computedAccountbook.filter(item => item.type === 'income').reduce((acc, item) => acc + item.amount, 0).toFixed(2) }}</span>
            </span>
          </div>
        </div>
        <template  v-for="(accountbook, index) in computedAccountbook" :key="accountbook.id">
          <div class="w-full h-[1px] bg-gray-200" v-if="index !== 0"></div>
          <div class="flex justify-between h-10 gap-3 mt-5 accountbook" @click="handleDetail(accountbook)">
            <div class="flex items-center justify-center w-10 h-10 bg-blue-500 rounded-full">
              <img src="@/assets/money.svg" alt="" class="w-7 h-7">
            </div>
            <div class="flex-1 flex flex-col justify-center desc overflow-hidden">
              <span class="">{{ accountbook.category || '其他' }}</span>
              <span class="text-xs text-gray-500 desc-text">{{ getTime(accountbook.time) }} <span class="text-gray-300">|</span> {{ accountbook.description }}</span>
            </div>
            <div class="w-20 text-right font-bold">{{ accountbook.type === 'expense' ? '-' + accountbook.amount.toFixed(2) : '+' + accountbook.amount.toFixed(2) }}</div>
          </div>
        </template>
      </div>
      <div v-if="!accountbookList.length" class="w-full h-full flex justify-center items-center text-gray-500">
        暂无数据
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonRefresher, IonRefresherContent, onIonViewDidEnter } from '@ionic/vue';
import { getBill } from '@/api/bill';
import { userInfo } from '@/api/user';
import { useRouter } from 'vue-router';
import { AccountbookItem } from '@/types/bill';
import { storage } from '@/utils/storage';

const router = useRouter()

const accountbookList = ref<AccountbookItem[]>([])

const getTime = (time: string) => {
  const date = new Date(time)
  return `${date.getHours() < 10 ? '0' + date.getHours() : date.getHours()}:${date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()}`
}

const computedAccountbookList = computed(() => {
  const res: {
    [key: string]: AccountbookItem[]
  } = {}
  accountbookList.value.forEach(item => {
    const time = new Date(item.time.split(' ')[0])
    const key = `${time.getMonth() + 1}月${time.getDate()}日`
    if (res[key]) {
      res[key].push(item)
    } else {
      res[key] = [item]
    }
  })
  return res
})

const totalIncome = computed(() => {
  return accountbookList.value.filter(item => item.type === 'income').reduce((acc, item) => acc + item.amount, 0).toFixed(2)
})

const totalExpense = computed(() => {
  return accountbookList.value.filter(item => item.type === 'expense').reduce((acc, item) => acc + item.amount, 0).toFixed(2)
})

const totalBalance = ref(0)

const handleRefresh = async (event: any) => {
  console.log('refreshed');
  try {
    await getBillList()
  } finally {
    event.target.complete();
  }
}

const getBillList = async () => {
  const res = await getBill()
  accountbookList.value = res.data.map((item: any) => ({
    ...item,
    time: item.date,
    category: item.name,
  }))
}

const handleDetail = (accountbook: AccountbookItem) => {
  router.push({
    path: '/a',
    query: {
      id: accountbook.id,
      description: accountbook.description,
      amount: accountbook.amount,
      type: accountbook.type,
      time: accountbook.time,
      appName: accountbook.appName,
      category: accountbook.category
    }
  })
}

const getBalance = async () => {
  const res = await userInfo(storage.getItem('user_info')?.id)
  totalBalance.value = (res.data.balance || 0).toFixed(2)
}

onIonViewDidEnter(async () => {
  await getBillList()
  await getBalance()
})
</script>

<style scoped>
ion-toolbar {
  --background: #3b82f6;
}

.accountbook:not(:last-child) {
  margin-bottom: 20px;
}

.desc-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>