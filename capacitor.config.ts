import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: '鸟蛋记账',
  webDir: 'dist',
  // 添加服务器配置
  server: {
    // 允许从应用程序外部加载内容
    allowNavigation: ['http://117.72.49.27/*', 'https://*.*'],
    // 清除历史记录
    cleartext: true
  },
  // 添加Android特定配置
  android: {
    allowMixedContent: true, // 允许HTTP和HTTPS混合内容
    captureInput: true, // 改善输入体验
    // 网络安全配置
    webContentsDebuggingEnabled: true // 允许调试WebView
  }
};

export default config;
