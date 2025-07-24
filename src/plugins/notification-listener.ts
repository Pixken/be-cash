import { registerPlugin } from '@capacitor/core';

export interface NotificationListenerPlugin {
  /**
   * 设置用户认证信息
   */
  setAuthInfo(options: { userId: string; token: string }): Promise<{ success: boolean; message: string }>;

  /**
   * 启动通知监听服务
   */
  start(): Promise<{ success: boolean; message: string; needPermission?: boolean }>;

  /**
   * 停止通知监听服务
   */
  stop(): Promise<{ success: boolean; message: string }>;

  /**
   * 检查通知访问权限
   */
  checkPermission(): Promise<{ hasPermission: boolean }>;

  /**
   * 请求通知访问权限（打开设置页面）
   */
  requestPermission(): Promise<{ success: boolean; message: string }>;

  /**
   * 获取存储的通知数据
   */
  getStoredNotifications(): Promise<{ notifications: NotificationData[]; count: number }>;

  /**
   * 清除存储的通知数据
   */
  clearStoredNotifications(): Promise<{ success: boolean; message: string }>;

  /**
   * 获取服务状态
   */
  getServiceStatus(): Promise<{ isEnabled: boolean; hasPermission: boolean }>;

  /**
   * 测试服务器连接
   */
  testConnection(): Promise<{ success: boolean; message: string }>;

  /**
   * 获取发送失败的请求
   */
  getFailedRequests(): Promise<{ failedRequests: FailedRequest[]; count: number }>;

  /**
   * 清除失败的请求
   */
  clearFailedRequests(): Promise<{ success: boolean; message: string }>;

  /**
   * 重试失败的请求
   */
  retryFailedRequests(): Promise<{ success: boolean; message: string }>;

  /**
   * 添加监听器，监听新通知
   */
  addListener(
    eventName: 'onNotificationPosted',
    listenerFunc: (notification: NotificationData) => void,
  ): Promise<any>;

  /**
   * 移除所有监听器
   */
  removeAllListeners(): Promise<void>;
}

export interface NotificationData {
  packageName: string;
  appName: string;
  title: string;
  text: string;
  subText?: string;
  bigText?: string;
  postTime: number;
  timestamp: string;
}

export interface FailedRequest {
  data: NotificationData;
  timestamp: number;
  retryCount: number;
}

const NotificationListener = registerPlugin<NotificationListenerPlugin>('NotificationListener');

export default NotificationListener;