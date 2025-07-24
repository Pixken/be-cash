<template>
  <div class="notification-listener">
    <div class="status-section">
      <h3>通知监听服务状态</h3>
      <div class="status-info">
        <p>服务状态: <span :class="serviceStatus.isEnabled ? 'status-active' : 'status-inactive'">
          {{ serviceStatus.isEnabled ? '已启用' : '未启用' }}
        </span></p>
        <p>权限状态: <span :class="serviceStatus.hasPermission ? 'status-active' : 'status-inactive'">
          {{ serviceStatus.hasPermission ? '已授权' : '未授权' }}
        </span></p>
      </div>
      
      <div class="action-buttons">
        <button @click="requestPermission" v-if="!serviceStatus.hasPermission" class="btn-primary">
          授权通知访问
        </button>
        <button @click="startService" v-if="!serviceStatus.isEnabled && serviceStatus.hasPermission" class="btn-primary">
          启动服务
        </button>
        <button @click="stopService" v-if="serviceStatus.isEnabled" class="btn-secondary">
          停止服务
        </button>
        <button @click="refreshStatus" class="btn-secondary">
          刷新状态
        </button>
      </div>
    </div>

    <div class="notifications-section">
      <div class="section-header">
        <h3>实时通知 ({{ liveNotifications.length }})</h3>
        <button @click="clearLiveNotifications" class="btn-clear">清除</button>
      </div>
      <div class="notifications-list">
        <div v-if="liveNotifications.length === 0" class="no-notifications">
          暂无实时通知
        </div>
        <div v-for="notification in liveNotifications" :key="notification.id" class="notification-item">
          <div class="notification-header">
            <span class="app-name">{{ notification.appName }}</span>
            <span class="timestamp">{{ formatTime(notification.timestamp) }}</span>
          </div>
          <div class="notification-content">
            <div class="title">{{ notification.title }}</div>
            <div class="text">{{ notification.text }}</div>
          </div>
        </div>
      </div>
    </div>

    <ServerConfig />

    <div class="stored-section">
      <div class="section-header">
        <h3>存储的通知 ({{ storedNotifications.length }})</h3>
        <div class="header-actions">
          <button @click="loadStoredNotifications" class="btn-secondary">刷新</button>
          <button @click="clearStoredNotifications" class="btn-clear">清除</button>
        </div>
      </div>
      <div class="notifications-list">
        <div v-if="storedNotifications.length === 0" class="no-notifications">
          暂无存储的通知
        </div>
        <div v-for="notification in storedNotifications.slice(0, 50)" :key="notification.timestamp" class="notification-item">
          <div class="notification-header">
            <span class="app-name">{{ notification.appName }}</span>
            <span class="timestamp">{{ notification.timestamp }}</span>
          </div>
          <div class="notification-content">
            <div class="title">{{ notification.title }}</div>
            <div class="text">{{ notification.text }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import NotificationListener, { type NotificationData } from '@/plugins/notification-listener';
import ServerConfig from './ServerConfig.vue';

const serviceStatus = ref({
  isEnabled: false,
  hasPermission: false
});

const liveNotifications = ref<(NotificationData & { id: number })[]>([]);
const storedNotifications = ref<NotificationData[]>([]);
let notificationIdCounter = 0;

// 刷新服务状态
const refreshStatus = async () => {
  try {
    const status = await NotificationListener.getServiceStatus();
    serviceStatus.value = status;
  } catch (error) {
    console.error('获取服务状态失败:', error);
  }
};

// 请求权限
const requestPermission = async () => {
  try {
    await NotificationListener.requestPermission();
    // 延迟刷新状态，给用户时间去设置
    setTimeout(refreshStatus, 1000);
  } catch (error) {
    console.error('请求权限失败:', error);
  }
};

// 启动服务
const startService = async () => {
  try {
    const result = await NotificationListener.start();
    if (result.needPermission) {
      await requestPermission();
    } else {
      await refreshStatus();
    }
  } catch (error) {
    console.error('启动服务失败:', error);
  }
};

// 停止服务
const stopService = async () => {
  try {
    await NotificationListener.stop();
    await refreshStatus();
  } catch (error) {
    console.error('停止服务失败:', error);
  }
};

// 加载存储的通知
const loadStoredNotifications = async () => {
  try {
    const result = await NotificationListener.getStoredNotifications();
    storedNotifications.value = result.notifications.reverse(); // 最新的在前面
  } catch (error) {
    console.error('加载存储通知失败:', error);
  }
};

// 清除存储的通知
const clearStoredNotifications = async () => {
  try {
    await NotificationListener.clearStoredNotifications();
    storedNotifications.value = [];
  } catch (error) {
    console.error('清除存储通知失败:', error);
  }
};

// 清除实时通知
const clearLiveNotifications = () => {
  liveNotifications.value = [];
};

// 格式化时间
const formatTime = (timestamp: string | number) => {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : new Date(timestamp);
  return date.toLocaleTimeString();
};

// 监听新通知
let notificationListener: any;

onMounted(async () => {
  await refreshStatus();
  await loadStoredNotifications();
  
  // 添加通知监听器
  notificationListener = await NotificationListener.addListener('onNotificationPosted', (notification: NotificationData) => {
    liveNotifications.value.unshift({
      ...notification,
      id: ++notificationIdCounter
    });
    
    // 限制实时通知数量
    if (liveNotifications.value.length > 100) {
      liveNotifications.value = liveNotifications.value.slice(0, 100);
    }
  });
});

onUnmounted(() => {
  if (notificationListener) {
    notificationListener.remove();
  }
});
</script>

<style scoped>
.notification-listener {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.status-section, .notifications-section, .stored-section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: white;
}

.status-info p {
  margin: 10px 0;
  font-size: 16px;
}

.status-active {
  color: #4caf50;
  font-weight: bold;
}

.status-inactive {
  color: #f44336;
  font-weight: bold;
}

.action-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 15px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.btn-primary, .btn-secondary, .btn-clear {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn-primary {
  background: #2196f3;
  color: white;
}

.btn-secondary {
  background: #757575;
  color: white;
}

.btn-clear {
  background: #f44336;
  color: white;
}

.btn-primary:hover, .btn-secondary:hover, .btn-clear:hover {
  opacity: 0.8;
}

.notifications-list {
  max-height: 400px;
  overflow-y: auto;
}

.no-notifications {
  text-align: center;
  color: #757575;
  padding: 20px;
}

.notification-item {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 12px;
  margin-bottom: 10px;
  background: #fafafa;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.app-name {
  font-weight: bold;
  color: #2196f3;
}

.timestamp {
  font-size: 12px;
  color: #757575;
}

.notification-content .title {
  font-weight: bold;
  margin-bottom: 4px;
}

.notification-content .text {
  color: #424242;
  font-size: 14px;
}

h3 {
  margin: 0 0 15px 0;
  color: #333;
}
</style>