import { get, post } from "@/utils/request"
import storage from "@/utils/storage"

const userApi = {
  login: (data: any) => {
    return post('/auth/login', data)
  },
  register: (data: any) => {
    return post('/auth/register', data)
  },
  refreshToken: () => {
    return post('/auth/refresh', {
      refreshToken: storage.local.get('refresh_token')
    })
  },
  userInfo: () => {
    return get('/auth/profile')
  }
}

export default userApi