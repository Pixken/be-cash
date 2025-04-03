import { defineStore } from 'pinia'
import { storage } from '@/utils/storage'

const useUserStore = defineStore('user', () => {
  const access_token = ref(storage.getItem('access_token') || '')
  const refresh_token = ref(storage.getItem('refresh_token') || '')
  const user = ref(storage.getItem('user') || null)

  const setToken = async (at: string, rt: string) => {
    access_token.value = at
    refresh_token.value = rt
    storage.setItem('access_token', at)
    storage.setItem('refresh_token', rt)
  }

  const setUser = async (u: any) => {
    user.value = u
    storage.setItem('user', u)
  }

  return {
    setToken,
    setUser,
    access_token,
    refresh_token,
    user,
  }
})
export default useUserStore