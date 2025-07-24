import { get, post } from "@/utils/request"
import useUserStore from "@/store/user"
import { Password } from "@/types"

export const login = (data: any) => {
  return post('/identity/login', data)
}
export const register = (data: any) => {
  return post('/identity/register', data)
}
export const refreshToken = () => {
  const userStore = useUserStore()
  return post('/identity/refresh', {
    refreshToken: userStore.refresh_token
  })
}
export const userInfo = () => {
  return get('/identity/user/info')
}
export const getCaptcha = () => {
  return get('/identity/captcha')
}
export const updatePassword = (data: Password) => {
  return post('/identity/change-password', data)
}
export const updateProfile = (userId: string, data: any) => {
  return post(`/identity/profile/${userId}`, data)
}
export const uploadFile = (data: any, config: any) => {
  return post('/identity/avatar/upload', data, config)
}