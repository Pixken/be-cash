import axios from 'axios'
import type { AxiosInstance, AxiosResponse, AxiosRequestConfig } from 'axios'
import useUserStore from '@/store/user'
import userApi from '@/api/user'
import { storage } from '@/utils/storage'
const userStore = useUserStore()

export interface ApiResponse<T> {
  message: string
  code: number
  data: T
}

// 自定义重试逻辑
const MAX_RETRIES = 3;

const request: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  timeout: 15000, // 增加超时时间到15秒
  headers: {
    'Content-Type': 'application/json',
  },
  // 确保发送凭证（cookies等）
  withCredentials: false
})

// 添加请求拦截器，用于调试
request.interceptors.request.use((config) => {
  // 记录每个请求，辅助调试
  console.log(`🚀 请求: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, config);
  
  config.headers['Authorization'] = `Bearer ${userStore.access_token}`
  
  // 添加API版本和时间戳防止缓存
  if (config.method === 'get') {
    config.params = {
      ...config.params, 
      _t: Date.now(),
      _v: import.meta.env.VITE_API_VERSION || '1.0.0'
    };
  }
  
  return config
})

// 自定义重试机制
const retryRequest = async (config: AxiosRequestConfig, retries = 0): Promise<any> => {
  try {
    const res = await request(config);
    return res;
  } catch (err: any) {
    if (retries >= MAX_RETRIES) {
      throw err;
    }
    
    console.log(`重试请求 (${retries+1}/${MAX_RETRIES}): ${config.url}`);
    
    // 等待时间递增
    const delay = Math.pow(2, retries) * 1000;
    await new Promise(resolve => setTimeout(resolve, delay));
    
    return retryRequest(config, retries + 1);
  }
};

request.interceptors.response.use((response: AxiosResponse) => {
  console.log(`✅ 响应: ${response.config.url}`, response.data);
  return response
}, async (error: any) => {
  if (!error.response) {
    // 网络错误
    const errorMessage = `网络错误: ${error.message}。API地址: ${import.meta.env.VITE_BASE_URL}`;
    console.error(`❌ ${errorMessage}`, error);
    return Promise.reject(errorMessage);
  }
  
  console.error(`❌ 请求错误 (${error.response.status}): ${error.config.url}`, error.response.data);
  
  if (error.response.status === 401) {
    try {
      const refresh_token = storage.getItem('refresh_token')
      if (!refresh_token) {
        window.location.href = '/login?redirect=' + window.location.pathname
        return
      }
      const res = await userApi.refreshToken()
      if (res.code === 200) {
        userStore.setToken(res.data.access_token, res.data.refresh_token)
        return request(error.config)
      }
    } catch (error) {
      window.location.href = '/login?redirect=' + window.location.pathname
    }
  }
  return Promise.reject(error)
})

export const get = async (url: string, params?: any) => {
  try {
    const res = await request.get(url, { params });
    return res.data as ApiResponse<any>;
  } catch (error) {
    console.error(`GET请求失败: ${url}`, error);
    throw error;
  }
}

export const post = async (url: string, data: any) => {
  try {
    const res = await request.post(url, data);
    return res.data as ApiResponse<any>;
  } catch (error) {
    console.error(`POST请求失败: ${url}`, error);
    throw error;
  }
}

export const patch = async (url: string, data: any) => {
  try {
    const res = await request.patch(url, data);
    return res.data as ApiResponse<any>;
  } catch (error) {
    console.error(`PATCH请求失败: ${url}`, error);
    throw error;
  }
}

export const del = async (url: string, params: any) => {
  try {
    const res = await request.delete(url, { params });
    return res.data as ApiResponse<any>;
  } catch (error) {
    console.error(`DELETE请求失败: ${url}`, error);
    throw error;
  }
}

export default request