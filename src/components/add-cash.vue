<script setup lang='ts'>
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton } from '@ionic/vue'
// import { cashCategories } from '@/constants/cashCategories'
import { Swiper, SwiperSlide } from 'swiper/vue';
import 'swiper/swiper-bundle.css';

const activeIndex = ref(0)
const handleChange = (index: number) => {
  activeIndex.value = index
}
const handleBack = () => {

}

const cashCategories = {
  expense: [
    {
      id: 1,
      name: '餐饮'
    },
    {
      id: 2,
      name: '交通'
    },
    {
      id: 3,
      name: '购物'
    },
    {
      id: 4,
      name: '日用'
    },
    {
      id: 5,
      name: '娱乐'
    },
    {
      id: 6,
      name: '通讯'
    },
    {
      id: 7,
      name: '住房'
    },
    {
      id: 8,
      name: '医疗'
    },
    {
      id: 9,
      name: '保险'
    },
    {
      id: 10,
      name: '旅行'
    },
    {
      id: 11,
      name: '学习'
    },
    {
      id: 12,
      name: '孩子'
    },
    {
      id: 13,
      name: '长辈'
    },
    {
      id: 14,
      name: '礼物'
    },
    {
      id: 15,
      name: '办公'
    },
    {
      id: 16,
      name: '宠物'
    },
    {
      id: 17,
      name: '其他'
    }
  ],
  income: [
    {
      id: 1,
      name: '工资'
    },
    {
      id: 2,
      name: '奖金'
    },
    {
      id: 3,
      name: '投资'
    },
    {
      id: 4,
      name: '兼职'
    },
    {
      id: 5,
      name: '礼金'
    },
    {
      id: 6,
      name: '其他'
    }
  ]
}
</script>

<template>
  <ion-content>
    <div class="add-cash">

      <header>
        <div class="item" @click="handleChange(0)">支出</div>
        <div class="item" @click="handleChange(1)">收入</div>
        <div class="underline" :style="{ left: `${activeIndex * 3}em` }"></div>
      </header>
      <swiper :initial-slide="activeIndex" @slideChange="handleChange($event.activeIndex)">
        <swiper-slide>
          <div class="content">
            <!-- 支出内容 -->
            <div v-for="category in cashCategories.expense" :key="category.id" class="category">
              {{ category.name }}
            </div>
          </div>
        </swiper-slide>
        <swiper-slide>
          <div class="content">
            <!-- 收入内容 -->
            <div v-for="category in cashCategories.income" :key="category.id" class="category">
              {{ category.name }}
            </div>
          </div>
        </swiper-slide>
      </swiper>
      
    </div>
  </ion-content>
</template>

<style scoped lang="scss">
.add-cash {
  height: 100vh;
  overflow: hidden;
  position: relative;
  padding: 1em;

  .content {
    display: flex;
    flex-wrap: wrap;
    gap: 1em;
    padding: 1em;
    margin-top: 1em;
    background-color: #f7f7f7;
    border-radius: 1em;
    height: 100%;
    overflow-y: auto;
    .category {
      width: 30%;
      padding: 1em;
      border-radius: 1em;
      background-color: #fff;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      text-align: center;
      cursor: pointer;
    }
  }
}

header {
  display: flex;
  position: relative;

  .underline {
    width: 3em;
    height: 2px;
    position: absolute;
    bottom: 0;
    left: 0;
    background-color: #ffcb3d;
    transition: all 0.3s ease;
  }

  .item {
    width: 3em;
    height: 2em;
    text-align: center;
    line-height: 2em;
  }
}
</style>