import { Transaction } from '@/types';
import { DatabaseService } from './database-service-auth';

export async function generateDemoData(): Promise<Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>[]> {
  const now = new Date();
  const demoTransactions: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>[] = [
    // Income transactions
    {
      amount: 5000,
      description: 'Monthly salary from TechCorp',
      category: 'Salary',
      type: 'income',
      date: new Date(now.getFullYear(), now.getMonth(), 1),
    },
    {
      amount: 1200,
      description: 'Freelance web development project',
      category: 'Freelance',
      type: 'income',
      date: new Date(now.getFullYear(), now.getMonth(), 15),
    },
    {
      amount: 250,
      description: 'Stock dividend payment',
      category: 'Investments',
      type: 'income',
      date: new Date(now.getFullYear(), now.getMonth(), 20),
    },

    // Expense transactions
    {
      amount: 45.67,
      description: 'Weekly grocery shopping at Walmart',
      category: 'Groceries',
      type: 'expense',
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1),
    },
    {
      amount: 85.30,
      description: 'Dinner at Italian restaurant',
      category: 'Food & Dining',
      type: 'expense',
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2),
    },
    {
      amount: 1200,
      description: 'Monthly rent payment',
      category: 'Bills & Utilities',
      type: 'expense',
      date: new Date(now.getFullYear(), now.getMonth(), 1),
    },
    {
      amount: 65.00,
      description: 'Gas for car',
      category: 'Transportation',
      type: 'expense',
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 3),
    },
    {
      amount: 129.99,
      description: 'New running shoes from Nike',
      category: 'Shopping',
      type: 'expense',
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 5),
    },
    {
      amount: 25.50,
      description: 'Movie tickets for two',
      category: 'Entertainment',
      type: 'expense',
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7),
    },
    {
      amount: 89.99,
      description: 'Internet bill',
      category: 'Bills & Utilities',
      type: 'expense',
      date: new Date(now.getFullYear(), now.getMonth(), 5),
    },
    {
      amount: 35.20,
      description: 'Uber ride to airport',
      category: 'Transportation',
      type: 'expense',
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 10),
    },
    {
      amount: 150.00,
      description: 'Doctor visit and consultation',
      category: 'Health & Medical',
      type: 'expense',
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 12),
    },
    {
      amount: 78.45,
      description: 'Weekly groceries at Target',
      category: 'Groceries',
      type: 'expense',
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 8),
    },
    {
      amount: 299.99,
      description: 'Online course subscription',
      category: 'Education',
      type: 'expense',
      date: new Date(now.getFullYear(), now.getMonth(), 10),
    },
    {
      amount: 42.30,
      description: 'Coffee shop visits this week',
      category: 'Food & Dining',
      type: 'expense',
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 4),
    },

    // Previous month transactions
    {
      amount: 5000,
      description: 'Monthly salary from TechCorp',
      category: 'Salary',
      type: 'income',
      date: new Date(now.getFullYear(), now.getMonth() - 1, 1),
    },
    {
      amount: 800,
      description: 'Side project payment',
      category: 'Freelance',
      type: 'income',
      date: new Date(now.getFullYear(), now.getMonth() - 1, 18),
    },
    {
      amount: 1200,
      description: 'Monthly rent payment',
      category: 'Bills & Utilities',
      type: 'expense',
      date: new Date(now.getFullYear(), now.getMonth() - 1, 1),
    },
    {
      amount: 234.56,
      description: 'Electricity bill',
      category: 'Bills & Utilities',
      type: 'expense',
      date: new Date(now.getFullYear(), now.getMonth() - 1, 15),
    },
    {
      amount: 456.78,
      description: 'Grocery shopping for the month',
      category: 'Groceries',
      type: 'expense',
      date: new Date(now.getFullYear(), now.getMonth() - 1, 12),
    },
  ];

  return demoTransactions;
}

export async function loadDemoData(): Promise<void> {
  try {
    const demoTransactions = await generateDemoData();
    
    // Clear existing data first
    await DatabaseService.clearAllData();
    
    // Add demo transactions one by one
    for (const transaction of demoTransactions) {
      try {
        await DatabaseService.saveTransaction(transaction);
      } catch (error) {
        console.warn('Failed to save demo transaction:', error);
      }
    }
  } catch (error) {
    console.error('Failed to load demo data:', error);
    throw error;
  }
}

export async function hasDemoData(): Promise<boolean> {
  try {
    const transactions = await DatabaseService.getTransactions();
    return transactions.some(t => 
      t.description.includes('TechCorp') || 
      t.description.includes('Weekly grocery shopping at Walmart')
    );
  } catch (error) {
    console.error('Failed to check demo data:', error);
    return false;
  }
}

// Sample AI categorization examples for testing
export const AI_DEMO_INPUTS = [
  'Bought groceries at Walmart $45.67',
  'Lunch at McDonald\'s $12.50',
  'Gas for car $35.20',
  'Monthly salary $5000',
  'Freelance web design project $800',
  'Movie tickets $25',
  'Coffee at Starbucks $6.75',
  'Uber ride downtown $18.30',
  'Electricity bill $89.45',
  'Gym membership $29.99',
  'Dinner at Italian restaurant $67.50',
  'Amazon shopping $156.78',
  'Doctor appointment $120',
  'Online course $199',
  'Received bonus $500',
];
