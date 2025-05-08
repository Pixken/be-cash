import { DateRange } from '@/types';
import { post, get, del } from '@/utils/request';

export const addCash = (data: any, type: string) => {
  return post(`/finance/transactions/${type.toLowerCase()}`, data);
};

export const deleteCash = (id: string) => {
  return del(`/finance/transactions/${id}`);
};

export const getCashByType = (type: string) => {
  return get(`/finance/transactions/getTransactionsByType/${type}`);
};

export const getCashByDaterange = ({ startDate, endDate }: DateRange) => {
  return get(`/finance/transactions/date-range?startDate=${startDate}&endDate=${endDate}`);
};
