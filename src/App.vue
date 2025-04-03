<template>
  <ion-app>
    <ion-toast
      position="top"
      position-anchor="header"
      class="custom-toast"
      :is-open="isOpen"
      :message="message"
      :duration="1000"
      @didDismiss="isOpen = false"
    ></ion-toast>
    <ion-router-outlet></ion-router-outlet>
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet, IonToast } from '@ionic/vue';
import emitter from './utils/emitter';

const isOpen = ref(false);
const message = ref('');
const type = ref('');
emitter.on('message', (msg: any) => {
  message.value = msg.msg;
  type.value = msg.type;
  isOpen.value = true;
})

const colors = {
  success: '#10b981',
  error: '#ef4444',
}
watch(type, (newVal) => {
  if (newVal) {
    document.querySelector('ion-toast.custom-toast')?.style.setProperty('--background', colors[newVal]);
    document.querySelector('ion-toast.custom-toast')?.style.setProperty('--color', '#fff');
  }
})
</script>
<style>
ion-toast.custom-toast {
  --background: #f4f4fa;
  --border-radius: 10px;
  --box-shadow: 3px 3px 10px 0 rgba(0, 0, 0, 0.2);
  --color: #4b4a50;
}
</style>