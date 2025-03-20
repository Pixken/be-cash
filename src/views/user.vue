<script setup lang="ts">
import { IonPage } from '@ionic/vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const logout = () => {
  router.push('/login');
};
</script>
<template>
  <ion-page>
    <h1>我的页面</h1>
    <button @click="logout" class="bg-red-500 text-white p-2 rounded-md">退出登录</button>
  </ion-page>
</template>