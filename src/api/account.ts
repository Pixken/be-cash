import { post, get } from "@/utils/request"

export const createAccount = async (data: any) => {
  return post('/account', data)
}

export const addAccount = async (id: string, key: string) => {
  return post(`/account/${id}`, { key })
}

export const getAccount = async (userId: string) => {
  return get(`/account/${userId}`)
}