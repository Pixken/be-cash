<script setup lang='ts'>
import { IonPage, IonContent, IonCard, IonHeader, IonToolbar, IonTitle } from '@ionic/vue'
</script>

<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-title>Header</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div class="wallet-container">
        <ion-card class="wechat">
          {{ 0 }}
        </ion-card>
        <ion-card class="zfb">
          {{ 0 }}
        </ion-card>
        <ion-card class="order">
        </ion-card>
      </div>
    </ion-content>
  </ion-page>
</template>

<style scoped lang="scss">
.wallet-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1em;
  padding: 0.5em;

  .wechat, .zfb {
    height: 10em;
    color: #fff;
  }

  .wechat {
    background-color: #00d86b;
  }

  .zfb {
    background-color: #007aff;
  }

 .order {
    background-color: #fff;
    grid-column: 1 / 3;
    height: 5em;
  }
}

</style>