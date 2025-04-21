export interface BillVO {
  id: string;
  price: number;
  type: 'income' | 'expense';
  category: any;
  account: any;
  icon: string;
  description: string;
  date: string;
} 

export interface BillDTO {
  price: number;
  type: 'income' | 'expense';
  categoryId: string;
  description: string;
  date: string;
  userId: string;
  accountId: string;
}