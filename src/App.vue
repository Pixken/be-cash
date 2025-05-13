<template>
  <ion-app>
    <ion-toast
      position="top"
      position-anchor="header"
      class="custom-toast"
      :is-open="isOpen"
      :message="message"
      :duration="1000"
      @didDismiss="isOpen = false"
    ></ion-toast>
    <ion-router-outlet></ion-router-outlet>
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet, IonToast } from '@ionic/vue';
import { ref, watch, onMounted, onUnmounted } from 'vue';
import emitter from './utils/emitter';
import { Keyboard } from '@capacitor/keyboard';

import { checkNativeUpdate } from '@/services/update/nativeUpdate';

// 在应用启动时检查更新
checkNativeUpdate((progress) => {
  console.log(`下载进度: ${progress}%`);
});

// 添加键盘处理
onMounted(() => {
  // 监听键盘弹出事件
  Keyboard.addListener('keyboardWillShow', info => {
    // 键盘将要显示
    console.log('键盘高度:', info.keyboardHeight);
    
    // 添加CSS类，通知应用程序键盘已弹出
    document.body.classList.add('keyboard-is-open');
    
    // 滚动到激活的输入框
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement && (activeElement.tagName === 'ION-INPUT' || activeElement.tagName === 'ION-TEXTAREA' || activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
      setTimeout(() => {
        activeElement.scrollIntoView({
          block: 'center',
          behavior: 'smooth'
        });
      }, 100);
    }
  });

  // 监听键盘隐藏事件
  Keyboard.addListener('keyboardWillHide', () => {
    // 移除CSS类
    document.body.classList.remove('keyboard-is-open');
  });
});

// 清理监听器
onUnmounted(() => {
  Keyboard.removeAllListeners();
});

const isOpen = ref(false);
const message = ref('');
const type = ref<'success' | 'error' | ''>('');

// 监听消息事件
emitter.on('message', (msg) => {
  message.value = formatMessage(msg.msg, msg.type);
  type.value = msg.type;
  isOpen.value = true;
});

// 为不同类型的消息添加前缀图标
const formatMessage = (msg: string, messageType: 'success' | 'error'): string => {
  const icons = {
    success: '✓ ',
    error: '✗ '
  };
  return icons[messageType] + msg;
};

// 为不同类型的消息设置不同颜色
const colors: Record<string, string> = {
  success: '#10b981',
  error: '#ef4444'
};

// 监听类型变化，应用相应样式
watch(type, (newVal) => {
  if (newVal && colors[newVal]) {
    const toastElement = document.querySelector('ion-toast.custom-toast') as HTMLElement;
    if (toastElement && toastElement.style) {
      toastElement.style.setProperty('--background', colors[newVal]);
      toastElement.style.setProperty('--color', '#fff');
    }
  }
});
</script>

<style>
/* 自定义Toast样式 */
ion-toast.custom-toast {
  --background: #f4f4fa;
  --border-radius: 12px;
  --box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  --color: #4b4a50;
  --padding-top: 12px;
  --padding-bottom: 12px;
  --padding-start: 16px;
  --padding-end: 16px;
  font-weight: 500;
  font-size: 14px;
  letter-spacing: 0.3px;
  margin-top: 16px;
}

/* 确保页面内容可以滚动，适应键盘弹出 */
ion-content {
  --keyboard-offset: 0 !important;
}

/* 输入框获取焦点时的样式，确保可见性 */
ion-input:focus, ion-textarea:focus {
  position: relative;
  z-index: 2;
}

/* 修复 Android 键盘遮挡问题 */
html, body {
  height: 100%;
  overflow: hidden;
}

/* 确保在键盘弹出时内容可以滚动 */
ion-app {
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* 允许内容区域自适应调整大小 */
ion-content {
  flex: 1;
  overflow: auto;
}

/* 键盘打开时应用的样式 */
body.keyboard-is-open {
  padding-bottom: env(keyboard-inset-height, 0);
}

/* 键盘打开时确保输入框可见 */
body.keyboard-is-open ion-content {
  --padding-bottom: 8rem;
}

/* 确保输入框周围有足够的视觉空间 */
ion-input, ion-textarea, input, textarea {
  margin-bottom: 8px;
  padding: 4px;
}

/* 修复光标位置 */
ion-input, ion-textarea {
  --padding-start: 4px;
  --padding-end: 4px;
}
</style>