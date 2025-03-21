<script setup lang="ts">
import { IonPage, IonContent, IonToggle } from '@ionic/vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const logout = () => {
  router.replace('/login');
};
</script>
<template>
  <ion-page>
    <be-header title="我的" />
    <ion-content>
      <div class="p-4">
        <div class="flex items-center p-4 border border-gray-200 rounded-2xl">
          <img src="@/assets/logo.webp" alt="" class="w-16 h-16 rounded-full">
          <div class="flex flex-col h-14 justify-between ml-4">
            <span class="text-lg font-bold">小蛋</span>
            <span class="text-gray-500">13800138000</span>
          </div>
          <span class="ml-auto">
            <svg-icon icon="material-symbols:arrow-forward-ios-rounded" />
          </span>
        </div>
        <div class="mt-4">
          <p class="text-lg font-bold text-gray-500">通用设置</p>
          <ul class="mt-4">
            <li class="flex items-center justify-between py-6 px-4 border-b border-gray-200">
              <span class="text-lg">货币单位</span>
              <div class="flex items-center gap-2">
                <span>人民币(¥)</span>
                <svg-icon icon="material-symbols:arrow-forward-ios-rounded" />
              </div>
            </li>
            <li class="flex items-center justify-between py-6 px-4 border-b border-gray-200">
              <span class="text-lg">主题</span>
              <div class="flex items-center gap-2">
                <span>跟随系统</span>
                <svg-icon icon="material-symbols:arrow-forward-ios-rounded" />
              </div>
            </li>
          </ul>
        </div>
        <div class="mt-4">
          <p class="text-lg font-bold text-gray-500">记账设置</p>
          <ul class="mt-4">
            <li class="flex items-center justify-between py-6 px-4 border-b border-gray-200">
              <span class="text-lg">默认账户</span>
              <div class="flex items-center gap-2">
                <span>支付宝</span>
                <svg-icon icon="material-symbols:arrow-forward-ios-rounded" />
              </div>
            </li>
            <li class="flex items-center justify-between py-6 px-4 border-b border-gray-200">
              <span class="text-lg">分类管理</span>
              <div class="flex items-center gap-2">
                <svg-icon icon="material-symbols:arrow-forward-ios-rounded" />
              </div>
            </li>
            <li class="flex items-center justify-between py-6 px-4 border-b border-gray-200">
              <span class="text-lg">预算提醒</span>
              <div class="flex items-center gap-2">
                <span>
                  <ion-toggle :checked="true"></ion-toggle>
                </span>
              </div>
            </li>
          </ul>
        </div>
        <div class="mt-4">
          <p class="text-lg font-bold text-gray-500">数据管理</p>
          <ul class="mt-4">
            <li class="flex items-center justify-between py-6 px-4 border-b border-gray-200">
              <span class="text-lg">数据备份</span>
              <div class="flex items-center gap-2">
                <span>上次备份：今天</span>
                <svg-icon icon="material-symbols:arrow-forward-ios-rounded" />
              </div>
            </li>
            <li class="flex items-center justify-between py-6 px-4 border-b border-gray-200">
              <span class="text-lg">数据恢复</span>
              <div class="flex items-center gap-2">
                <svg-icon icon="material-symbols:arrow-forward-ios-rounded" />
              </div>
            </li>
            <li class="flex items-center justify-between py-6 px-4 border-b border-gray-200">
              <span class="text-lg">数据导出</span>
              <div class="flex items-center gap-2">
                <svg-icon icon="material-symbols:arrow-forward-ios-rounded" />
              </div>
            </li>
          </ul>
        </div>
        <div class="mt-4">
          <p class="text-lg font-bold text-gray-500">关于与帮助</p>
          <ul class="mt-4">
            <li class="flex items-center justify-between py-6 px-4 border-b border-gray-200">
              <span class="text-lg">帮助中心</span>
              <div class="flex items-center gap-2">
                <svg-icon icon="material-symbols:arrow-forward-ios-rounded" />
              </div>
            </li>
            <li class="flex items-center justify-between py-6 px-4 border-b border-gray-200">
              <span class="text-lg">隐私政策</span>
              <div class="flex items-center gap-2">
                <svg-icon icon="material-symbols:arrow-forward-ios-rounded" />
              </div>
            </li>
            <li class="flex items-center justify-between py-6 px-4 border-b border-gray-200">
              <span class="text-lg">关于我们</span>
              <div class="flex items-center gap-2">
                <span>v1.0.0</span>
                <svg-icon icon="material-symbols:arrow-forward-ios-rounded" />
              </div>
            </li>
            <li class="flex items-center justify-between py-6 px-4">
              <button class="text-lg w-full h-12 bg-red-500 text-white rounded-xl" @click="logout">
                <span>退出登录</span>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>