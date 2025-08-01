<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-title>
          <div class="w-full text-center text-white font-bold">设置</div>
        </ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div class="p-2">
        <div class="w-full bg-white rounded" v-for="(setting, index) in settingsData" :key="index">
          <template v-for="item in setting">
            <div class="pr-2 pl-3 py-2 flex items-center h-12" @click="item.handler">
              <div class="flex-1 text-gray-700">{{ item.text }}</div>
              <div class="w-6">
                <svg-icon :icon="'material-symbols-light:arrow-forward-ios-rounded'" color="#374151" size="20"></svg-icon>
              </div>
            </div>
            <div class="h-[1px] bg-gray-200 mx-3" v-if="index < settingsData.length"></div>
          </template>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent, IonTitle, IonHeader, IonToolbar } from '@ionic/vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const a = () => {
  router.push('/balance')
}

const settingsData = ref([
  [{ text: '余额', handler: a }]
])
</script>

<style scoped>
ion-toolbar {
  --background: #3b82f6;
}
</style>