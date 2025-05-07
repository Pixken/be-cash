export interface BillVO {
  id: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  category: any;
  account: any;
  icon: string;
  description: string;
  date: string;
} 

export interface BillDTO {
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  categoryId: string;
  description: string;
  date: string;
  userId: string;
  accountId: string;
}