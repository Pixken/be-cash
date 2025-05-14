import { del, get, post, put } from '@/utils/request';

export const getCashCategory = () => {
  return get(`/finance/transactions/getCategories`);
}

export const addCashCategory = (data: any) => {
  return post(`/system/category/save`, data);
}

export const updateCashCategory = (data: any) => {
  return put(`/system/category/${data.categoryId}`, data);
}

export const deleteCashCategory = (data: any) => {
  return del(`/system/category/${data.categoryId}`, data);
}