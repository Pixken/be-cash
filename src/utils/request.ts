import axios from 'axios'
import type { AxiosInstance, AxiosResponse } from 'axios'
import useUserStore from '@/store/user'
import storage from './storage'
import userApi from '@/api/user'

const userStore = useUserStore()

export interface ApiResponse<T> {
  message: string
  code: number
  data: T
}

const request: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  }
})

request.interceptors.request.use((config) => {
  config.headers['Authorization'] = `Bearer ${userStore.access_token}`
  return config
})

request.interceptors.response.use((response: AxiosResponse) => {
  return response
}, async (error: any) => {
  if (error.response.status === 401) {
    try {
      if (!storage.local.has('refresh_token')) {
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
  const res = await request.get(url, { params })
  return res.data as ApiResponse<any>
}

export const post = async (url: string, data: any) => {
  const res = await request.post(url, data)
  return res.data as ApiResponse<any>
}

export const patch = async (url: string, data: any) => {
  const res = await request.patch(url, data)
  return res.data as ApiResponse<any>
}

export const del = async (url: string, params: any) => {
  const res = await request.delete(url, { params })
  return res.data as ApiResponse<any>
}

export default request