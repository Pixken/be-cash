# Android 后台通知监听功能

这个功能实现了在 Android 设备上后台监听所有应用通知的能力，即使应用在后台或完全关闭时也能持续工作。

## 功能特性

### 🔄 后台持续运行
- 使用前台服务确保在后台持续运行
- 系统不会轻易杀死服务进程
- 应用关闭后仍能监听通知

### 💾 数据持久化
- 自动保存所有监听到的通知到本地存储
- 支持离线查看历史通知
- 限制存储数量（最新1000条）

### 🔔 实时通知
- 应用运行时实时接收新通知
- 支持事件监听器
- 自动过滤系统通知

### 🛡️ 权限管理
- 自动检查通知访问权限
- 引导用户授权
- 权限状态实时监控

## 使用方法

### 1. 基础设置

```typescript
import NotificationListener from '@/plugins/notification-listener';

// 检查权限
const { hasPermission } = await NotificationListener.checkPermission();

// 请求权限（打开设置页面）
if (!hasPermission) {
  await NotificationListener.requestPermission();
}

// 启动服务
await NotificationListener.start();
```

### 2. 监听实时通知

```typescript
// 添加监听器
const listener = await NotificationListener.addListener('onNotificationPosted', (notification) => {
  console.log('新通知:', notification);
  console.log('应用名:', notification.appName);
  console.log('标题:', notification.title);
  console.log('内容:', notification.text);
});

// 移除监听器
listener.remove();
```

### 3. 获取历史通知

```typescript
// 获取存储的通知
const { notifications, count } = await NotificationListener.getStoredNotifications();
console.log(`共有 ${count} 条历史通知`);

// 清除历史通知
await NotificationListener.clearStoredNotifications();
```

### 4. 服务管理

```typescript
// 获取服务状态
const status = await NotificationListener.getServiceStatus();
console.log('服务启用:', status.isEnabled);
console.log('权限状态:', status.hasPermission);

// 停止服务
await NotificationListener.stop();
```

## 通知数据结构

```typescript
interface NotificationData {
  packageName: string;    // 应用包名
  appName: string;        // 应用名称
  title: string;          // 通知标题
  text: string;           // 通知内容
  subText?: string;       // 子文本
  bigText?: string;       // 长文本
  postTime: number;       // 发布时间戳
  timestamp: string;      // 格式化时间
}
```

## 权限要求

应用需要以下权限：

1. **通知访问权限** - 用户需要在系统设置中手动授权
2. **前台服务权限** - 自动获取
3. **通知权限** - 用于显示前台服务通知

## 注意事项

### 🔒 权限授权
- 通知访问权限需要用户在系统设置中手动开启
- 首次使用时会自动引导用户到设置页面
- 权限变更后需要重启服务

### 📱 系统兼容性
- 支持 Android 6.0 及以上版本
- 不同厂商的系统可能有不同的权限管理策略
- 某些厂商可能需要额外的自启动权限

### 🔋 电池优化
- 建议将应用加入电池优化白名单
- 避免系统休眠时杀死服务
- 部分厂商需要手动设置

### 🛡️ 隐私安全
- 只监听通知元数据，不获取敏感内容
- 数据仅存储在本地设备
- 用户可随时清除历史数据

## 故障排除

### 服务无法启动
1. 检查通知访问权限是否已授权
2. 确认应用未被系统限制后台运行
3. 重启应用或重新授权

### 监听不到通知
1. 确认目标应用有发送通知
2. 检查系统通知设置
3. 验证服务是否正在运行

### 应用被杀死
1. 将应用加入自启动白名单
2. 关闭电池优化
3. 检查厂商特定的后台管理设置

## 开发调试

查看日志：
```bash
adb logcat | grep "NotificationListener"
```

检查服务状态：
```bash
adb shell dumpsys notification
```

## 更新日志

- v1.0.0: 基础通知监听功能
- v1.1.0: 添加前台服务支持
- v1.2.0: 数据持久化和历史记录
- v1.3.0: 完善权限管理和错误处理