import { defineStore } from 'pinia'
import storage from '@/utils/storage'

const useUserStore = defineStore('user', () => {
  const access_token = ref('')
  const refresh_token = ref('')

  const setToken = (access_token: string, refresh_token: string) => { 
    storage.local.set('access_token', access_token)
    storage.local.set('refresh_token', refresh_token)
  }

  const getToken = () => {
    access_token.value = storage.local.get('access_token') as string
    refresh_token.value = storage.local.get('refresh_token') as string
  }

  return {
    access_token,
    refresh_token,
    setToken,
    getToken,
  }
})
export default useUserStore