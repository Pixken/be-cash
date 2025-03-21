<script setup lang="ts">
import { IonPage, IonContent } from '@ionic/vue';
</script>

<template>
  <ion-page>
    <be-header title="通知" show-back />
    <ion-content>
      <div class="p-4">
        <div>
          <p>今天</p>
          <ul>
            <li class="flex items-center justify-between py-4 px-2 not-last-border-b">
              <div class="flex items-start gap-2">
                <span class="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center">
                  <svg-icon icon="bx:bxs-error" color="#fff" />
                </span>
                <div class="flex flex-col gap-1 flex-1">
                  <span class="font-bold">预算提醒</span>
                  <span class="text-gray-500">您的餐饮预算已使用93%，请注意控制支出。</span>
                </div>
              </div>
              <span class="text-gray-500">12:30</span>
            </li>
            <li class="flex items-center justify-between py-4 px-2 not-last-border-b">
              <div class="flex items-start gap-2">
                <span class="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
                  <svg-icon icon="mingcute:bill-fill" color="#fff" />
                </span>
                <div class="flex flex-col gap-1 flex-1">
                  <span class="font-bold">账单提醒</span>
                  <span class="text-gray-500">您的招商银行信用卡将于3天后到期，请及时还款。</span>
                </div>
              </div>
              <span class="text-gray-500">12:30</span>
            </li>
          </ul>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<style scoped> 
.not-last-border-b:not(:last-child) {
  border-bottom: 1px solid #E5E7EB;
}
</style>