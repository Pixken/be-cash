<template>
  <ion-modal :is-open="isOpen" @didDismiss="closeDialog">
    <ion-header>
      <ion-toolbar>
        <ion-title>AI 助手</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="closeDialog">
            <ion-icon :icon="closeOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="chat-container">
        <div class="message-list" ref="messageList">
          <div v-for="(message, index) in messages" :key="index" 
               :class="['message', message.type === 'user' ? 'user-message' : 'ai-message']">
            <Bubble
              :content="message.content"
              :avatar="{ icon: h(UserOutlined) }"
              header="小蛋"
            >
            </Bubble>
          </div>
        </div>
        
        <div class="input-container">
          <ion-input
            v-model="userInput"
            placeholder="输入您的问题..."
            @keyup.enter="sendMessage"
          ></ion-input>
          <ion-button @click="sendMessage" :disabled="!userInput.trim()">
            <ion-icon :icon="sendOutline"></ion-icon>
          </ion-button>
        </div>
      </div>
    </ion-content>
  </ion-modal>
</template>

<script setup>
import { ref, onMounted, nextTick, h } from 'vue';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonInput, IonIcon } from '@ionic/vue';
import { closeOutline, sendOutline } from 'ionicons/icons';
import { Bubble } from 'ant-design-x-vue';

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  }
});

const emit = defineEmits(['update:isOpen']);

const messages = ref([
  {
    type: 'ai',
    content: '你好！我是您的记账助手小蛋，有什么我可以帮你的吗？'
  }
]);

const userInput = ref('');
const messageList = ref(null);

const closeDialog = () => {
  emit('update:isOpen', false);
};

const sendMessage = async () => {
  if (!userInput.value.trim()) return;

  // 添加用户消息
  messages.value.push({
    type: 'user',
    content: userInput.value
  });

  // 模拟AI响应
  setTimeout(() => {
    messages.value.push({
      type: 'ai',
      content: '这是一个模拟的AI响应。在实际应用中，这里应该调用真实的AI API。'
    });
    scrollToBottom();
  }, 1000);

  userInput.value = '';
};

const scrollToBottom = async () => {
  await nextTick();
  if (messageList.value) {
    messageList.value.scrollTop = messageList.value.scrollHeight;
  }
};

onMounted(() => {
  scrollToBottom();
});
</script>

<style scoped>
.chat-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.message-list {
  flex: 1;
  overflow-y: auto;
}

.message {
  margin-bottom: 15px;
  max-width: 80%;
}

.user-message {
  margin-left: auto;
}

.ai-message {
  margin-right: auto;
}

.message-content {
  padding: 10px 15px;
  border-radius: 15px;
  display: inline-block;
}

.user-message .message-content {
  background-color: var(--ion-color-primary);
  color: white;
}

.ai-message .message-content {
  background-color: var(--ion-color-light);
  color: var(--ion-color-dark);
}

.input-container {
  display: flex;
  gap: 10px;
  padding: 10px;
  background-color: var(--ion-color-light);
  border-top: 1px solid var(--ion-color-medium);
}

ion-input {
  flex: 1;
  --padding-start: 15px;
  --padding-end: 15px;
  --border-radius: 20px;
  --background: white;
}
</style> 