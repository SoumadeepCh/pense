'use client';

import { useState, useEffect } from 'react';
import { useSession, SessionProvider } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AnimatedCard } from '@/components/ui/animated-card';
import { SparklesCore } from '@/components/ui/sparkles';
import { BackgroundBeams } from '@/components/ui/background-beams';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { 
  Plus, BarChart3, List, Download, Upload, Menu, Sparkles, 
  Home, TrendingUp, Wallet, ArrowRight, Star, LogOut, User 
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import { Transaction, Category } from '@/types';
import { DatabaseService } from '@/lib/database-service-auth';
import { TransactionForm } from './TransactionForm';
import { TransactionList } from './TransactionList';
import { Analytics } from './Analytics';
import { formatCurrency } from '@/lib/utils-expense';
import { loadDemoData, hasDemoData } from '@/lib/demo-data-db';
import { toast } from 'sonner';

function EnhancedDashboardContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);

  // Check authentication and load data
  useEffect(() => {
    if (status === 'loading') return; // Still loading
    
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }
    
    if (status === 'authenticated') {
      loadData();
    }
  }, [status, router]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [loadedTransactions, loadedCategories] = await Promise.all([
        DatabaseService.getTransactions(),
        DatabaseService.getCategories(),
      ]);
      
      setTransactions(loadedTransactions);
      setCategories(loadedCategories);
      
      // Show welcome screen for first-time users
      if (loadedTransactions.length === 0) {
        setShowWelcome(true);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTransactionSubmit = (transaction: Transaction) => {
    if (editingTransaction) {
      setTransactions(prev => 
        prev.map(t => t.id === transaction.id ? transaction : t)
      );
      setEditingTransaction(null);
    } else {
      setTransactions(prev => [...prev, transaction]);
    }
    setShowAddTransaction(false);
    setShowWelcome(false);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowAddTransaction(true);
  };

  const handleExportData = async () => {
    try {
      const data = await DatabaseService.exportData();
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
    } catch (error) {
      toast.error('Failed to export data');
    }
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const jsonData = e.target?.result as string;
        const success = await DatabaseService.importData(jsonData);
        
        if (success) {
          await loadData();
          toast.success('Data imported successfully');
        } else {
          toast.error('Failed to import data');
        }
      } catch (error) {
        toast.error('Invalid file format');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleLoadDemoData = async () => {
    try {
      if (transactions.length > 0) {
        if (window.confirm('This will replace all existing data with demo data. Are you sure?')) {
          await loadDemoData();
          await loadData();
          setShowWelcome(false);
          toast.success('Demo data loaded successfully!');
        }
      } else {
        await loadDemoData();
        await loadData();
        setShowWelcome(false);
        toast.success('Demo data loaded successfully!');
      }
    } catch (error) {
      toast.error('Failed to load demo data');
    }
  };

  // Calculate summary
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const netIncome = totalIncome - totalExpenses;

  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const NavigationMenu = ({ isMobile = false }) => (
    <div className={`space-y-2 ${isMobile ? 'p-4' : ''}`}>
      {['overview', 'transactions', 'analytics'].map((tab) => {
        const icons = {
          overview: Home,
          transactions: List,
          analytics: BarChart3,
        };
        const Icon = icons[tab as keyof typeof icons];
        
        return (
          <motion.div
            key={tab}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              variant={activeTab === tab ? 'default' : 'ghost'}
              className="w-full justify-start relative overflow-hidden"
              onClick={() => setActiveTab(tab)}
            >
              {activeTab === tab && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600"
                  style={{ borderRadius: 6 }}
                />
              )}
              <div className="relative z-10 flex items-center">
                <Icon className="h-4 w-4 mr-2" />
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </div>
            </Button>
          </motion.div>
        );
      })}

      <div className="pt-4 space-y-2">
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={() => setShowAddTransaction(true)}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Transaction
          </Button>
        </motion.div>
        
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportData}
              className="text-xs"
            >
              <Download className="h-3 w-3 mr-1" />
              Export
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
                className="w-full text-xs"
                onClick={() => document.getElementById('import-file')?.click()}
              >
                <Upload className="h-3 w-3 mr-1" />
                Import
              </Button>
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleLoadDemoData}
            className="w-full text-xs bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100"
          >
            <Star className="h-3 w-3 mr-1" />
            Load Demo Data
          </Button>
        </div>
      </div>
    </div>
  );

  // Welcome Screen
  const WelcomeScreen = () => (
    <div className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      <BackgroundBeams className="opacity-20" />
      <SparklesCore
        id="welcome-sparkles"
        className="w-full h-full"
        minSize={0.6}
        maxSize={1.4}
        particleDensity={100}
        particleColor="#3b82f6"
      />
      
      <div className="relative z-10 text-center max-w-2xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center justify-center mb-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Wallet className="h-16 w-16 text-blue-600 mr-4" />
            </motion.div>
            <Sparkles className="h-12 w-12 text-purple-500" />
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Expense Tracker AI
          </h1>
          
          <p className="text-xl text-gray-600 mb-8">
            Smart expense tracking with AI-powered categorization
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-lg border"
            >
              <Sparkles className="h-8 w-8 text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">AI Categorization</h3>
              <p className="text-sm text-gray-600">
                Automatically categorize expenses with intelligent text analysis
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-lg border"
            >
              <BarChart3 className="h-8 w-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Beautiful Analytics</h3>
              <p className="text-sm text-gray-600">
                Visualize your spending with interactive charts and insights
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-lg border"
            >
              <Star className="h-8 w-8 text-yellow-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Smart Insights</h3>
              <p className="text-sm text-gray-600">
                Get personalized recommendations and spending patterns
              </p>
            </motion.div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                size="lg"
                onClick={() => setShowAddTransaction(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                size="lg"
                variant="outline"
                onClick={handleLoadDemoData}
                className="border-2 border-purple-200 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 px-8 py-4 text-lg"
              >
                <Star className="mr-2 h-5 w-5" />
                Try Demo
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );

  // Show loading while checking authentication or loading data
  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="relative">
          <SparklesCore
            id="loading-sparkles"
            className="w-32 h-32"
            minSize={0.8}
            maxSize={1.5}
            particleDensity={80}
            particleColor="#3b82f6"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Wallet className="h-16 w-16 text-blue-600" />
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated (redirect will handle this)
  if (status !== 'authenticated') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
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

              <motion.div 
                className="flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Wallet className="h-8 w-8 text-blue-600" />
                </motion.div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Expense Tracker AI
                </h1>
                <motion.div
                  animate={{ rotate: [0, -15, 15, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Sparkles className="h-5 w-5 text-purple-500" />
                </motion.div>
              </motion.div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-4 text-sm">
                <motion.div 
                  className="flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                >
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className={`font-medium ${
                    netIncome >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(netIncome)}
                  </span>
                </motion.div>
                <span className="text-gray-300">|</span>
                <span className="text-gray-600">
                  {transactions.length} transactions
                </span>
              </div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={() => setShowAddTransaction(true)}
                  size="sm"
                  className="hidden sm:flex bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </motion.div>

              {/* User Menu */}
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span>{session?.user?.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                  className="text-gray-600 hover:text-red-600"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {showWelcome ? (
          <WelcomeScreen />
        ) : (
          <div className="flex gap-6">
            {/* Sidebar - Desktop */}
            <div className="hidden md:block w-64 flex-shrink-0">
              <AnimatedCard delay={0.1}>
                <Card className="h-fit bg-white/80 backdrop-blur-sm border shadow-lg">
                  <CardContent className="p-6">
                    <NavigationMenu />
                  </CardContent>
                </Card>
              </AnimatedCard>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {[
                        { title: 'Total Income', amount: totalIncome, icon: TrendingUp, color: 'text-green-600' },
                        { title: 'Total Expenses', amount: totalExpenses, icon: TrendingUp, color: 'text-red-600', rotate: true },
                        { title: 'Net Income', amount: netIncome, icon: Wallet, color: netIncome >= 0 ? 'text-green-600' : 'text-red-600' },
                      ].map((item, index) => {
                        const Icon = item.icon;
                        return (
                          <AnimatedCard key={item.title} delay={index * 0.1}>
                            <Card className="bg-white/80 backdrop-blur-sm border shadow-lg">
                              <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm text-gray-600">{item.title}</p>
                                    <p className={`text-2xl font-bold ${item.color}`}>
                                      {formatCurrency(item.amount)}
                                    </p>
                                  </div>
                                  <Icon className={`h-8 w-8 ${item.color} ${item.rotate ? 'rotate-180' : ''}`} />
                                </div>
                              </CardContent>
                            </Card>
                          </AnimatedCard>
                        );
                      })}
                    </div>

                    {/* Recent Transactions */}
                    <AnimatedCard delay={0.4}>
                      <Card className="bg-white/80 backdrop-blur-sm border shadow-lg">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold">Recent Transactions</h2>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setActiveTab('transactions')}
                              className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50"
                            >
                              View All
                            </Button>
                          </div>
                          
                          {recentTransactions.length > 0 ? (
                            <div className="space-y-3">
                              {recentTransactions.map((transaction, index) => (
                                <motion.div
                                  key={transaction.id}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.1 }}
                                  className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50/80 to-blue-50/80 rounded-lg border hover:shadow-md transition-all"
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
                                </motion.div>
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
                    </AnimatedCard>
                  </div>
                )}

                {activeTab === 'transactions' && (
                  <AnimatedCard>
                    <TransactionList
                      transactions={transactions}
                      categories={categories}
                      onEdit={handleEditTransaction}
                      onRefresh={loadData}
                    />
                  </AnimatedCard>
                )}

                {activeTab === 'analytics' && (
                  <AnimatedCard>
                    <Analytics
                      transactions={transactions}
                      categories={categories}
                    />
                  </AnimatedCard>
                )}
              </motion.div>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Transaction Dialog */}
      <Dialog open={showAddTransaction} onOpenChange={setShowAddTransaction}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-sm">
          <DialogTitle className="sr-only">
            {editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}
          </DialogTitle>
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

export function EnhancedDashboard() {
  return (
    <SessionProvider>
      <EnhancedDashboardContent />
    </SessionProvider>
  );
}
