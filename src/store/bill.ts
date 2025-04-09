import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { BillDTO, BillVO } from '@/types/bill'
import { addCash, getMonthCash } from '@/api/cash'
import dayjs from 'dayjs'

export const useBillStore = defineStore('bill', () => {
  const bills = ref<BillVO[]>([])

  const getBills = async (userId: string) => {
    // TODO: 实现实际的API调用
    const res = await getMonthCash(userId, {
      year: dayjs().year(),
      month: dayjs().month() + 1
    })
    bills.value = res.data
    return { data: bills.value }
  }

  const addBill = async (bill: BillDTO) => {
    const res = await addCash(bill)
    bills.value.push(res.data)
    return { data: res.data }
  }

  return {
    bills,
    getBills,
    addBill
  }
}) 