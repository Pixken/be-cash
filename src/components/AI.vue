<template>
  <ion-fab vertical="bottom" horizontal="end" slot="fixed">
    <ion-fab-button @click="openAIDialog">
      <svg-icon icon="hugeicons:ai-scan" color="#fff" size="30"></svg-icon>
    </ion-fab-button>
  </ion-fab>
  <AIAssistantDialog v-model:isOpen="isAIDialogOpen" />
</template>

<script setup lang="ts">
import AIAssistantDialog from './AIAssistantDialog.tsx';
import { IonFab, IonFabButton } from '@ionic/vue';
import { ref } from 'vue';


const isAIDialogOpen = ref(false);

const openAIDialog = () => {
  isAIDialogOpen.value = true;
};
</script>