<script setup lang='ts'>
import { cashCategories } from '@/constants/cashCategories'
import { Swiper, SwiperSlide } from 'swiper/vue';
import 'swiper/swiper-bundle.css';

const show = ref(false)

const showAdd = () => {
  show.value = true
}
const activeIndex = ref(0)
const onSlideChange = (a: { activeIndex: number; }) => {
  activeIndex.value = a.activeIndex
}

const controlledSwiper=ref<any>(null)
const setControlledSwiper = (swiper:any) => {
  controlledSwiper.value = swiper
}

const handleClick = (index: number) => {
  controlledSwiper.value.slideTo(index)
}

const footerRef = ref<HTMLElement>()
const aaaRef = ref<HTMLElement>()
watch(activeIndex, () => {
  scrollToItem(aaaRef.value?.children[activeIndex.value]!)
})
const scrollToItem = (e: Element) => {
  const itemElement = e;
  if (itemElement && footerRef.value) {
    itemElement.scrollIntoView({
      behavior: 'smooth', // 平滑滚动
      block: 'nearest', // 根据元素在容器中的位置，滚动到最近的边缘
      inline: 'nearest' // 水平方向滚动到元素的中心
    });
  }
};

defineExpose({
  showAdd
})

</script>

<template>
  <transition name="slide">
    <div class="mask" v-show="show" @click="show = false">
      <div class="add-cash " @click.stop="">
        <main>
          <swiper @slide-change="onSlideChange" @swiper="setControlledSwiper" ref="swiperRef" >
            <swiper-slide v-for="i in cashCategories">
              <div class="slider">{{ i }}</div>
            </swiper-slide>
          </swiper>
        </main>
        <footer ref="footerRef">
          <ul ref="aaaRef">
            <li v-for="(i, index) in cashCategories" @click="handleClick(index)" :class="{ active: activeIndex === index }" :ref="`liRef${index}`">
              <span>{{ i.title }}</span>
            </li>
          </ul>
          <div class="active-bg" :style="{ left: activeIndex * 3.5 + 0.3 + 'em' }"></div>
        </footer>
      </div>
    </div>
  </transition>
</template>

<style scoped lang="scss">
.mask {
  width: 100%;
  height: 100vh;
  z-index: 9999999;
}

.add-cash {
  height: 20em;
  width: 100%;
  background-color: #fff;
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.2);
  position: fixed;
  bottom: 0;
  border-radius: 10px 10px 0 0;

  footer {
    position: absolute;
    bottom: 0;
    width: 100vw;
    overflow: auto;
    white-space: nowrap;
    box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.2);
    &::-webkit-scrollbar {
      display: none;
    }

    ul {
      width: fit-content;
      display: flex;
      list-style: none;
      padding: 0 0.3em;

      li {
        width: 3.5em;
        height: 2.5em;
        line-height: 2.3em;
        padding: 0.1em;
        overflow: hidden;
        text-align: center;
        border-radius: 6px;
        z-index: 2;
        transition: all 0.3s ease;
        &.active {
          color: #ffffff;
        }
      }
    }

    .active-bg {
      width: 3.5em;
      height: 1.9em;
      position: absolute;
      top: 0;
      background: #ffcb3d;
      border-radius: 6px;
      margin: 0.3em 0;
      z-index: 1;
      transition: all 0.3s ease;
    }
  }

  main {
    .slider {
      height: 16.5em;
    }
  }
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateY(100%);
}
</style>