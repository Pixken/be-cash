<template>
  <ion-page>
    <ion-router-outlet></ion-router-outlet>
    <be-tabs :to-add="toAdd" />
    <add-cash ref="addCashRef" />
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonRouterOutlet } from '@ionic/vue';

const addCashRef = ref()

const toAdd = () => {
  addCashRef.value.showAdd()
}
</script>
