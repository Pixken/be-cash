<script setup lang='ts'>
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton } from '@ionic/vue'
import { chevronBackOutline } from 'ionicons/icons'
import { useRouter } from 'vue-router'

const router = useRouter()

defineProps<{
  title?: string
  showBack?: boolean
}>()
</script>

<template>
  <ion-header class="ion-no-border">
    <ion-toolbar>
      <ion-buttons slot="start">
        <ion-back-button :icon="chevronBackOutline" v-if="showBack" class="text-gray-500" @click="router.back()"></ion-back-button>
        <slot name="start" v-else></slot>
      </ion-buttons> 
      <ion-title class="header">
        <span v-if="title">{{ title }}</span>
        <slot v-else />
      </ion-title>
      <ion-buttons slot="end">
        <slot name="end"></slot>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>
</template>