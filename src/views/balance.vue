<template>
  <ion-page>
    <be-header :show-back="true">
      修改余额
      <template #end>
        <ion-button :disabled="!isChange" @click="handleSave">
          <div class="py-2 px-3 bg-blue-500 text-white rounded" :class="{ 'bg-gray-300': !isChange }">保存</div>
        </ion-button>
      </template>
    </be-header>
    <ion-content>
      <div class="p-3">
        <input type="number" inputmode="numeric" class="a bg-transparent outline-none border-b border-blue-500 w-full" @change="handleChange" @input="handleInput" :value="totalBalance">
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { userInfo, updateBalance } from '@/api/user'
import { storage } from '@/utils/storage'
import { IonPage, IonContent, IonButton, IonInput, onIonViewDidEnter } from '@ionic/vue'

const totalBalance = ref(0)
const oldBalance = ref(0)

const isChange = ref(false)

const getBalance = async () => {
  const res = await userInfo(storage.getItem('user_info')?.id)
  totalBalance.value = (res.data.balance || 0).toFixed(2)
  oldBalance.value = res.data.balance
}

const handleChange = (e: any) => {
  totalBalance.value = e.target.value
  if (totalBalance.value !== oldBalance.value) {
    isChange.value = true
  }
}

const handleInput = (e: any) => {
  handleChange(e)
}

const handleSave = async () => {
  await updateBalance(storage.getItem('user_info')?.id, { balance: Number(totalBalance.value) })
  isChange.value = false
  oldBalance.value = Number(totalBalance.value)
}

onIonViewDidEnter(async () => {
  await getBalance()
})
</script>