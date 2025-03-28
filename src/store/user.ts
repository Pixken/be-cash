import { defineStore } from 'pinia'

const useUserStore = defineStore('user', () => {
  const access_token = ref(localStorage.getItem('access_token') || '')
  const refresh_token = ref(localStorage.getItem('refresh_token') || '')
  const user = ref(JSON.parse(localStorage.getItem('user') || '{}'))

  const setToken = (access_token: string, refresh_token: string) => { 
    localStorage.setItem('access_token', access_token)
    localStorage.setItem('refresh_token', refresh_token)
  }

  const setUser = (user: any) => {
    console.log(121212);
    localStorage.setItem('user', JSON.stringify(user))
  }

  return {
    access_token,
    refresh_token,
    setToken,
    user,
    setUser,
  }
})
export default useUserStore