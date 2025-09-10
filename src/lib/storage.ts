import { Transaction, Category } from '@/types';
import { DEFAULT_CATEGORIES } from './constants';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEYS = {
  TRANSACTIONS: 'expense-tracker-transactions',
  CATEGORIES: 'expense-tracker-categories',
  SETTINGS: 'expense-tracker-settings',
} as const;

export class StorageService {
  // Transactions
  static getTransactions(): Transaction[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (!data) return [];
      
      const transactions = JSON.parse(data) as Array<Omit<Transaction, 'date' | 'createdAt' | 'updatedAt'> & { date: string; createdAt: string; updatedAt: string }>;
      // Convert date strings back to Date objects
      return transactions.map((t) => ({
        ...t,
        date: new Date(t.date),
        createdAt: new Date(t.createdAt),
        updatedAt: new Date(t.updatedAt),
      }));
    } catch (error) {
      console.error('Failed to load transactions:', error);
      return [];
    }
  }

  static saveTransaction(transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Transaction {
    const newTransaction: Transaction = {
      ...transaction,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const transactions = this.getTransactions();
    transactions.push(newTransaction);
    this.saveTransactions(transactions);
    
    return newTransaction;
  }

  static updateTransaction(id: string, updates: Partial<Omit<Transaction, 'id' | 'createdAt'>>): Transaction | null {
    const transactions = this.getTransactions();
    const index = transactions.findIndex(t => t.id === id);
    
    if (index === -1) return null;

    const updatedTransaction = {
      ...transactions[index],
      ...updates,
      updatedAt: new Date(),
    };

    transactions[index] = updatedTransaction;
    this.saveTransactions(transactions);
    
    return updatedTransaction;
  }

  static deleteTransaction(id: string): boolean {
    const transactions = this.getTransactions();
    const filteredTransactions = transactions.filter(t => t.id !== id);
    
    if (filteredTransactions.length === transactions.length) {
      return false; // Transaction not found
    }

    this.saveTransactions(filteredTransactions);
    return true;
  }

  private static saveTransactions(transactions: Transaction[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    } catch (error) {
      console.error('Failed to save transactions:', error);
    }
  }

  // Categories
  static getCategories(): Category[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (!data) {
        // Initialize with default categories
        const defaultCategories = DEFAULT_CATEGORIES.map(cat => ({
          ...cat,
          id: uuidv4(),
        }));
        this.saveCategories(defaultCategories);
        return defaultCategories;
      }
      
      return JSON.parse(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
      return DEFAULT_CATEGORIES.map(cat => ({
        ...cat,
        id: uuidv4(),
      }));
    }
  }

  static saveCategory(category: Omit<Category, 'id'>): Category {
    const newCategory: Category = {
      ...category,
      id: uuidv4(),
    };

    const categories = this.getCategories();
    categories.push(newCategory);
    this.saveCategories(categories);
    
    return newCategory;
  }

  static updateCategory(id: string, updates: Partial<Omit<Category, 'id'>>): Category | null {
    const categories = this.getCategories();
    const index = categories.findIndex(c => c.id === id);
    
    if (index === -1) return null;

    const updatedCategory = {
      ...categories[index],
      ...updates,
    };

    categories[index] = updatedCategory;
    this.saveCategories(categories);
    
    return updatedCategory;
  }

  static deleteCategory(id: string): boolean {
    const categories = this.getCategories();
    const category = categories.find(c => c.id === id);
    
    if (!category || category.isDefault) {
      return false; // Cannot delete default categories
    }

    const filteredCategories = categories.filter(c => c.id !== id);
    this.saveCategories(filteredCategories);
    
    return true;
  }

  private static saveCategories(categories: Category[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    } catch (error) {
      console.error('Failed to save categories:', error);
    }
  }

  // Settings
  static getSettings(): Record<string, unknown> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Failed to load settings:', error);
      return {};
    }
  }

  static saveSetting(key: string, value: unknown): void {
    try {
      const settings = this.getSettings();
      settings[key] = value;
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save setting:', error);
    }
  }

  // Utility methods
  static exportData(): string {
    const data = {
      transactions: this.getTransactions(),
      categories: this.getCategories(),
      settings: this.getSettings(),
      exportDate: new Date(),
    };
    
    return JSON.stringify(data, null, 2);
  }

  static importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.transactions) {
        // Validate and convert dates
        const transactions = (data.transactions as Array<Omit<Transaction, 'date' | 'createdAt' | 'updatedAt'> & { date: string; createdAt: string; updatedAt: string }>).map((t) => ({
          ...t,
          date: new Date(t.date),
          createdAt: new Date(t.createdAt),
          updatedAt: new Date(t.updatedAt),
        }));
        localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
      }
      
      if (data.categories) {
        localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(data.categories));
      }
      
      if (data.settings) {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
      }
      
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }

  static clearAllData(): void {
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  }
}
