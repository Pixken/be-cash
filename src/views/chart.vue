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
import { getStatistics, getTransactionsByCategory } from '@/api/chart';
import { Analysis, DateRange, Statistics } from '@/types';

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

const monthDateRange = computed((): DateRange => {
  const start = dayjs(date.value).startOf('month').format('YYYY-MM-DD HH:mm:ss');
  const end = dayjs(date.value).endOf('month').format('YYYY-MM-DD HH:mm:ss');
  return { startDate: start, endDate: end };
})

const yearDateRange = computed((): DateRange => {
  const start = dayjs(date.value).startOf('year').format('YYYY-MM-DD HH:mm:ss');
  const end = dayjs(date.value).endOf('year').format('YYYY-MM-DD HH:mm:ss');
  return { startDate: start, endDate: end };
})

const monthstatistics = ref<Statistics>({
  balance: 0,
  income: 0,
  expense: 0
})

const yearStatistics = ref<Statistics[]>([])

const analysis = ref<Analysis>({})

const getInfo = async () => {
  const monthstat = await getStatistics(monthDateRange.value);
  const yearstat = await getStatistics(yearDateRange.value);
  monthstatistics.value = monthstat.data[0] || {
    balance: 0,
    income: 0,
    expense: 0
  };
  yearStatistics.value = yearstat.data;
  const res = await getTransactionsByCategory(monthDateRange.value);
  analysis.value = res.data;
}

watch(monthDateRange, () => {
  getInfo();
});

onMounted(() => {
  getInfo();
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
      dimensions: ['month', '收入', '支出'],
      source:  
      yearStatistics.value.map(item => {
        return {
          month: `${item.month}月`,
          收入: item.income,
          支出: item.expense
        }
      })
      // [
      //   { month: '1月', '收入': 43.3, '支出': 85.8 },
      //   { month: '2月', '收入': 83.1, '支出': 73.4 },
      //   { month: '3月', '收入': 86.4, '支出': 65.2 },
      // ]
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

const EI = computed(() => {
  return activeTab.value === '支出分析'? '支出' : '收入';
})

const totalEI = computed(() => {
  return Object.keys(analysis.value).length ? Object.keys(analysis.value[EI.value]).map(item => {
    return {
      name: item,
      value:activeTab.value === '支出分析'
        ? analysis.value['支出'][item].totalExpense
        : analysis.value['收入'][item].totalIncome
    }
  }) : []
})

const legendData = computed(() => {
  return Object.keys(analysis.value).length ? Object.keys(analysis.value[EI.value]) : []
})

const chartOptions2 = computed<EChartsOption>(() => {
  return {
    color: ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#f97316', '#9333ea', '#6366f1', '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a'],
    tooltip: {},
    legend: {
      orient: 'horizontal',
      bottom: '1%',
      left: 'center',
      data: legendData.value,
    },
    series: [
      {
        type: 'pie',
        radius: ['45%', '80%'],
        center: ['50%', '45%'],
        data: totalEI.value,
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

watch(activeTab, () => {
  if (activeTab.value === '支出分析') {
  } else {
  }
})

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
            <span class="text-xl font-bold text-green-500">¥{{monthstatistics.income.toFixed(2)}}</span>
          </div>
          <div class="bg-gray-100 rounded-2xl p-2 flex flex-col items-center justify-center">
            <span>支出</span>
            <span class="text-xl font-bold text-red-500">¥{{monthstatistics.expense.toFixed(2)}}</span>
          </div>
          <div class="bg-gray-100 rounded-2xl p-2 flex flex-col items-center justify-center">
            <span>结余</span>
            <span class="text-xl font-bold">¥{{monthstatistics.balance.toFixed(2)}}</span>
          </div>
          <div class="col-span-3 h-80 w-full">
            <v-chart class="chart" :option="chartOptions" autoresize v-if="yearStatistics.length" />
            <div v-else class="flex justify-center items-center h-full">
              <p class="text-gray-700">本年度暂无数据</p>
            </div>
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
            <li 
              class="flex items-center justify-between w-full py-1 border-b border-gray-200"
              v-for="(item,index) in legendData"
              :key="index"
            >
              <div class="flex items-center gap-2">
                <div class="w-4 h-4 bg-[#4f46e5] rounded-full"></div>
                <span>{{ item }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="font-bold">¥{{ analysis[EI][item][activeTab === '支出分析' ? 'totalExpense' : 'totalIncome'] }}</span>
                <span class="text-gray-500">
                  {{ analysis[EI][item][activeTab === '支出分析' ? 'totalExpense' : 'totalIncome'] / totalEI.reduce((a, b) => a + b.value, 0) * 100 }}%
                </span>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>