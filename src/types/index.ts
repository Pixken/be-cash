export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface Statistics {
  balance: number
  expense: number
  income: number
  month?: number
  year?: number
}

export interface Analysis {
  [key: string]: {
    [key: string]: {
      category: number
      count: number
      totalExpense: number
      totalIncome: number
    }
  }
}