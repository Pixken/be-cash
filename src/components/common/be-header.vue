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
  <ion-header class="ion-no-border relative border-b border-gray-200 h-12 flex items-center">
    <div>
      <ion-back-button :icon="chevronBackOutline" v-if="showBack" class="text-gray-500"
        @click="router.back()"></ion-back-button>
      <slot name="start" v-else></slot>
    </div>

    <div class="absolute left-[50%] translate-x-[-50%] top-[50%] translate-y-[-50%] font-semibold text-lg">
      <span v-if="title">{{ title }}</span>
      <slot v-else />
    </div>

    <div>
      <slot name="end"></slot>
      <ion-icon :icon="closeOutline" v-if="close" class="text-gray-500 absolute top-1/2 -translate-y-1/2 right-4"
        @click="close" />
    </div>
  </ion-header>
</template>