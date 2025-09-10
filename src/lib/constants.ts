import { Category } from '@/types';

export const DEFAULT_CATEGORIES: Omit<Category, 'id'>[] = [
  // Expense Categories
  { name: 'Food & Dining', color: '#ef4444', icon: 'UtensilsCrossed', type: 'expense', isDefault: true },
  { name: 'Groceries', color: '#f97316', icon: 'ShoppingCart', type: 'expense', isDefault: true },
  { name: 'Transportation', color: '#eab308', icon: 'Car', type: 'expense', isDefault: true },
  { name: 'Entertainment', color: '#22c55e', icon: 'Gamepad2', type: 'expense', isDefault: true },
  { name: 'Shopping', color: '#3b82f6', icon: 'ShoppingBag', type: 'expense', isDefault: true },
  { name: 'Health & Medical', color: '#8b5cf6', icon: 'Heart', type: 'expense', isDefault: true },
  { name: 'Bills & Utilities', color: '#ec4899', icon: 'Receipt', type: 'expense', isDefault: true },
  { name: 'Education', color: '#06b6d4', icon: 'GraduationCap', type: 'expense', isDefault: true },
  { name: 'Travel', color: '#84cc16', icon: 'Plane', type: 'expense', isDefault: true },
  { name: 'Home & Garden', color: '#f59e0b', icon: 'Home', type: 'expense', isDefault: true },
  { name: 'Personal Care', color: '#e11d48', icon: 'Scissors', type: 'expense', isDefault: true },
  { name: 'Insurance', color: '#7c3aed', icon: 'Shield', type: 'expense', isDefault: true },
  { name: 'Investments', color: '#059669', icon: 'TrendingUp', type: 'expense', isDefault: true },
  { name: 'Miscellaneous', color: '#6b7280', icon: 'MoreHorizontal', type: 'expense', isDefault: true },

  // Income Categories
  { name: 'Salary', color: '#10b981', icon: 'Briefcase', type: 'income', isDefault: true },
  { name: 'Freelance', color: '#3b82f6', icon: 'Laptop', type: 'income', isDefault: true },
  { name: 'Business', color: '#8b5cf6', icon: 'Building2', type: 'income', isDefault: true },
  { name: 'Investments', color: '#f59e0b', icon: 'TrendingUp', type: 'income', isDefault: true },
  { name: 'Rental', color: '#ef4444', icon: 'Home', type: 'income', isDefault: true },
  { name: 'Side Hustle', color: '#06b6d4', icon: 'Zap', type: 'income', isDefault: true },
  { name: 'Gifts', color: '#ec4899', icon: 'Gift', type: 'income', isDefault: true },
  { name: 'Refunds', color: '#84cc16', icon: 'RotateCcw', type: 'income', isDefault: true },
  { name: 'Other Income', color: '#6b7280', icon: 'Plus', type: 'income', isDefault: true },
];

export const CHART_COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
];

export const AI_CATEGORIZATION_KEYWORDS = {
  'Food & Dining': ['restaurant', 'cafe', 'dinner', 'lunch', 'breakfast', 'pizza', 'burger', 'food delivery', 'takeout', 'dine'],
  'Groceries': ['grocery', 'supermarket', 'walmart', 'target', 'costco', 'market', 'vegetables', 'fruits', 'milk', 'bread'],
  'Transportation': ['gas', 'fuel', 'uber', 'lyft', 'taxi', 'bus', 'train', 'metro', 'parking', 'car wash'],
  'Entertainment': ['movie', 'cinema', 'concert', 'theater', 'game', 'streaming', 'netflix', 'spotify', 'entertainment'],
  'Shopping': ['amazon', 'shopping', 'clothes', 'shoes', 'online', 'mall', 'store', 'purchase', 'buy'],
  'Health & Medical': ['doctor', 'hospital', 'pharmacy', 'medicine', 'medical', 'health', 'dentist', 'clinic'],
  'Bills & Utilities': ['electric', 'electricity', 'water', 'gas bill', 'internet', 'phone bill', 'utility', 'rent'],
  'Education': ['school', 'university', 'course', 'book', 'tuition', 'education', 'training', 'seminar'],
  'Travel': ['hotel', 'flight', 'travel', 'vacation', 'trip', 'airbnb', 'booking', 'airline'],
  'Home & Garden': ['furniture', 'home depot', 'garden', 'tools', 'repair', 'maintenance', 'hardware'],
  'Personal Care': ['salon', 'barber', 'spa', 'cosmetics', 'personal care', 'beauty', 'haircut'],
  'Insurance': ['insurance', 'policy', 'premium', 'coverage'],
  'Investments': ['investment', 'stocks', 'bonds', 'mutual fund', 'etf', 'crypto', 'trading'],
  'Salary': ['salary', 'paycheck', 'wages', 'income', 'pay'],
  'Freelance': ['freelance', 'consulting', 'contract', 'gig', 'project'],
  'Business': ['business', 'revenue', 'sales', 'profit', 'commission'],
  'Rental': ['rent', 'rental income', 'property', 'tenant'],
  'Side Hustle': ['side hustle', 'part time', 'extra income', 'odd job'],
  'Gifts': ['gift', 'bonus', 'present', 'reward'],
  'Refunds': ['refund', 'return', 'reimbursement', 'cashback'],
};
