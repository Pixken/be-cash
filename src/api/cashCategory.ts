import { get } from '@/utils/request';

export const getCashCategory = () => {
  return get(`/finance/transactions/getCategories`);
}