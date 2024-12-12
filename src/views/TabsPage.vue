<template>
  <ion-page>
    <ion-router-outlet></ion-router-outlet>
    <be-tabs :to-add="toAdd" />
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonRouterOutlet, IonModal, IonButton } from '@ionic/vue';

const addCashRef = ref()

const toAdd = () => {
  addCashRef.value.showAdd()
}
</script>
