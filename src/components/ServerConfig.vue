<template>
  <div class="server-config">
    <h3>服务器状态</h3>
    <p class="description">
      通知数据将自动发送到服务器 (http://117.72.49.27:3000/notification)，即使应用在后台也能正常工作。
    </p>
    
    <div class="server-info">
      <div class="info-item">
        <span class="label">服务器地址:</span>
        <span class="value">http://117.72.49.27:3000/notification</span>
      </div>
      <div class="info-item">
        <span class="label">连接状态:</span>
        <span :class="['status', connectionStatus.success ? 'status-success' : 'status-error']">
          {{ connectionStatus.message }}
        </span>
      </div>
    </div>
    
    <div class="form-actions">
      <button @click="testConnection" :disabled="testing" class="btn-primary">
        {{ testing ? '测试中...' : '测试连接' }}
      </button>
    </div>

    <div v-if="message" :class="['message', messageType]">
      {{ message }}
    </div>

    <div class="failed-requests-section" v-if="failedRequests.length > 0">
      <h4>发送失败的请求 ({{ failedRequests.length }})</h4>
      <div class="failed-list">
        <div v-for="(request, index) in failedRequests.slice(0, 10)" :key="index" class="failed-item">
          <div class="failed-header">
            <span class="app-name">{{ request.data.appName }}</span>
            <span class="timestamp">{{ formatTime(request.timestamp) }}</span>
          </div>
          <div class="failed-content">
            <div class="title">{{ request.data.title }}</div>
            <div class="retry-info">重试次数: {{ request.retryCount }}</div>
          </div>
        </div>
      </div>
      <div class="failed-actions">
        <button @click="clearFailedRequests" class="btn-clear">清除失败请求</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import NotificationListener, { type FailedRequest } from '@/plugins/notification-listener';

const testing = ref(false);
const message = ref('');
const messageType = ref<'success' | 'error'>('success');
const failedRequests = ref<FailedRequest[]>([]);
const connectionStatus = ref({
  success: false,
  message: '未测试'
});

// 测试连接
const testConnection = async () => {
  testing.value = true;
  try {
    const result = await NotificationListener.testConnection();
    connectionStatus.value = result;
    showMessage(result.message, result.success ? 'success' : 'error');
  } catch (error) {
    console.error('连接测试失败:', error);
    connectionStatus.value = {
      success: false,
      message: '测试失败'
    };
    showMessage('连接测试失败', 'error');
  } finally {
    testing.value = false;
  }
};

// 加载失败的请求
const loadFailedRequests = async () => {
  try {
    const result = await NotificationListener.getFailedRequests();
    failedRequests.value = result.failedRequests;
  } catch (error) {
    console.error('加载失败请求失败:', error);
  }
};

// 清除失败的请求
const clearFailedRequests = async () => {
  try {
    await NotificationListener.clearFailedRequests();
    failedRequests.value = [];
    showMessage('已清除失败的请求', 'success');
  } catch (error) {
    console.error('清除失败请求失败:', error);
    showMessage('清除失败请求失败', 'error');
  }
};

// 显示消息
const showMessage = (msg: string, type: 'success' | 'error') => {
  message.value = msg;
  messageType.value = type;
  setTimeout(() => {
    message.value = '';
  }, 3000);
};

// 格式化时间
const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleString();
};

onMounted(() => {
  loadFailedRequests();
  // 自动测试连接
  testConnection();
});
</script>

<style scoped>
.server-config {
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
  background: white;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.description {
  color: #666;
  margin-bottom: 20px;
  line-height: 1.5;
}

.server-info {
  margin-bottom: 20px;
  padding: 15px;
  background: #f5f5f5;
  border-radius: 4px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.label {
  font-weight: bold;
  color: #333;
}

.value {
  color: #666;
  font-family: monospace;
}

.status {
  font-weight: bold;
}

.status-success {
  color: #4caf50;
}

.status-error {
  color: #f44336;
}

.form-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.btn-primary, .btn-secondary, .btn-clear {
  padding: 10px 20px;
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

.btn-primary:disabled, .btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.message {
  padding: 10px;
  border-radius: 4px;
  margin: 10px 0;
}

.message.success {
  background: #e8f5e8;
  color: #2e7d32;
  border: 1px solid #c8e6c9;
}

.message.error {
  background: #ffebee;
  color: #c62828;
  border: 1px solid #ffcdd2;
}

.failed-requests-section {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
}

.failed-list {
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 15px;
}

.failed-item {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 10px;
  margin-bottom: 8px;
  background: #fafafa;
}

.failed-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.app-name {
  font-weight: bold;
  color: #2196f3;
}

.timestamp {
  font-size: 12px;
  color: #757575;
}

.failed-content .title {
  font-weight: bold;
  margin-bottom: 3px;
}

.retry-info {
  font-size: 12px;
  color: #757575;
}

.failed-actions {
  text-align: center;
}

h3, h4 {
  margin: 0 0 15px 0;
  color: #333;
}
</style>