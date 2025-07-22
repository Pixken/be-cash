import { registerPlugin } from '@capacitor/core';

export interface NotificationListenerPlugin {
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

const NotificationListener = registerPlugin<NotificationListenerPlugin>('NotificationListener');

export default NotificationListener;