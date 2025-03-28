<template>
  <ion-app>
    <context-holder />
    <ion-router-outlet></ion-router-outlet>
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import { message } from 'ant-design-vue';
import emitter from './utils/emitter';
const [messageApi, contextHolder] = message.useMessage();

emitter.on('message', message => {
  messageApi.info(message as string);
})

</script>
