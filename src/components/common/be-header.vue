<script setup lang='ts'>
import { IonHeader, IonToolbar, IonTitle } from '@ionic/vue'


</script>

<template>
  <ion-header class="ion-no-border">
    <ion-toolbar>
      <ion-title class="header">
        <slot />
      </ion-title>
    </ion-toolbar>
  </ion-header>
</template>

<style scoped>
.header {
  text-align: center;
}
</style>