import { post, get } from '@/utils/request';

export const addCash = (data: any, type: string) => {
  return post(`/finance/transactions/${type.toLowerCase()}`, data);
};

export const getCashByType = (type: string) => {
  return get(`/finance/transactions/getTransactionsByType/${type}`);
};

export const getMonthCash = (userId: string, data: any) => {
  return post(`/cash/find-all-by-time/${userId}`, data);
};
