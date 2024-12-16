<script setup lang='ts'>
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton } from '@ionic/vue'
import { cashCategories } from '@/constants/cashCategories'
import { Swiper, SwiperSlide } from 'swiper/vue';
import 'swiper/swiper-bundle.css';

const activeIndex = ref(0)
const handleChange = (index: number) => {
  activeIndex.value = index
}
const handleBack = () => {

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

      
    </div>
  </ion-content>
</template>

<style scoped lang="scss">
.add-cash {
  height: 100vh;
  overflow: hidden;
  position: relative;
  padding: 1em;
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