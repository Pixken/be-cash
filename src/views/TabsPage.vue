<script setup lang='ts'>
import { IonPage, IonRouterOutlet, IonTabs, IonTabBar, IonTabButton, IonLabel, IonIcon } from '@ionic/vue'
import { wallet, pieChart, addCircle, person, home } from 'ionicons/icons';
</script>

<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet />
      <ion-tab-bar slot="bottom" style="height: 4em; box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);">
        <ion-tab-button tab="home" href="/tabs/home" style="--color-selected: #4f46e5;">
          <ion-icon :icon="home" size="large" />
          <ion-label class="text-xs">首页</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="chart" href="/tabs/chart" style="--color-selected: #4f46e5;">
          <ion-icon :icon="pieChart" size="large" />
          <ion-label class="text-xs">报表</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="add-page" href="/tabs/add-page" style="--color-selected: #4f46e5;">
          <ion-icon :icon="addCircle" size="large" />
          <ion-label class="text-xs">记账</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="account" href="/tabs/account" style="--color-selected: #4f46e5;">
          <ion-icon :icon="wallet" size="large" />
          <ion-label class="text-xs">账户</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="user" href="/tabs/user" style="--color-selected: #4f46e5;">
          <ion-icon :icon="person" size="large" />
          <ion-label class="text-xs">我的</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>