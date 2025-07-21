<template>
  <ion-page>
    <be-header title="Test Notification Listener" show-back />
    <ion-content :class="{ 'ion-padding': false }">
      <div>
        <h1>Test Notification Listener</h1>
        <p v-if="nativeData">{{ nativeData }}</p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { useNativeData } from '@/composables/useNativeData';

const { nativeData } = useNativeData();
</script>