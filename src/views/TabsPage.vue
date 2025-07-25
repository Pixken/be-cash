<script setup lang='ts'>
import { IonPage, IonRouterOutlet, IonTabs, IonTabBar, IonTabButton, IonLabel, IonIcon } from '@ionic/vue'
import { wallet } from 'ionicons/icons';
</script>

<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet />
      <ion-tab-bar slot="bottom" style="height: 4em; background-color: #fff;">
        <ion-tab-button tab="accountbook" href="/tabs/accountbook" style="--color-selected: #3b82f6; --background: #fff;">
          <ion-icon :icon="wallet" size="large" />
          <ion-label class="text-xs">账本</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>