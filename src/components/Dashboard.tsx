'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { 
  Plus, BarChart3, List, Download, Upload, 
  Menu, Home, Wallet, Sparkles, TrendingUp
} from 'lucide-react';
import { Transaction, Category } from '@/types';
import { StorageService } from '@/lib/storage';
import { TransactionForm } from './TransactionForm';
import { TransactionList } from './TransactionList';
import { Analytics } from './Analytics';
import { formatCurrency } from '@/lib/utils-expense';
import { toast } from 'sonner';

export function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setIsLoading(true);
    try {
      const loadedTransactions = StorageService.getTransactions();
      const loadedCategories = StorageService.getCategories();
      
      setTransactions(loadedTransactions);
      setCategories(loadedCategories);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTransactionSubmit = (transaction: Transaction) => {
    if (editingTransaction) {
      // Update existing transaction
      setTransactions(prev => 
        prev.map(t => t.id === transaction.id ? transaction : t)
      );
      setEditingTransaction(null);
    } else {
      // Add new transaction
      setTransactions(prev => [...prev, transaction]);
    }
    setShowAddTransaction(false);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowAddTransaction(true);
  };

  const handleExportData = () => {
    try {
      const data = StorageService.exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `expense-tracker-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Data exported successfully');
    } catch {
      toast.error('Failed to export data');
    }
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = e.target?.result as string;
        const success = StorageService.importData(jsonData);
        
        if (success) {
          loadData(); // Reload data after import
          toast.success('Data imported successfully');
        } else {
          toast.error('Failed to import data');
        }
      } catch {
        toast.error('Invalid file format');
      }
    };
    reader.readAsText(file);
    
    // Reset input
    event.target.value = '';
  };

  // Calculate summary for overview
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const netIncome = totalIncome - totalExpenses;

  // Recent transactions (last 5)
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const NavigationMenu = ({ isMobile = false }) => (
    <div className={`space-y-2 ${isMobile ? 'p-4' : ''}`}>
      <Button
        variant={activeTab === 'overview' ? 'default' : 'ghost'}
        className="w-full justify-start"
        onClick={() => setActiveTab('overview')}
      >
        <Home className="h-4 w-4 mr-2" />
        Overview
      </Button>
      
      <Button
        variant={activeTab === 'transactions' ? 'default' : 'ghost'}
        className="w-full justify-start"
        onClick={() => setActiveTab('transactions')}
      >
        <List className="h-4 w-4 mr-2" />
        Transactions
      </Button>
      
      <Button
        variant={activeTab === 'analytics' ? 'default' : 'ghost'}
        className="w-full justify-start"
        onClick={() => setActiveTab('analytics')}
      >
        <BarChart3 className="h-4 w-4 mr-2" />
        Analytics
      </Button>

      <div className="pt-4">
        <Button
          onClick={() => setShowAddTransaction(true)}
          className="w-full mb-2"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Transaction
        </Button>
        
        <div className="space-y-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={handleExportData}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          
          <div>
            <input
              type="file"
              accept=".json"
              onChange={handleImportData}
              className="hidden"
              id="import-file"
            />
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => document.getElementById('import-file')?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              Import Data
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Wallet className="h-16 w-16 mx-auto mb-4 text-blue-600 animate-pulse" />
          <p className="text-lg font-medium">Loading your expense tracker...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              {/* Mobile menu */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="md:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64">
                  <NavigationMenu isMobile={true} />
                </SheetContent>
              </Sheet>

              <div className="flex items-center gap-2">
                <Wallet className="h-8 w-8 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900">Expense Tracker</h1>
                <Sparkles className="h-5 w-5 text-purple-500" />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-green-600 font-medium">
                    {formatCurrency(netIncome)}
                  </span>
                </div>
                <span className="text-gray-300">|</span>
                <span className="text-gray-600">
                  {transactions.length} transactions
                </span>
              </div>

              <Button
                onClick={() => setShowAddTransaction(true)}
                size="sm"
                className="hidden sm:flex"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Sidebar - Desktop */}
          <div className="hidden md:block w-64 flex-shrink-0">
            <Card className="h-fit">
              <CardContent className="p-6">
                <NavigationMenu />
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Total Income</p>
                          <p className="text-2xl font-bold text-green-600">
                            {formatCurrency(totalIncome)}
                          </p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Total Expenses</p>
                          <p className="text-2xl font-bold text-red-600">
                            {formatCurrency(totalExpenses)}
                          </p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-red-600 rotate-180" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Net Income</p>
                          <p className={`text-2xl font-bold ${
                            netIncome >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {formatCurrency(netIncome)}
                          </p>
                        </div>
                        <Wallet className="h-8 w-8 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Transactions */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold">Recent Transactions</h2>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveTab('transactions')}
                      >
                        View All
                      </Button>
                    </div>
                    
                    {recentTransactions.length > 0 ? (
                      <div className="space-y-3">
                        {recentTransactions.map((transaction) => (
                          <div
                            key={transaction.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div>
                              <p className="font-medium">{transaction.description}</p>
                              <p className="text-sm text-gray-600">
                                {transaction.category} • {new Date(transaction.date).toLocaleDateString()}
                              </p>
                            </div>
                            <span className={`font-bold ${
                              transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {transaction.type === 'income' ? '+' : '-'}
                              {formatCurrency(transaction.amount)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <p>No transactions yet</p>
                        <Button
                          onClick={() => setShowAddTransaction(true)}
                          className="mt-2"
                          size="sm"
                        >
                          Add your first transaction
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'transactions' && (
              <TransactionList
                transactions={transactions}
                categories={categories}
                onEdit={handleEditTransaction}
                onRefresh={loadData}
              />
            )}

            {activeTab === 'analytics' && (
              <Analytics
                transactions={transactions}
                categories={categories}
              />
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Transaction Dialog */}
      <Dialog open={showAddTransaction} onOpenChange={setShowAddTransaction}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <TransactionForm
            onSubmit={handleTransactionSubmit}
            onCancel={() => {
              setShowAddTransaction(false);
              setEditingTransaction(null);
            }}
            initialData={editingTransaction}
            categories={categories}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
