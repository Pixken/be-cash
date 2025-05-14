<script setup lang="ts">
import useUserStore from '@/store/user';
import { IonPage, IonContent, onIonViewDidEnter } from '@ionic/vue';
import { format } from 'timeago.js';
import { readNotification, dismissNotification, getNotifications } from '@/api/notifications';
import emitter from '@/utils/emitter';

const content = ref(null);
const userStore = useUserStore();
const loading = ref(false);

// 标记为已读
const markAsRead = async (alertId: string) => {
  try {
    await readNotification(alertId);
    // 更新本地通知列表状态
    const index = userStore.alerts.findIndex(alert => alert.id === alertId);
    if (index !== -1) {
      userStore.alerts[index].read = true;
    }
    emitter.emit("message", { msg: '标记为已读', type: 'success' });
    refreshNotifications();
  } catch (error) {
    emitter.emit("message", { msg: '操作失败', type: 'error' });
  }
};

// 忽略通知
const dismissAlert = async (alertId: string) => {
  try {
    await dismissNotification(alertId);
    // 从列表中移除已忽略的通知
    userStore.alerts = userStore.alerts.filter(alert => alert.id !== alertId);
    emitter.emit("message", { msg: '已忽略通知', type: 'success' });
    refreshNotifications();
  } catch (error) {
    emitter.emit("message", { msg: '操作失败', type: 'error' });
  }
};

// 刷新通知列表
const refreshNotifications = async () => {
  loading.value = true;
  try {
    const res = await getNotifications();
    userStore.alerts = res.data.data;
  } catch (error) {
    emitter.emit("message", { msg: '获取通知失败', type: 'error' });
  } finally {
    loading.value = false;
  }
};

onIonViewDidEnter(() => {
  content.value?.$el.scrollToTop(0);
  refreshNotifications();
});
</script>

<template>
  <ion-page>
    <be-header title="消息通知" show-back />
    <ion-content ref="content" :class="{ 'ion-padding': false }">
      <div class="p-4">
        <!-- 消息列表 -->
        <div v-if="loading" class="flex justify-center py-4">
          <span class="loading loading-spinner loading-md"></span>
        </div>
        
        <div v-else>
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-semibold">系统通知</h2>
            <button @click="refreshNotifications" class="text-blue-500 text-sm">
              刷新
            </button>
          </div>
          
          <ul v-if="userStore.alerts.length > 0">
            <template 
            v-for="alert in userStore.alerts" :key="alert.id">

            <li 
              class="flex flex-col py-4 px-3 not-last-border-b relative rounded-lg mb-3"
              :class="{'bg-gray-50': alert.status === 'UNREAD', 'bg-white': alert.status === 'READ'}"
              v-if="alert.status !== 'DISMISSED'"
            >
              <div class="flex items-start gap-2" >
                <span class="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center shrink-0">
                  <svg-icon icon="bx:bxs-error" color="#fff" />
                </span>
                <div class="flex flex-col gap-1 flex-1">
                  <div class="flex justify-between items-center">
                    <span class="font-bold">预算提醒</span>
                    <span class="text-gray-500 text-xs">{{format(alert.createdAt, 'zh_CN')}}</span>
                  </div>
                  <span class="text-gray-600">{{alert.message}}</span>
                  
                  <!-- 操作按钮 -->
                  <div class="flex justify-end gap-3 mt-2">
                    <button 
                      v-if="alert.status === 'UNREAD'" 
                      @click="markAsRead(alert.id)" 
                      class="text-blue-500 text-sm px-2 py-1 border border-blue-500 rounded-md"
                    >
                      标为已读
                    </button>
                    <button 
                      @click="dismissAlert(alert.id)" 
                      class="text-gray-500 text-sm px-2 py-1 border border-gray-300 rounded-md"
                    >
                      忽略
                    </button>
                  </div>
                </div>
              </div>
            </li>
            </template>
          </ul>
          
          <div v-else class="text-center text-gray-500 bg-gray-50 py-12 rounded-lg">
            <svg-icon icon="mdi:bell-off-outline" class="w-12 h-12 mx-auto text-gray-400" />
            <p class="mt-3">暂无消息</p>
          </div>
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