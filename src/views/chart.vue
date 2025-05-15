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
    },
    xAxis: { type: 'category' },
    yAxis: {},
    series: [
      {
        type: 'bar',
        color: '#14b8a6',
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

// 使用我们的调色板定义饼图颜色
const colors = [
  '#0ea5e9', '#0284c7', '#0369a1', '#075985', // 蓝色系 (primary)
  '#d946ef', '#c026d3', '#a21caf', '#86198f', // 紫色系 (secondary)
  '#14b8a6', '#0d9488', '#0f766e', '#115e59'  // 青色系 (accent)
]

const chartOptions2 = computed<EChartsOption>(() => {
  return {
    color: colors,
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
  getInfo();
  content.value?.$el.scrollToTop(0);
});

</script>
<template>
  <ion-page>
    <be-header title="报表" />
    <ion-content ref="content" class="bg-neutral-50">
      <div class="p-5">
        <!-- 月份选择器 -->
        <div class="flex items-center justify-between mb-6 app-card bg-white py-3">
          <button class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors" @click="date = dayjs(date).subtract(1, 'month')">
            <svg-icon icon="material-symbols:arrow-back-ios-rounded" color="#475569" />
          </button>
          <div class="text-lg font-medium text-neutral-800">{{ currentDate }}</div>
          <button class="w-10 h-10 flex items-center justify-center rotate-180 rounded-full hover:bg-neutral-100 transition-colors"
            @click="date = dayjs(date).add(1, 'month')" :disabled="date.isSame(dayjs(), 'month')">
            <svg-icon icon="material-symbols:arrow-back-ios-rounded" 
              :color="date.isSame(dayjs(), 'month') ? '#94a3b8' : '#475569'"
              :class="{ 'opacity-50': date.isSame(dayjs(), 'month') }" />
          </button>
        </div>

        <!-- 月度统计卡片 -->
        <div class="app-card bg-white mb-6 overflow-hidden">
          <h2 class="text-lg font-semibold text-neutral-800 mb-4">月度概览</h2>
          <div class="grid grid-cols-3 gap-4 mb-6">
            <div class="bg-primary-50 rounded-xl p-4 flex flex-col items-center">
              <span class="text-neutral-600 mb-1">收入</span>
              <span class="text-xl font-bold text-accent-600">¥{{monthstatistics.income.toFixed(2)}}</span>
            </div>
            <div class="bg-primary-50 rounded-xl p-4 flex flex-col items-center">
              <span class="text-neutral-600 mb-1">支出</span>
              <span class="text-xl font-bold text-rose-600">¥{{monthstatistics.expense.toFixed(2)}}</span>
            </div>
            <div class="bg-primary-50 rounded-xl p-4 flex flex-col items-center">
              <span class="text-neutral-600 mb-1">结余</span>
              <span class="text-xl font-bold text-primary-600">¥{{monthstatistics.balance.toFixed(2)}}</span>
            </div>
          </div>
          <div class="h-80 w-full">
            <v-chart class="chart" :option="chartOptions" autoresize v-if="yearStatistics.length" />
            <div v-else class="flex justify-center items-center h-full">
              <p class="text-neutral-500">本年度暂无数据</p>
            </div>
          </div>
        </div>

        <!-- 分析类型选择器 -->
        <div class="app-card bg-white mb-6 overflow-hidden">
          <div class="flex items-center mb-4 relative">
            <button 
              class="px-5 py-2 text-base relative transition-all duration-200"
              :class="activeTab === '支出分析' ? 'text-primary-600 font-medium' : 'text-neutral-600'"
              @click="activeTab = '支出分析'"
            >
              支出分析
              <span v-if="activeTab === '支出分析'" class="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-0.5 bg-primary-600 rounded-full"></span>
            </button>
            <button 
              class="px-5 py-2 text-base relative transition-all duration-200"
              :class="activeTab === '收入分析' ? 'text-primary-600 font-medium' : 'text-neutral-600'"
              @click="activeTab = '收入分析'"
            >
              收入分析
              <span v-if="activeTab === '收入分析'" class="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-0.5 bg-primary-600 rounded-full"></span>
            </button>
          </div>

          <!-- 饼图分析 -->
          <div class="h-80 w-full">
            <v-chart class="chart" :option="chartOptions2" autoresize />
          </div>

          <!-- 分类明细列表 -->
          <ul class="flex flex-col gap-3 mt-4">
            <li 
              v-for="(item, index) in legendData"
              :key="index"
              class="flex items-center justify-between py-3 border-b border-neutral-100 last:border-0"
            >
              <div class="flex items-center gap-3">
                <div class="w-4 h-4 rounded-full" 
                  :style="{ backgroundColor: index < colors.length ? colors[index] : colors[index % colors.length] }">
                </div>
                <span class="text-neutral-800">{{ item }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="font-bold text-neutral-800">¥{{ analysis[EI][item][activeTab === '支出分析' ? 'totalExpense' : 'totalIncome'] }}</span>
                <span class="text-neutral-500 text-sm">
                  {{ (analysis[EI][item][activeTab === '支出分析' ? 'totalExpense' : 'totalIncome'] / (totalEI.reduce((a, b) => a + b.value, 0) || 1) * 100 ).toFixed(1) }}%
                </span>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<style scoped>
.chart {
  height: 100%;
  width: 100%;
}
</style>