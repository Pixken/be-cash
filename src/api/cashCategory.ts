import { get } from '@/utils/request';

export const getCashCategory = (userId: string) => {
  return get(`/cash-category?userId=${userId}`);
}