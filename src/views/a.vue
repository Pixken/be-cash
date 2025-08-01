<template>
  <ion-page>
    <be-header :show-back="true" />
    <ion-content>
      <div class="bg-white m-3 rounded-md px-6">
        <div class="py-12 border-b">
          <div class="flex flex-col items-center gap-6 mb-9">
            <div class="flex items-center gap-2">
              <div class="bg-blue-500 w-fit p-[2px] rounded-full"><img src="@/assets/money.svg" alt="" class="w-5 h-5"></img></div>
              <span class="text-sm">{{  data?.category || '其他'  }}</span>
            </div>
            <div class="text-4xl font-semibold">{{ (data?.type === 'income' ? '+' : '-') + data?.amount }}</div>
          </div>
          <div class="flex flex-col gap-2">
            <div class="flex">
              <span class="text-gray-400 text-sm inline-block w-20">记录时间</span>
              <span class="text-sm flex-1">{{ new Date(data?.time as string).toLocaleString().replace('/', '年').replace('/', '月').replace(' ', '日 ') }}</span>
            </div>
            <div class="flex">
              <span class="text-gray-400 text-sm inline-block w-20">应用来源</span>
              <span class="text-sm flex-1">{{ data?.appName || '未知' }}</span>
            </div>
            <div class="flex">
              <span class="text-gray-400 text-sm inline-block w-20">备注</span>
              <span class="text-sm flex-1">{{ data?.description }}</span>
            </div>
          </div>
        </div>
        <div class="flex justify-between items-center">
          <button class="text-red-500 text-sm flex-1 h-14 flex justify-center items-center gap-2" @click="handleDelete">
            <svg-icon :icon="'material-symbols:delete-outline'" color="#ef4444" size="20" class="mt-[1px]"></svg-icon>
            <span>删除</span>
          </button>
          <div class="h-4 w-[1px] bg-gray-200"></div>
          <button class="text-red-500 text-sm flex-1 h-14 flex justify-center items-center gap-2" @click="handleDeleteNoEffect">
            <svg-icon :icon="'material-symbols:delete-outline'" color="#ef4444" size="20" class="mt-[1px]"></svg-icon>
            <span>移除</span>
          </button>
          <div class="h-4 w-[1px] bg-gray-200"></div>
          <button class="text-sm flex-1 h-14 flex justify-center items-center gap-2">
            <svg-icon :icon="'ri:edit-line'" color="#000000" size="20" class="mt-[1px]"></svg-icon>
            <span>编辑</span>
          </button>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonPage, alertController } from '@ionic/vue';
import { useRoute, useRouter } from 'vue-router'
import { AccountbookItem } from '@/types/bill'
import { deleteBill, deleteNoEffectBill } from '@/api/bill';
import emitter from '@/utils/emitter';

const route = useRoute()
const router = useRouter()

const data = ref<AccountbookItem>()

data.value = {
  id: route.query.id as unknown as number,
  description: route.query.description as unknown as string,
  amount: route.query.amount as unknown as number,
  type: route.query.type as unknown as 'income' | 'expense',
  time: route.query.time as unknown as string,
  appName: route.query.appName as unknown as string,
  category: route.query.category as unknown as string
}

const handleDelete = async () => {
  const alert = await alertController.create({
    subHeader: '确认是否删除该账单（影响余额）？',
    buttons: [{
      text: '取消',
      role: 'cancel',
      cssClass: 'alert-button-cancel'
    },  {
      text: '删除',
      role: 'destructive',
      cssClass: 'alert-button-confirm',
      handler: async () => {
        const res = await deleteBill(data.value?.id as number)
        console.log(res);
        if (res.code === 200) {
          router.back()
          emitter.emit('message', { msg: '删除成功', type: 'success' })
        }
      }
    }],
  })
  await alert.present()
}

const handleDeleteNoEffect = async () => {
  const alert = await alertController.create({
    subHeader: '确认是否移除该账单（不影响余额）？',
    buttons: [{
      text: '取消',
      role: 'cancel',
      cssClass: 'alert-button-cancel'
    },  {
      text: '移除',
      role: 'destructive',
      cssClass: 'alert-button-confirm',
      handler: async () => {
        const res = await deleteNoEffectBill(data.value?.id as number)
        console.log(res);
        if (res.code === 200) {
          router.back()
          emitter.emit('message', { msg: '移除成功', type: 'success' })
        }
      }
    }],
  })
  await alert.present()
}
</script>

<style>
button.alert-button.alert-button-confirm {
  color: #ef4444;
}
button.alert-button.alert-button-cancel {
  color: #666666;
}
</style>