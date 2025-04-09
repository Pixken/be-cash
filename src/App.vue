<template>
  <ion-app>
    <ion-toast
      position="top"
      position-anchor="header"
      class="custom-toast"
      :is-open="isOpen"
      :message="message"
      :duration="3000"
      @didDismiss="isOpen = false"
    ></ion-toast>
    <ion-router-outlet></ion-router-outlet>
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet, IonToast } from '@ionic/vue';
import { ref, watch } from 'vue';
import emitter from './utils/emitter';

const isOpen = ref(false);
const message = ref('');
const type = ref<'success' | 'error' | ''>('');

// 监听消息事件
emitter.on('message', (msg) => {
  message.value = formatMessage(msg.msg, msg.type);
  type.value = msg.type;
  isOpen.value = true;
});

// 为不同类型的消息添加前缀图标
const formatMessage = (msg: string, messageType: 'success' | 'error'): string => {
  const icons = {
    success: '✓ ',
    error: '✗ '
  };
  return icons[messageType] + msg;
};

// 为不同类型的消息设置不同颜色
const colors: Record<string, string> = {
  success: '#10b981',
  error: '#ef4444'
};

// 监听类型变化，应用相应样式
watch(type, (newVal) => {
  if (newVal && colors[newVal]) {
    const toastElement = document.querySelector('ion-toast.custom-toast') as HTMLElement;
    if (toastElement && toastElement.style) {
      toastElement.style.setProperty('--background', colors[newVal]);
      toastElement.style.setProperty('--color', '#fff');
    }
  }
});
</script>

<style>
/* 自定义Toast样式 */
ion-toast.custom-toast {
  --background: #f4f4fa;
  --border-radius: 12px;
  --box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  --color: #4b4a50;
  --padding-top: 12px;
  --padding-bottom: 12px;
  --padding-start: 16px;
  --padding-end: 16px;
  font-weight: 500;
  font-size: 14px;
  letter-spacing: 0.3px;
  margin-top: 16px;
}
</style>