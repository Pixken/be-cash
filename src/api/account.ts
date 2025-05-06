import { post, get, put, del } from "@/utils/request"

export const createAccount = async (data: any) => {
  return post('/finance/accounts/create', data)
}

export const addAccount = async (id: string, key: string) => {
  return post(`/account/${id}`, { key })
}

export const getAccount = async () => {
  return get(`/finance/accounts`)
}

export const updateAccount = async (data: any) => {
  const { id, ...account } = data
  return put(`/finance/accounts/${id}`, account)
}

export const delAccount = async (id: string) => {
  return del(`/finance/accounts/${id}`)
}