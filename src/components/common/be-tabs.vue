<script setup lang='ts'>
import { useRoute, useRouter } from 'vue-router';
import { IonModal, IonButton } from '@ionic/vue'

defineProps<{
  toAdd: () => void
}>()

const router = useRouter()
const route = useRoute()

const activeTab = ref(route.path)

const handleClick = (path: string) => {
  activeTab.value = path
  router.push(path)
}
</script>

<template>
  <div class="be-tabs">
    <div class="tab" @click="handleClick('/tabs/wallet')">
      <svg-icon icon="mdi:wallet-bifold" :color="activeTab === '/tabs/wallet' ? '#ffcb3d' : ''" />
    </div>
    <div class="tab" @click="handleClick('/tabs/calendar')">
      <svg-icon icon="mdi:calendar-month" :color="activeTab === '/tabs/calendar' ? '#ffcb3d' : ''" />
    </div>
    <div class="tab" @click="handleClick('/tabs/add-page')">
      <svg-icon icon="mdi:plus-circle" :color="activeTab === '/tabs/add-page' ? '#ffcb3d' : ''" size="2em" />
    </div>
    <div class="tab" @click="handleClick('/tabs/shop')">
      <svg-icon icon="mdi:shopping" :color="activeTab === '/tabs/shop' ? '#ffcb3d' : ''" />
    </div>
    <div class="tab" @click="handleClick('/tabs/user')">
      <svg-icon icon="mdi:account" :color="activeTab === '/tabs/user' ? '#ffcb3d' : ''" />
    </div>
  </div>
  <ion-modal trigger="open-modal">
    <add-cash />
  </ion-modal>
</template>

<style scoped lang="scss">
.be-tabs {
  margin: 1em;
  width: calc(100vw - 2em);
  height: 3em;
  display: flex;
  justify-content: space-around;
  align-items: center;
  background-color: #fff;
  border-radius: 6px;
  position: fixed;
  bottom: 0;
  left: 0;
  z-index: 999;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
}
</style>