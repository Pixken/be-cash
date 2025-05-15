<script setup lang='ts'>
import { IonPage, IonRouterOutlet, IonTabs, IonTabBar, IonTabButton, IonLabel, IonIcon } from '@ionic/vue'
import { wallet, pieChart, addCircle, person, home } from 'ionicons/icons';
</script>

<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet />
      <ion-tab-bar slot="bottom" class="custom-tab-bar">
        <ion-tab-button tab="home" href="/tabs/home" class="tab-button">
          <ion-icon :icon="home" size="large" />
          <ion-label class="text-xs font-medium">首页</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="chart" href="/tabs/chart" class="tab-button">
          <ion-icon :icon="pieChart" size="large" />
          <ion-label class="text-xs font-medium">报表</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="add-page" href="/tabs/add-page" class="tab-button">
          <ion-icon :icon="addCircle" size="large" />
          <ion-label class="text-xs font-medium">记账</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="account" href="/tabs/account" class="tab-button">
          <ion-icon :icon="wallet" size="large" />
          <ion-label class="text-xs font-medium">账户</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="user" href="/tabs/user" class="tab-button">
          <ion-icon :icon="person" size="large" />
          <ion-label class="text-xs font-medium">我的</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<style scoped>
.custom-tab-bar {
  height: 4.5em;
  --background: white;
  border-top-left-radius: 1.5rem;
  border-top-right-radius: 1.5rem;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.06);
  padding: 0 0.5rem;
}

.tab-button {
  --color: var(--ion-color-medium);
  --color-selected: var(--ion-color-primary);
  transition: all 0.3s ease;
  border-radius: 12px;
  margin: 0.5rem 0.25rem;
}

.tab-button:hover {
  --color: var(--ion-color-primary-shade);
  background-color: rgba(14, 165, 233, 0.05);
}

.add-tab-button {
  --color: white;
  --color-selected: white;
  transition: all 0.3s ease;
  position: relative;
  margin-top: -1.5rem;
}

.add-button-circle {
  width: 56px;
  height: 56px;
  background: var(--app-gradient-primary);
  border-radius: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 0.25rem;
  box-shadow: 0 4px 15px rgba(14, 165, 233, 0.35);
  transition: transform 0.2s ease;
}

.add-button-circle:active {
  transform: scale(0.95);
}

.add-tab-button ion-label {
  color: var(--ion-color-medium);
}

ion-tab-button.tab-selected {
  position: relative;
}

ion-tab-button.tab-selected::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 30%;
  width: 40%;
  height: 3px;
  background: var(--ion-color-primary);
  border-radius: 3px;
}
</style>