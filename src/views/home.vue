<script setup lang="ts">
import { IonPage, IonContent, IonFab, IonFabButton, IonIcon, onIonViewDidEnter } from '@ionic/vue';
import { add, notifications, pieChart, swapHorizontalOutline, wallet } from 'ionicons/icons';
import { useRouter } from 'vue-router';
import { ref, onMounted, computed } from 'vue';
import useUserStore from '@/store/user';
import { useBillStore } from '@/store/bill';
import type { BillVO } from '@/types/bill';
import emitter from '@/utils/emitter';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { PieChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
} from 'echarts/components';
import VChart, { THEME_KEY } from 'vue-echarts';
import type { EChartsOption } from 'echarts';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';

dayjs.locale('zh-cn');

use([
  CanvasRenderer,
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
]);

provide(THEME_KEY, 'light');

const router = useRouter();
const userStore = useUserStore();
const billStore = useBillStore();
const bills = ref<BillVO[]>([]);
const isLoading = ref(true);

// 获取账单列表
const fetchBills = async () => {
  try {
    isLoading.value = true;
    const response = await billStore.getBills(userStore.user.id);
    console.log(response)
    bills.value = response.data;
  } catch (error) {
    emitter.emit('message', { msg: '获取账单失败', type: 'error' });
  } finally {
    isLoading.value = false;
  }
};

// 计算收支统计
const income = computed(() => {
  return bills.value
    .filter(bill => bill.type === 'income')
    .reduce((sum, bill) => sum + bill.price, 0);
});

const expense = computed(() => {
  return bills.value
    .filter(bill => bill.type === 'expense')
    .reduce((sum, bill) => sum + bill.price, 0);
});

// 图表配置
const chartOption = computed<EChartsOption>(() => ({
  color: ['#4f46e5', '#10b981', '#f59e0b', '#ef4444'],
  tooltip: {
    trigger: 'item',
    formatter: '{b}: {c} ({d}%)'
  },
  legend: {
    orient: 'horizontal',
    bottom: '1%',
    left: 'center',
    data: bills.value
      .filter(bill => bill.type === 'expense')
      .map(bill => bill.category.name),
    itemWidth: 20,
    itemHeight: 20,
    itemGap: 30,
  },
  series: [
    {
      type: 'pie',
      radius: ['45%', '80%'],
      center: ['50%', '45%'],
      data: bills.value
        .filter(bill => bill.type === 'expense')
        .map(bill => ({
          value: bill.price,
          name: bill.category.name,
        })),
      labelLine: {
        show: false
      },
      label: {
        show: false
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)',
        },
      },
    },
  ],
}));

// 格式化金额
const formatAmount = (amount: number) => {
  return amount.toFixed(2);
};

// 格式化日期
const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD');
};

onMounted(() => {
  if (!userStore.user) {
    router.push('/login');
    return;
  }
  fetchBills();
});

const content = ref();

onIonViewDidEnter(() => {
  fetchBills();
  content.value?.$el.scrollToTop(0);
})
</script>

<template>
  <ion-page>
    <ion-content ref="content" class="ion-padding">
      <!-- 背景渐变和装饰元素 -->
      <div class="absolute top-0 left-0 w-full h-64 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-b-[40px] z-0"></div>
      <div class="absolute top-10 right-10 w-24 h-24 bg-white opacity-10 rounded-full"></div>
      <div class="absolute top-40 left-10 w-16 h-16 bg-white opacity-10 rounded-full"></div>
      
      <!-- 主要内容区域 -->
      <div class="relative z-10 h-full flex flex-col">
        <!-- 顶部用户信息 -->
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center overflow-hidden mr-4">
              <img src="@/assets/zxd.png" alt="" class="w-full h-full object-cover">
            </div>
            <div>
              <h1 class="text-xl font-bold text-white">小蛋</h1>
              <p class="text-gray-100 text-sm">欢迎回来</p>
            </div>
          </div>
          <div @click="router.push('/notifications')" class="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center cursor-pointer hover:bg-opacity-30 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
        </div>
        
        <!-- 账单统计卡片 -->
        <div class="bg-white rounded-3xl shadow-xl p-6 mb-6 animate-slide-up">
          <h2 class="text-lg font-semibold text-gray-800 mb-4">本月账单统计</h2>
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-indigo-50 rounded-xl p-4">
              <div class="flex items-center justify-between mb-2">
                <span class="text-gray-600">收入</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clip-rule="evenodd" />
                </svg>
              </div>
              <p class="text-2xl font-bold text-green-600">¥{{ formatAmount(income) }}</p>
            </div>
            <div class="bg-indigo-50 rounded-xl p-4">
              <div class="flex items-center justify-between mb-2">
                <span class="text-gray-600">支出</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clip-rule="evenodd" />
                </svg>
              </div>
              <p class="text-2xl font-bold text-red-600">¥{{ formatAmount(expense) }}</p>
            </div>
          </div>
        </div>
        
        <!-- 快捷操作按钮 -->
        <div class="flex justify-between mb-6 p-4">
          <div @click="router.push('/tabs/add-page')" class="flex flex-col items-center cursor-pointer">
            <div class="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-2">
              <ion-icon :icon="add" class="text-indigo-500 text-2xl"></ion-icon>
            </div>
            <span class="text-sm text-gray-600">记一笔</span>
          </div>
          <div @click="router.push('/tabs/transfer')" class="flex flex-col items-center cursor-pointer">
            <div class="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mb-2">
              <ion-icon :icon="swapHorizontalOutline" class="text-green-500 text-2xl"></ion-icon>
            </div>
            <span class="text-sm text-gray-600">转账</span>
          </div>
          <div @click="router.push('/tabs/chart')" class="flex flex-col items-center cursor-pointer">
            <div class="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center mb-2">
              <ion-icon :icon="pieChart" class="text-yellow-500 text-2xl"></ion-icon>
            </div>
            <span class="text-sm text-gray-600">统计</span>
          </div>
          <div @click="router.push('/tabs/account')" class="flex flex-col items-center cursor-pointer">
            <div class="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mb-2">
              <ion-icon :icon="wallet" class="text-red-500 text-2xl"></ion-icon>
            </div>
            <span class="text-sm text-gray-600">账户</span>
          </div>
        </div>
        
        <!-- 支出分析图表 -->
        <div class="bg-white rounded-3xl shadow-xl p-6 mb-6 animate-slide-up">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-gray-800">支出分析</h2>
            <span class="text-sm text-indigo-600 cursor-pointer">查看更多</span>
          </div>
          <div class="h-64">
            <v-chart class="w-full h-full" :option="chartOption" autoresize />
          </div>
        </div>
        
        <!-- 账单列表 -->
        <div class="flex-1 bg-white rounded-3xl shadow-xl p-6 animate-slide-up">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-lg font-semibold text-gray-800">账单记录</h2>
            <div class="flex items-center space-x-2">
              <button class="px-3 py-1 text-sm text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
                全部
              </button>
              <button class="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                收入
              </button>
              <button class="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                支出
              </button>
            </div>
          </div>
          
          <!-- 加载状态 -->
          <div v-if="isLoading" class="flex items-center justify-center h-40">
            <svg class="animate-spin h-8 w-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          
          <!-- 空状态 -->
          <div v-else-if="bills.length === 0" class="flex flex-col items-center justify-center h-40 text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p class="text-lg">暂无账单记录</p>
            <p class="text-sm mt-2 text-indigo-600 cursor-pointer" @click="router.push('/tabs/add-page')">+添加新账单</p>
          </div>
          
          <!-- 账单列表 -->
          <div v-else class="space-y-4">
            <div v-for="bill in bills" :key="bill.id" 
              class="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
              @click="router.push(`/bill/${bill.id}`)"
            >
              <div class="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-4">
                <svg-icon :icon="bill.icon" color="#6366f1" size="20"></svg-icon>
              </div>
              <div class="flex-1">
                <div class="flex items-center justify-between">
                  <h3 class="text-gray-800 font-medium">{{ bill.category.name }}</h3>
                  <span :class="bill.type === 'income' ? 'text-green-600' : 'text-red-600'" class="font-semibold">
                    {{ bill.type === 'income' ? '+' : '-' }}¥{{ formatAmount(bill.price) }}
                  </span>
                </div>
                <div class="flex items-center justify-between mt-1">
                  <p class="text-gray-500 text-sm">{{ bill.description }}</p>
                  <span class="text-gray-400 text-sm">{{ formatDate(bill.date) }}</span>
                </div>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- AI助手按钮 -->
      <AI />
    </ion-content>
  </ion-page>
</template>

<style scoped>
/* 自定义动画 */
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

.animate-slide-up {
  animation: slide-up 0.5s ease-out forwards;
}

/* 自定义滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a0aec0;
}
</style>