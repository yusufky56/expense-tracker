export type TransactionType = 'income' | 'expense'

export interface Transaction {
  id: string
  type: TransactionType
  amount: number
  category: string
  note: string
  /** ISO date, `YYYY-MM-DD` */
  date: string
}

export type NewTransaction = Omit<Transaction, 'id'>

export const EXPENSE_CATEGORIES = [
  'Food',
  'Rent',
  'Transport',
  'Bills',
  'Shopping',
  'Health',
  'Entertainment',
  'Education',
  'Other',
] as const

export const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Gift', 'Investment', 'Other'] as const

export const CURRENCIES = ['USD', 'EUR', 'TRY', 'GBP'] as const
export type Currency = (typeof CURRENCIES)[number]
