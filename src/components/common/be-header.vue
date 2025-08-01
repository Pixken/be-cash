<script setup lang='ts'>
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonButton, IonIcon } from '@ionic/vue'
import { chevronBackOutline, closeOutline } from 'ionicons/icons'
import { useRouter } from 'vue-router'

const router = useRouter()

defineProps<{
  title?: string
  showBack?: boolean
  close?: () => void
}>()
</script>

<template>
  <ion-header class="ion-no-border">
    <ion-toolbar class="relative">
      <ion-buttons slot="start">
        <ion-back-button :icon="chevronBackOutline" v-if="showBack" @click="router.back()"></ion-back-button>
        <slot name="start" v-else></slot>
      </ion-buttons>
      
      <div class="absolute left-[50%] translate-x-[-50%] top-[50%] translate-y-[-50%]">
        <slot></slot>
      </div>

      <ion-buttons slot="end">
        <slot name="end"></slot>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>
</template>