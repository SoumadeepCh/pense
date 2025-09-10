export interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: string;
  type: 'income' | 'expense';
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  type: 'income' | 'expense' | 'both';
  isDefault: boolean;
}

export interface Summary {
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  transactionCount: number;
  period: string;
}

export interface ChartData {
  date: string;
  income: number;
  expenses: number;
  net: number;
}

export interface CategoryData {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface AICategorizationResult {
  category: string;
  confidence: number;
  reasoning: string;
}

export interface DateRange {
  from: Date;
  to: Date;
}

export type ViewType = 'daily' | 'weekly' | 'monthly' | 'yearly';
export type ChartType = 'line' | 'bar' | 'pie' | 'area';

export interface FilterOptions {
  dateRange: DateRange | null;
  categories: string[];
  types: ('income' | 'expense')[];
  minAmount: number | null;
  maxAmount: number | null;
  search: string;
}
