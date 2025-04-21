<script setup lang="ts">
import { IonPage, IonContent, onIonViewDidEnter } from '@ionic/vue';
import svgIcon from '@/components/common/svg-icon.vue';
import dayjs from 'dayjs';
import { use } from 'echarts/core'
import { BarChart, PieChart } from 'echarts/charts'
import {
  LegendComponent,
  TooltipComponent,
  DatasetComponent,
  GridComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts';
import type { EChartsOption } from 'echarts';

use([
  LegendComponent,
  TooltipComponent,
  DatasetComponent,
  GridComponent,
  BarChart,
  PieChart,
  CanvasRenderer
])
const date = ref(dayjs());

const currentDate = computed(() => {
  return dayjs(date.value).format('YYYY年MM月');
});

const chartOptions = computed<EChartsOption>(() => {
  return {
    grid: {
      left: '3%',
      right: '3%',
      bottom: '0%',
      containLabel: true
    },
    legend: {
      left: 'center',
      top: '5%',
    },
    tooltip: {},
    dataset: {
      dimensions: ['product', '收入', '支出'],
      source: [
        { product: '1月', '收入': 43.3, '支出': 85.8 },
        { product: '2月', '收入': 83.1, '支出': 73.4 },
        { product: '3月', '收入': 86.4, '支出': 65.2 },
      ]
    },
    xAxis: { type: 'category' },
    yAxis: {},
    // Declare several bar series, each will be mapped
    // to a column of dataset.source by default.
    series: [
      {
        type: 'bar',
        color: '#10b981',
        itemStyle: { borderRadius: [10, 10, 0, 0] }
      },
      {
        type: 'bar',
        color: '#ef4444',
        itemStyle: { borderRadius: [10, 10, 0, 0] }
      }
    ]
  }
});

const activeTab = ref('支出分析');

const chartOptions2 = computed<EChartsOption>(() => {
  return {
    color: ['#4f46e5', '#10b981', '#f59e0b', '#ef4444'],
    tooltip: {},
    legend: {
      orient: 'horizontal',
      bottom: '1%',
      left: 'center',
      data: ['餐饮', '交通', '购物', '其他']
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
  }
});

const content = ref();

onIonViewDidEnter(() => {
  content.value?.$el.scrollToTop(0);
});

</script>
<template>
  <ion-page>
    <be-header title="报表" />
    <ion-content ref="content">
      <div class="p-4">
        <div class="flex items-center justify-between">
          <button class="w-10 h-10 flex items-center justify-center" @click="date = dayjs(date).subtract(1, 'month')">
            <svg-icon icon="material-symbols:arrow-back-ios-rounded" color="#000" />
          </button>
          <div>{{ currentDate }}</div>
          <button class="w-10 h-10 flex items-center justify-center rotate-180"
            @click="date = dayjs(date).add(1, 'month')" :disabled="date.isSame(dayjs(), 'month')">
            <svg-icon icon="material-symbols:arrow-back-ios-rounded" color="#000"
              :class="{ 'opacity-50': date.isSame(dayjs(), 'month') }" />
          </button>
        </div>
        <div class="mt-4 grid grid-cols-3 gap-2 rounded-2xl border border-gray-200 p-4">
          <div class="bg-gray-100 rounded-2xl p-2 flex flex-col items-center justify-center">
            <span>收入</span>
            <span class="text-xl font-bold text-green-500">¥8,560.00</span>
          </div>
          <div class="bg-gray-100 rounded-2xl p-2 flex flex-col items-center justify-center">
            <span>支出</span>
            <span class="text-xl font-bold text-red-500">¥8,560.00</span>
          </div>
          <div class="bg-gray-100 rounded-2xl p-2 flex flex-col items-center justify-center">
            <span>结余</span>
            <span class="text-xl font-bold">¥8,560.00</span>
          </div>
          <div class="col-span-3 h-80 w-full">
            <v-chart class="chart" :option="chartOptions" autoresize />
          </div>
        </div>
        <div class="mt-2">
          <div class="flex items-center py-4 gap-4 relative">
            <span class="w-20 text-lg text-center transition-all duration-300"
              :class="{ 'text-[#4245dc]': activeTab === '支出分析' }" @click="activeTab = '支出分析'">支出分析</span>
            <span class="w-20 text-lg text-center transition-all duration-300"
              :class="{ 'text-[#4245dc]': activeTab === '收入分析' }" @click="activeTab = '收入分析'">收入分析</span>
            <!-- <span class="w-20 text-lg text-center transition-all duration-300"
              :class="{ 'text-[#4245dc]': activeTab === '趋势' }" @click="activeTab = '趋势'">趋势</span> -->
            <span class="absolute left-0 bottom-0 w-20 h-[2px] bg-[#4245dc] transition-all duration-300"
              :style="{ transform: `translateX(${activeTab === '支出分析' ? '0' : activeTab === '收入分析' ? 'calc(100% + 1rem)' : 'calc(200% + 2rem)'})` }"></span>
          </div>
        </div>
        <div class="mt-2 rounded-2xl border border-gray-200 p-4">
          <div class="h-80 w-full">
            <v-chart class="chart" :option="chartOptions2" autoresize />
          </div>
          <ul class="flex flex-col items-center justify-between gap-2 text-xl mt-4">
            <li class="flex items-center justify-between w-full py-1 border-b border-gray-200">
              <div class="flex items-center gap-2">
                <div class="w-4 h-4 bg-[#4f46e5] rounded-full"></div>
                <span>餐饮</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="font-bold">¥100.00</span>
                <span class="text-gray-500">10%</span>
              </div>
            </li>
            <li class="flex items-center justify-between w-full py-1 border-b border-gray-200">
              <div class="flex items-center gap-2">
                <div class="w-4 h-4 bg-[#10b981] rounded-full"></div>
                <span>交通</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="font-bold">¥100.00</span>
                <span class="text-gray-500">10%</span>
              </div>
            </li>
            <li class="flex items-center justify-between w-full py-1 border-b border-gray-200">
              <div class="flex items-center gap-2">
                <div class="w-4 h-4 bg-[#f59e0b] rounded-full"></div>
                <span>购物</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="font-bold">¥100.00</span>
                <span class="text-gray-500">10%</span>
              </div>
            </li>
            <li class="flex items-center justify-between w-full py-1">
              <div class="flex items-center gap-2">
                <div class="w-4 h-4 bg-[#ef4444] rounded-full"></div>
                <span>其他</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="font-bold">¥100.00</span>
                <span class="text-gray-500">10%</span>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>