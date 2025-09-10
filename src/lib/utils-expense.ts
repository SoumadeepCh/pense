import { Transaction, Summary, ChartData, CategoryData, ViewType } from '@/types';
import { format, startOfWeek, startOfMonth, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval } from 'date-fns';

export function calculateSummary(transactions: Transaction[], period: string): Summary {
  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const expenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  return {
    totalIncome: income,
    totalExpenses: expenses,
    netIncome: income - expenses,
    transactionCount: transactions.length,
    period
  };
}

export function generateChartData(transactions: Transaction[], viewType: ViewType): ChartData[] {
  if (transactions.length === 0) return [];

  const sortedTransactions = transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const startDate = new Date(sortedTransactions[0].date);
  const endDate = new Date(sortedTransactions[sortedTransactions.length - 1].date);

  let intervals: Date[] = [];
  let formatStr: string = '';

  switch (viewType) {
    case 'daily':
      intervals = eachDayOfInterval({ start: startDate, end: endDate });
      formatStr = 'MMM dd';
      break;
    case 'weekly':
      intervals = eachWeekOfInterval({ start: startOfWeek(startDate), end: endDate });
      formatStr = 'MMM dd';
      break;
    case 'monthly':
      intervals = eachMonthOfInterval({ start: startOfMonth(startDate), end: endDate });
      formatStr = 'MMM yyyy';
      break;
    case 'yearly':
      // For yearly view, group by year
      const years = Array.from(new Set(transactions.map(t => new Date(t.date).getFullYear())));
      intervals = years.map(year => new Date(year, 0, 1));
      formatStr = 'yyyy';
      break;
  }

  return intervals.map(date => {
    let periodTransactions: Transaction[] = [];

    switch (viewType) {
      case 'daily':
        periodTransactions = transactions.filter(t => 
          format(new Date(t.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
        );
        break;
      case 'weekly':
        const weekEnd = new Date(date.getTime() + 6 * 24 * 60 * 60 * 1000);
        periodTransactions = transactions.filter(t => {
          const tDate = new Date(t.date);
          return tDate >= date && tDate <= weekEnd;
        });
        break;
      case 'monthly':
        periodTransactions = transactions.filter(t => 
          format(new Date(t.date), 'yyyy-MM') === format(date, 'yyyy-MM')
        );
        break;
      case 'yearly':
        periodTransactions = transactions.filter(t => 
          new Date(t.date).getFullYear() === date.getFullYear()
        );
        break;
    }

    const income = periodTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = periodTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      date: format(date, formatStr),
      income,
      expenses,
      net: income - expenses
    };
  });
}

export function getCategoryData(transactions: Transaction[]): CategoryData[] {
  const categoryTotals = transactions.reduce((acc, transaction) => {
    const category = transaction.category;
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category] += transaction.amount;
    return acc;
  }, {} as Record<string, number>);

  const total = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);

  return Object.entries(categoryTotals)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: (amount / total) * 100,
      color: getRandomColor()
    }))
    .sort((a, b) => b.amount - a.amount);
}

export function getRandomColor(): string {
  const colors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
    '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

export function formatDate(date: Date): string {
  return format(date, 'PPP');
}

export function formatDateShort(date: Date): string {
  return format(date, 'MMM dd, yyyy');
}

export function filterTransactions(
  transactions: Transaction[],
  filters: {
    search?: string;
    categories?: string[];
    types?: ('income' | 'expense')[];
    dateRange?: { from: Date; to: Date };
    minAmount?: number;
    maxAmount?: number;
  }
): Transaction[] {
  return transactions.filter(transaction => {
    // Search filter
    if (filters.search && !transaction.description.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }

    // Category filter
    if (filters.categories && filters.categories.length > 0 && !filters.categories.includes(transaction.category)) {
      return false;
    }

    // Type filter
    if (filters.types && filters.types.length > 0 && !filters.types.includes(transaction.type)) {
      return false;
    }

    // Date range filter
    if (filters.dateRange) {
      const transactionDate = new Date(transaction.date);
      if (transactionDate < filters.dateRange.from || transactionDate > filters.dateRange.to) {
        return false;
      }
    }

    // Amount range filter
    if (filters.minAmount !== undefined && transaction.amount < filters.minAmount) {
      return false;
    }
    if (filters.maxAmount !== undefined && transaction.amount > filters.maxAmount) {
      return false;
    }

    return true;
  });
}
