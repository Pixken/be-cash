<script setup lang='ts'>
import { IonPage, IonContent, IonFab, IonFabButton, IonModal, IonButton } from '@ionic/vue'
import { onBeforeRouteLeave } from 'vue-router';

onBeforeRouteLeave((to, from, next) => {
  // 在这里执行逻辑，例如确认用户是否要离开当前页面
  // 可以通过 next() 继续导航或 next(false) 取消导航
  if (isOpen.value) {
    isOpen.value = false
    next(false)
  } else {
    next()
  }
});
interface Msg {
  isFrom: boolean
  content: string
  avatar: string
}

const msglist = ref<Msg[]>([
  {
    isFrom: true,
    content: '你好，我是小明，很高兴认识你。',
    avatar: ''
  },
  {
    isFrom: false,
    content: '你好，我是小红，很高兴认识你。qweeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    avatar: ''
  },
])
const isOpen = ref(false);

const cancel = () => {
  isOpen.value = false;
}

const confirm = () => {
  isOpen.value = false;
};
</script>

<template>
  <ion-page class="add-page">
    <be-header>添加</be-header>
    <ion-content>
      <div class="msglist">
        <ul>
          <li v-for="msg in msglist" :class="{ isFrom: msg.isFrom }">
            <img src="@/assets/bg.png" alt="">
            <div class="msg-content">{{ msg.content }}</div>
          </li>
        </ul>
      </div>
      <ion-fab class="fab" slot="fixed" vertical="bottom" horizontal="end">
        <ion-fab-button color="#ffcb3d" @click="isOpen = true"> 
          <svg-icon icon="material-symbols:add-2-rounded" style="margin-top: 0.2em;" color="#000"></svg-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
    <ion-modal :is-open="isOpen">
      <be-header >
        <template #start><ion-button @click="cancel()">返回</ion-button></template>
        添加账单
        <template #end><ion-button @click="confirm()">添加</ion-button></template>
      </be-header>
      <add-cash />
    </ion-modal>
  </ion-page>
</template>

<style scoped>
.add-page {
  background-color: #f7f7f7;
  margin-bottom: 4em;

  .msglist {
    ul {
      padding: 10px 0;

      li {
        display: flex;
        align-items: start;
        margin-bottom: 20px;

        .msg-content {
          padding: 10px;
          border-radius: 3px 20px 20px 20px;
          background-color: #f3f3f3;
          font-size: 14px;
          line-height: 1.5;
          max-width: 75%;
          text-wrap: wrap;

        }

        img {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          margin-right: 10px;
          margin-left: 10px;
        }

        &.isFrom {
          flex-direction: row-reverse;

          .msg-content {
            background: linear-gradient(to right, #ffcb3d, #ff9800);
            border-radius: 20px 3px 20px 20px;
            color: #fff;
          }
        }
      }
    }
  }

  ion-fab {
    margin-bottom: var(--ion-safe-area-bottom, 0);
  }

  .title {
    text-align: center;
  }
}
</style>
