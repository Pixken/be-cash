import type { CapacitorConfig } from '@capacitor/cli';
import { KeyboardResize, KeyboardStyle } from '@capacitor/keyboard';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: '鸟蛋记账',
  webDir: 'dist',
  // 添加服务器配置
  server: {
    // 允许从应用程序外部加载内容
    allowNavigation: ['http://117.72.49.27/*', 'http://116.198.241.147:8091/*', 'https://*.*'],
    // 清除历史记录
    cleartext: true
  },
  // 添加Android特定配置
  android: {
    allowMixedContent: true, // 允许HTTP和HTTPS混合内容
    captureInput: true, // 改善输入体验
    // 网络安全配置
    webContentsDebuggingEnabled: true, // 允许调试WebView
    initialFocus: false // 禁用自动获取焦点
  },
  // 添加键盘配置
  plugins: {
    Keyboard: {
      resize: KeyboardResize.Body, // 调整WebView大小
      style: KeyboardStyle.Dark, // 键盘样式
      resizeOnFullScreen: true, // 全屏时调整WebView大小
    }
  }
};

export default config;
