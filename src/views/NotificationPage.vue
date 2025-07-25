<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title size="large">通知监听</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <NotificationListener />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
import NotificationListener from '@/components/NotificationListener.vue';
import { get } from '@/utils/request';

get('/notification')
</script>

<style scoped>
</style>