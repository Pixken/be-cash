import { post, get, put, del } from "@/utils/request"

export const getBill = async () => {
  return get('/bill')
}

export const deleteBill = async (id: number) => {
  return del(`/bill/${id}`)
}

export const deleteNoEffectBill = async (id: number) => {
  return del(`/bill/${id}/no-effect`)
}