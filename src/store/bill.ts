import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { BillDTO, BillVO } from '@/types/bill'
import { addCash, getCashByDaterange } from '@/api/cash'
import dayjs from 'dayjs'

export const useBillStore = defineStore('bill', () => {
  const bills = ref<BillVO[]>([])

  const getBills = async () => {
    // TODO: 实现实际的API调用
    const res = await getCashByDaterange({
      startDate: dayjs().startOf('month').format('YYYY-MM-DD HH:mm:ss'),
      endDate: dayjs().endOf('month').format('YYYY-MM-DD HH:mm:ss')
    })
    bills.value = res.data
    return { data: bills.value }
  }

  return {
    bills,
    getBills
  }
}) 