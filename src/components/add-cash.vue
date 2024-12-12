<script setup lang='ts'>
import { IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/vue'
import { cashCategories } from '@/constants/cashCategories'
import { Swiper, SwiperSlide } from 'swiper/vue';
import 'swiper/swiper-bundle.css';

const activeIndex = ref(0)
const handleChange = (index: number) => {
  activeIndex.value = index
}
</script>

<template>
  <ion-header class="ion-no-border">
    <ion-toolbar>
      <ion-title>Header</ion-title>
    </ion-toolbar>
  </ion-header>
  <ion-content>
    <header>
      <div class="item" @click="handleChange(0)">支出</div>
      <div class="item" @click="handleChange(1)">收入</div>
      <div class="underline" :style="{ left: `${activeIndex * 3}em` }"></div>
    </header>
  </ion-content>
  <!-- <div class="add-cash">
    <header>
      <div class="input">
        <span class="name">咸蛋</span>
        <span class="num">0.00</span>
      </div>
    </header>
    <main>
      <swiper @slide-change="onSlideChange" @swiper="setControlledSwiper" ref="swiperRef">
        <swiper-slide v-for="i in cashCategories">
          <div class="slider">
            <ul>
              <li v-for="item in 50">
                <span class="icon" :style="{ backgroundColor: i.color }">
                  <svg-icon :icon="'mdi:bus'" size="2em" />
                </span>
                <span class="text">{{ 'test' }}</span>
              </li>
              <li>
                <span class="icon add">
                  <svg-icon :icon="'mdi:plus'" size="2em" color="#ffcb3d" />
                </span>
                <span class="text">添加</span>
              </li>
            </ul>
          </div>
        </swiper-slide>
      </swiper>
    </main>
    <footer ref="footerRef">
      <ul ref="aaaRef">
        <li v-for="(i, index) in cashCategories" @click="handleClick(index)"
          :class="{ active: activeIndex === index }" :ref="`liRef${index}`">
          <span>{{ i.title }}</span>
        </li>
      </ul>
      <div class="active-bg" :style="{ left: activeIndex * 3.5 + 0.3 + 'em' }"></div>
    </footer>
  </div> -->
</template>

<style scoped lang="scss">
// .add-cash {
//   height: 100%;
//   width: 100%;
//   background-color: #fff;
//   box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.2);
//   position: fixed;
//   bottom: 0;
//   border-radius: 10px 10px 0 0;

//   header {
//     height: 3em;
//     width: 100%;
//     padding: 0.3em;
//     padding-bottom: 0.5em;

//     .input {
//       width: 100%;
//       height: 100%;
//       display: flex;
//       align-items: center;
//       padding: 0 1em;
//       border: 1px solid #ffcb3d;
//       border-radius: 1.5em;
//       .name {
//         width: 3em;
//       }
//       .num {
//         flex: 1;
//         text-align: right;
//       }
//     }
//   }

//   footer {
//     position: absolute;
//     bottom: 0;
//     width: 100vw;
//     overflow: auto;
//     white-space: nowrap;
//     box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.2);

//     &::-webkit-scrollbar {
//       display: none;
//     }

//     ul {
//       width: fit-content;
//       display: flex;
//       list-style: none;
//       padding: 0 0.3em;

//       li {
//         width: 3.5em;
//         height: 2.5em;
//         line-height: 2.3em;
//         padding: 0.1em;
//         overflow: hidden;
//         text-align: center;
//         border-radius: 6px;
//         z-index: 2;
//         transition: all 0.3s ease;

//         &.active {
//           color: #ffffff;
//         }
//       }
//     }

//     .active-bg {
//       width: 3.5em;
//       height: 1.9em;
//       position: absolute;
//       top: 0;
//       background: #ffcb3d;
//       border-radius: 6px;
//       margin: 0.3em 0;
//       z-index: 1;
//       transition: all 0.3s ease;
//     }
//   }

//   main {
//     .slider {
//       height: 14.5em;
//       overflow: scroll;

//       ul {
//         list-style: none;
//         display: grid;
//         gap: 5px;
//         grid-template-columns: repeat(5, 1fr);

//         li {
//           display: flex;
//           flex-direction: column;
//           align-items: center;
//           justify-content: center;

//           .icon {
//             margin: auto;
//             border-radius: 9999px;
//             width: 3em;
//             height: 3em;
//             color: #fff;
//             display: block;
//             position: relative;

//             i {
//               position: absolute;
//               top: calc(50% - 1em);
//               left: calc(50% - 1em);
//             }
//           }
//         }
//       }
//     }
//   }
// }
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