import { DateRange } from '@/types';
import { get } from '@/utils/request';

export const getStatistics = ({ startDate, endDate }: DateRange) => {
  return get(`/finance/statistics/monthly?startDate=${startDate}&endDate=${endDate}`);
};

export const getTransactionsByCategory = ({ startDate, endDate }: DateRange) => {
  return get(`/finance/statistics/transactionsByCategory?startDate=${startDate}&endDate=${endDate}`);
};