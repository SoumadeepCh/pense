import mongoose, { Schema, Document } from 'mongoose';

// User interface
export interface IUser extends Document {
  _id: string;
  email: string;
  name: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

// Transaction interface
export interface ITransaction extends Document {
  _id: string;
  userId: string;
  amount: number;
  description: string;
  category: string;
  type: 'income' | 'expense';
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Category interface
export interface ICategory extends Document {
  _id: string;
  userId?: string; // Optional for default categories
  name: string;
  color: string;
  icon: string;
  type: 'income' | 'expense' | 'both';
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// User Schema
const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
}, {
  timestamps: true,
});

// Transaction Schema
const TransactionSchema = new Schema<ITransaction>({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: true,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Category Schema
const CategorySchema = new Schema<ICategory>({
  userId: {
    type: String,
    index: true,
    sparse: true, // Allows null values for default categories
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  color: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['income', 'expense', 'both'],
    required: true,
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Indexes for better query performance
TransactionSchema.index({ userId: 1, date: -1 });
TransactionSchema.index({ userId: 1, category: 1 });
TransactionSchema.index({ userId: 1, type: 1 });

CategorySchema.index({ userId: 1, type: 1 });
CategorySchema.index({ isDefault: 1 });

// Export models
export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export const Transaction = mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);
export const Category = mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);
