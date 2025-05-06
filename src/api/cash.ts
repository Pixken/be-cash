import { post, get } from '@/utils/request';

export const addCash = (data: any, type: string) => {
  return post(`/finance/transactions/${type.toLowerCase()}`, data);
};

export const getCashByType = (type: string) => {
  return get(`/finance/transactions/getTransactionsByType/${type}`);
};

export const getCashByDaterange = (data: { startDate: string, endDate: string }) => {
  return get(`/finance/transactions/date-range?startDate=${data.startDate}&endDate=${data.endDate}`);
};
