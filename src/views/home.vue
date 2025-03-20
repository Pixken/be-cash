<script setup lang='ts'>
import { IonPage, IonContent, IonIcon, IonHeader, IonToolbar, IonTitle } from '@ionic/vue'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'; // 引入中文语言包
import { add, notifications, pieChart, swapHorizontalOutline, wallet } from 'ionicons/icons';
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
use([
  CanvasRenderer,
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
]);

provide(THEME_KEY, 'light');

dayjs.locale('zh-cn'); // 设置为中文
const date = dayjs().format('YYYY年MM月DD日 dddd')

const option = ref<EChartsOption>({
  color: ['#4f46e5', '#10b981', '#f59e0b', '#ef4444'],
  tooltip: {
    trigger: 'item',
    formatter: '{a} <br/>{b} : {c} ({d}%)',
  },
  legend: {
    orient: 'horizontal',
    bottom: '1%',
    left: 'center',
    data: ['餐饮', '交通', '购物', '其他'],
    itemWidth: 20,
    itemHeight: 20,
    itemGap: 30,
  },
  series: [
    {
      type: 'pie',
      radius: ['45%', '80%'],
      center: ['50%', '45%'],
      data: [
        { value: 335, name: '餐饮' },
        { value: 310, name: '交通' },
        { value: 234, name: '购物' },
        { value: 135, name: '其他' },
      ],
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
});

const transactions = ref([
  {
    icon: 'material-symbols:fork-spoon-rounded',
    name: '午餐',
    amount: -38,
    time: '今天 12:30',
    type: '餐饮',
    color: '#4f46e5',
    id: 1,
  },
  {
    icon: 'hugeicons:money-03',
    name: '工资',
    amount: 10000,
    time: '今天 12:30',
    type: '收入',
    color: '#10b981',
    id: 2,
  },
])
</script>

<template>
  <ion-page>
    <ion-content>
      <div class="p-4">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold mb-2">你好，小蛋</h1>
            <p class="text-sm text-gray-500">{{ date }}</p>
          </div>
          <div>
            <ion-icon :icon="notifications" class="text-gray-500 text-3xl"></ion-icon>
          </div>
        </div>
        <div style="background: linear-gradient(135deg, #4f46e5 0%, #818cf8 100%);"
          class="w-full h-48 rounded-2xl text-white mt-4 p-4 flex flex-col justify-between">
          <div>
            <h2 class="text-lg mb-1">本月结余</h2>
            <p class="text-4xl font-bold">¥ 3,245.60</p>
          </div>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-lg mb-1">收入</p>
              <p class="text-xl font-bold">¥ 8,560.00</p>
            </div>
            <div>
              <p class="text-lg mb-1">支出</p>
              <p class="text-xl font-bold">¥ 5,314.40</p>
            </div>
          </div>
        </div>
        <ul class="w-full flex justify-between mt-4 px-2">
          <li class="flex flex-col items-center gap-2">
            <div class="bg-[#EEF2FF] rounded-2xl w-16 h-16 flex items-center justify-center">
              <ion-icon :icon="add" class="text-[#4f46e5] text-3xl"></ion-icon>
            </div>
            <p class="text-sm">记一笔</p>
          </li>
          <li class="flex flex-col items-center gap-2">
            <div class="bg-[#ECFDF5] rounded-2xl w-16 h-16 flex items-center justify-center">
              <ion-icon :icon="swapHorizontalOutline" class="text-[#10b981] text-3xl"></ion-icon>
            </div>
            <p class="text-sm">转账</p>
          </li>
          <li class="flex flex-col items-center gap-2">
            <div class="bg-[#FEF3C7] rounded-2xl w-16 h-16 flex items-center justify-center">
              <ion-icon :icon="pieChart" class="text-[#f59e0b] text-3xl"></ion-icon>
            </div>
            <p class="text-sm">报表</p>
          </li>
          <li class="flex flex-col items-center gap-2">
            <div class="bg-[#FEE2E2] rounded-2xl w-16 h-16 flex items-center justify-center">
              <ion-icon :icon="wallet" class="text-[#ef4444] text-3xl"></ion-icon>
            </div>
            <p class="text-sm">账户</p>
          </li>
        </ul>
        <div class="w-full h-96 rounded-2xl mt-4 p-4 flex flex-col justify-between border border-[#E5E7EB]">
          <div class="flex items-center justify-between">
            <p>本月支出分析</p>
            <span class="text-sm text-[#4f46e5]">查看更多</span>
          </div>
          <v-chart class="chart" :option="option" autoresize />
        </div>
        <div class="w-full mt-4">
          <div class="flex items-center justify-between">
            <p>最近交易</p>
            <span class="text-sm text-[#4f46e5]">查看全部</span>
          </div>
          <ul class="mt-4">
            <li class="flex items-center justify-between py-4 border-b border-[#E5E7EB]" v-for="item in transactions"
              :key="item.id">
              <div class="flex items-center gap-2">
                <div class="flex items-center justify-center w-12 h-12 rounded-full" :style="{ backgroundColor: item.color }">
                  <svg-icon :icon="item.icon" color="#ffffff"></svg-icon>
                </div>
                <div class="h-12 flex flex-col justify-between">
                  <p class="text-base font-bold">{{ item.name }}</p>
                  <p class="text-sm text-[#7a818a]">{{ item.time }} · {{ item.type }}</p>
                </div>
              </div>
              <p class="text-base font-bold"
                :class="{ 'text-[#ef4444]': item.amount < 0, 'text-[#10b981]': item.amount > 0 }">
                {{ item.amount < 0 ? '-¥' : '+¥' }}{{ Math.abs(item.amount) }} </p>
            </li>
          </ul>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>