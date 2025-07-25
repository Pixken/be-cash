import { post, get, put, del } from "@/utils/request"

export const getBill = async () => {
  return get('/bill')
}