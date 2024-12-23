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

const checkedCategory = ref('')
const handleChecked = (category: any) => {
  checkedCategory.value = category.name
}

const showKeyboard = ref(false)
const keyboard = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '.', '删除', '清空', '完成']
const keyboardVal = ref('')

const handleInputKeyboardVal = (key: string) => {
  if (key === '完成') {
    showKeyboard.value = false
    // todo 提交数据 keyboardVal
    return
  }
  if (key === '删除') {
    keyboardVal.value = keyboardVal.value.slice(0, -1)
  } else {
    keyboardVal.value += key
  }
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
      <main>
        <swiper :initial-slide="activeIndex" @slideChange="handleChange($event.activeIndex)">
        <swiper-slide>
          <div class="content">
            <!-- 支出内容 -->
            <div v-for="category in cashCategories.expense" :key="category.id" class="category" @click="handleChecked(category)">
              {{ category.name }}
            </div>
          </div>
        </swiper-slide>
        <swiper-slide>
          <div class="content">
            <!-- 收入内容 -->
            <div v-for="category in cashCategories.income" :key="category.id" class="category" @click="handleChecked(category)">
              {{ category.name }}
            </div>
          </div>
        </swiper-slide>
      </swiper>
      </main>
      <footer :class="{ show: showKeyboard }">
        <div class="ipt" @click="showKeyboard = true">
          <div>{{ checkedCategory }}</div>
          <div>{{ keyboardVal }}</div>
        </div>
        <div class="keyboard">
          <div class="num" v-for="key in keyboard" :key="key" @click="handleInputKeyboardVal(key)">{{ key }}</div>
        </div>
      </footer>
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
      width: calc(30% - 1px);
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

footer {
  position: absolute;
  bottom: -9em;
  left: 0;
  width: 100%;

  &.show {
    bottom: 0;
  }

  .keyboard {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1px;
    margin-top: 1em;
    .num {
      height: 3em;
      text-align: center;
      line-height: 3em;
      background-color: #fff;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      cursor: pointer;
    }
  }
}
</style>