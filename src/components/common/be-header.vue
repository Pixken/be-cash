<script setup lang='ts'>
import { IonHeader, IonToolbar, IonTitle, IonButtons } from '@ionic/vue'


</script>

<template>
  <ion-header class="ion-no-border">
    <ion-toolbar>
      <ion-buttons slot="start">
        <slot name="start"></slot>
      </ion-buttons> 
      <ion-title class="header">
        <slot />
      </ion-title>
      <ion-buttons slot="end">
        <slot name="end"></slot>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>
</template>

<style scoped>
.header {
  text-align: center;
}
</style>