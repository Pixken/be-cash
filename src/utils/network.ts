import axios from 'axios';

/**
 * 检查API服务器连接状态
 * @param apiUrl 要检查的API地址
 * @returns 包含连接状态和响应时间的Promise
 */
export const checkApiConnection = async (apiUrl: string): Promise<{
  isConnected: boolean;
  responseTime?: number;
  error?: string;
  details?: string;
}> => {
  const startTime = Date.now();
  try {
    // 创建一个独立的axios实例，专门用于测试连接
    const testInstance = axios.create({
      timeout: 10000,
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    // 首先尝试OPTIONS请求（比HEAD更可靠，很多后端会专门处理）
    try {
      await testInstance.options(apiUrl);
      const endTime = Date.now();
      return {
        isConnected: true,
        responseTime: endTime - startTime,
        details: 'OPTIONS成功'
      };
    } catch (optionsError) {
      // 如果OPTIONS失败，尝试GET请求
      try {
        await testInstance.get(`${apiUrl}/health-check`, { 
          params: { _t: Date.now() } // 防止缓存
        });
        const endTime = Date.now();
        return {
          isConnected: true,
          responseTime: endTime - startTime,
          details: 'GET成功'
        };
      } catch (getError: any) {
        // 如果都失败了，再尝试使用fetch API直接访问
        try {
          const fetchStartTime = Date.now();
          const response = await fetch(apiUrl, { 
            method: 'GET',
            cache: 'no-cache',
            headers: { 'pragma': 'no-cache' }
          });
          
          const fetchEndTime = Date.now();
          const status = response.status;
          
          // 任何响应都说明服务器在运行，即使是错误响应
          return {
            isConnected: true,
            responseTime: fetchEndTime - fetchStartTime,
            details: `获得HTTP响应 (状态码: ${status})`
          };
        } catch (fetchError: any) {
          throw fetchError;
        }
      }
    }
  } catch (error: any) {
    console.error('API连接测试失败:', error);
    return {
      isConnected: false,
      error: error.message || '未知错误',
      details: error.code || error.name || '无详细信息'
    };
  }
};

/**
 * 检测网络类型
 * @returns 返回当前网络类型
 */
export const getNetworkType = (): string => {
  // @ts-ignore
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  
  if (!connection) {
    return '无法检测';
  }
  
  return connection.effectiveType || connection.type || '未知';
};

/**
 * 检测设备类型
 * @returns 设备类型信息
 */
export const getDeviceInfo = () => {
  const userAgent = navigator.userAgent;
  
  const isAndroid = /Android/i.test(userAgent);
  const isIOS = /iPhone|iPad|iPod/i.test(userAgent);
  const isWebView = /(WebView|wv)/i.test(userAgent);
  
  let deviceType = 'Web浏览器';
  if (isAndroid) deviceType = 'Android';
  if (isIOS) deviceType = 'iOS';
  if (isWebView) deviceType += ' (WebView)';
  
  return {
    deviceType,
    userAgent
  };
}; 