import { get, post } from "@/utils/request"
import useUserStore from "@/store/user"

const userStore = useUserStore()

const userApi = {
  login: (data: any) => {
    return post('/auth/login', data)
  },
  register: (data: any) => {
    return post('/auth/register', data)
  },
  refreshToken: () => {
    return post('/auth/refresh', {
      refreshToken: userStore.refresh_token
    })
  },
  userInfo: () => {
    return get('/auth/profile')
  }
}

export default userApi