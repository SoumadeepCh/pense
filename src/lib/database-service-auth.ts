import { Transaction, Category } from '@/types';
import { getSession } from 'next-auth/react';

export class DatabaseService {
  private static baseUrl = '/api';

  // Helper method to get user ID from session
  private static async getUserId(): Promise<string> {
    const session = await getSession();
    if (!session?.user?.id) {
      throw new Error('User not authenticated');
    }
    return session.user.id;
  }

  // Helper method to handle API responses
  private static async handleResponse(response: Response) {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  // Transactions
  static async getTransactions(): Promise<Transaction[]> {
    try {
      const userId = await this.getUserId();
      const response = await fetch(`${this.baseUrl}/transactions?userId=${userId}`);
      const transactions = await this.handleResponse(response);
      
      // Convert date strings back to Date objects
      return transactions.map((t: any) => ({
        ...t,
        date: new Date(t.date),
        createdAt: new Date(t.createdAt),
        updatedAt: new Date(t.updatedAt),
      }));
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      return [];
    }
  }

  static async saveTransaction(
    transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Transaction> {
    const userId = await this.getUserId();
    
    const response = await fetch(`${this.baseUrl}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        ...transaction,
      }),
    });

    const newTransaction = await this.handleResponse(response);
    
    return {
      ...newTransaction,
      date: new Date(newTransaction.date),
      createdAt: new Date(newTransaction.createdAt),
      updatedAt: new Date(newTransaction.updatedAt),
    };
  }

  static async updateTransaction(
    id: string,
    updates: Partial<Omit<Transaction, 'id' | 'createdAt'>>
  ): Promise<Transaction | null> {
    try {
      const userId = await this.getUserId();
      
      const response = await fetch(`${this.baseUrl}/transactions`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          userId,
          ...updates,
        }),
      });

      const updatedTransaction = await this.handleResponse(response);
      
      return {
        ...updatedTransaction,
        date: new Date(updatedTransaction.date),
        createdAt: new Date(updatedTransaction.createdAt),
        updatedAt: new Date(updatedTransaction.updatedAt),
      };
    } catch (error) {
      console.error('Failed to update transaction:', error);
      return null;
    }
  }

  static async deleteTransaction(id: string): Promise<boolean> {
    try {
      const userId = await this.getUserId();
      
      const response = await fetch(
        `${this.baseUrl}/transactions?id=${id}&userId=${userId}`,
        {
          method: 'DELETE',
        }
      );

      await this.handleResponse(response);
      return true;
    } catch (error) {
      console.error('Failed to delete transaction:', error);
      return false;
    }
  }

  // Categories
  static async getCategories(): Promise<Category[]> {
    try {
      // First, ensure default categories are initialized
      await this.initializeDefaultCategories();
      
      const userId = await this.getUserId();
      const response = await fetch(`${this.baseUrl}/categories?userId=${userId}`);
      const categories = await this.handleResponse(response);
      
      return categories.map((c: any) => ({
        ...c,
        createdAt: new Date(c.createdAt),
        updatedAt: new Date(c.updatedAt),
      }));
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      // Return empty array as fallback
      return [];
    }
  }

  static async saveCategory(category: Omit<Category, 'id'>): Promise<Category> {
    const userId = await this.getUserId();
    
    const response = await fetch(`${this.baseUrl}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        ...category,
      }),
    });

    const newCategory = await this.handleResponse(response);
    
    return {
      ...newCategory,
      createdAt: new Date(newCategory.createdAt),
      updatedAt: new Date(newCategory.updatedAt),
    };
  }

  static async updateCategory(
    id: string,
    updates: Partial<Omit<Category, 'id'>>
  ): Promise<Category | null> {
    try {
      const userId = await this.getUserId();
      
      const response = await fetch(`${this.baseUrl}/categories`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          userId,
          ...updates,
        }),
      });

      const updatedCategory = await this.handleResponse(response);
      
      return {
        ...updatedCategory,
        createdAt: new Date(updatedCategory.createdAt),
        updatedAt: new Date(updatedCategory.updatedAt),
      };
    } catch (error) {
      console.error('Failed to update category:', error);
      return null;
    }
  }

  static async deleteCategory(id: string): Promise<boolean> {
    try {
      const userId = await this.getUserId();
      
      const response = await fetch(
        `${this.baseUrl}/categories?id=${id}&userId=${userId}`,
        {
          method: 'DELETE',
        }
      );

      await this.handleResponse(response);
      return true;
    } catch (error) {
      console.error('Failed to delete category:', error);
      return false;
    }
  }

  // Initialize default categories
  private static async initializeDefaultCategories(): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/categories/init`, {
        method: 'POST',
      });
    } catch (error) {
      console.warn('Failed to initialize default categories:', error);
    }
  }

  // Utility methods for data export/import
  static async exportData(): Promise<string> {
    const userId = await this.getUserId();
    const [transactions, categories] = await Promise.all([
      this.getTransactions(),
      this.getCategories(),
    ]);

    const data = {
      transactions,
      categories: categories.filter(c => !c.isDefault), // Only export custom categories
      exportDate: new Date(),
      userId,
    };

    return JSON.stringify(data, null, 2);
  }

  static async importData(jsonData: string): Promise<boolean> {
    try {
      const data = JSON.parse(jsonData);
      
      // Import transactions
      if (data.transactions && Array.isArray(data.transactions)) {
        for (const transaction of data.transactions) {
          try {
            await this.saveTransaction({
              amount: transaction.amount,
              description: transaction.description,
              category: transaction.category,
              type: transaction.type,
              date: new Date(transaction.date),
            });
          } catch (error) {
            console.warn('Failed to import transaction:', error);
          }
        }
      }

      // Import custom categories
      if (data.categories && Array.isArray(data.categories)) {
        for (const category of data.categories) {
          if (!category.isDefault) {
            try {
              await this.saveCategory({
                name: category.name,
                color: category.color,
                icon: category.icon,
                type: category.type,
                isDefault: false,
              });
            } catch (error) {
              console.warn('Failed to import category:', error);
            }
          }
        }
      }

      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }

  // Clear all user data (for demo purposes)
  static async clearAllData(): Promise<void> {
    try {
      // Get all transactions and delete them
      const transactions = await this.getTransactions();
      await Promise.all(
        transactions.map(t => this.deleteTransaction(t.id))
      );

      // Get all custom categories and delete them
      const categories = await this.getCategories();
      await Promise.all(
        categories
          .filter(c => !c.isDefault)
          .map(c => this.deleteCategory(c.id))
      );
    } catch (error) {
      console.error('Failed to clear data:', error);
    }
  }

  // Settings (store in localStorage for now)
  static getSettings(): Record<string, any> {
    try {
      const data = localStorage.getItem('expense-tracker-settings');
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Failed to load settings:', error);
      return {};
    }
  }

  static saveSetting(key: string, value: any): void {
    try {
      const settings = this.getSettings();
      settings[key] = value;
      localStorage.setItem('expense-tracker-settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save setting:', error);
    }
  }
}
