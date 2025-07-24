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
      <NotificationListener />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
import NotificationListener from '@/components/NotificationListener.vue';
</script>

<style scoped>  
.aa {
  padding-top: env(safe-area-inset-top);
}
</style>