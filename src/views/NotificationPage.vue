<template>
  <ion-page>
    <div class="aa"></div>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>通知监听</ion-title>
      </ion-toolbar>
    </ion-header>
    
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">通知监听</ion-title>
        </ion-toolbar>
      </ion-header>
      <button @click="test">test</button>
      <NotificationListener />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
import NotificationListener from '@/components/NotificationListener.vue';

const test = () => {
  fetch('http://117.72.49.27:3000/notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: '1',
        content: '1',
        appName: '1'
      })
    }).then(res => {
      console.log(res);
    }).catch(err => {
      console.error('发送通知失败:', err);
    }); 
}
</script>

<style scoped>  
.aa {
  padding-top: env(safe-area-inset-top);
}
</style>