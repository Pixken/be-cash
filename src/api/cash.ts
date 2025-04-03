import { post } from '@/utils/request';

export const addCash = (data: any) => {
  return post('/cash', data);
};

export const getMonthCash = (userId: string, data: any) => {
  return post(`/cash/find-all-by-time/${userId}`, data);
};
