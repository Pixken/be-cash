export interface BillVO {
  id: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  category: any;
  account: any;
  icon: string;
  description: string;
  transactionDate: string;
} 

export interface BillDTO {
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  categoryId: string;
  description: string;
  transactionDate: string;
  userId: string;
  accountId: string;
}

export interface AccountbookItem {
  id: number
  description: string
  amount: number
  type: 'income' | 'expense'
  time: string
  category: string
  appName: string
}