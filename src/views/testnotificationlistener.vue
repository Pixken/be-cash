<template>
  <ion-page>
    <be-header title="Test Notification Listener" show-back />
    <ion-content :class="{ 'ion-padding': false }">
      <div>
        <h1>Test Notification Listener</h1>
        <p v-if="notification">{{ notification }}</p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { App } from '@capacitor/app';
import { ref, onMounted, onUnmounted } from 'vue';

const notification = ref<any>(null);

// 启动监听
const startListener = async () => {
  App.addListener('onNotificationPosted', (data: any) => {
    notification.value = data;
    console.log('Received notification:', data);
  });
};

onMounted(() => {
  startListener();
});

onUnmounted(() => {
  App.removeAllListeners(); // 清理监听
});
</script>