import { get, post } from "@/utils/request"
import useUserStore from "@/store/user"

const userStore = useUserStore()

export const login = (data: any) => {
  return post('/identity/login', data)
}
export const register = (data: any) => {
  return post('/identity/register', data)
}
export const refreshToken = () => {
  return post('/identity/refresh', {
    refreshToken: userStore.refresh_token
  })
}
export const userInfo = () => {
  return get('/identity/profile')
}
export const getCaptcha = () => {
  return get('/identity/captcha')
}