import {
  Wallet, Briefcase, TrendingUp, Laptop,
  UtensilsCrossed, Plane, ShoppingCart, Receipt, Gamepad2, Heart
} from 'lucide-react';

export const incomeCategories = [
  { id: 'Salary', name: 'Salary', icon: Wallet, color: '#10B981' },
  { id: 'Freelancing', name: 'Freelancing', icon: Laptop, color: '#3B82F6' },
  { id: 'Business', name: 'Business', icon: Briefcase, color: '#8B5CF6' },
  { id: 'Investment', name: 'Investment', icon: TrendingUp, color: '#F59E0B' },
];

export const expenseCategories = [
  { id: 'Food', name: 'Food', icon: UtensilsCrossed, color: '#EF4444' },
  { id: 'Travel', name: 'Travel', icon: Plane, color: '#06B6D4' },
  { id: 'Shopping', name: 'Shopping', icon: ShoppingCart, color: '#EC4899' },
  { id: 'Bills', name: 'Bills', icon: Receipt, color: '#6366F1' },
  { id: 'Entertainment', name: 'Entertainment', icon: Gamepad2, color: '#F59E0B' },
  { id: 'Health', name: 'Health', icon: Heart, color: '#10B981' },
];

export const allCategories = [...incomeCategories, ...expenseCategories];

export const getCategoryInfo = (categoryName) => {
  return allCategories.find(c => c.id === categoryName) || {
    id: categoryName,
    name: categoryName,
    icon: Receipt,
    color: '#6366F1',
  };
};

export const chartColors = [
  '#6366F1', '#10B981', '#F59E0B', '#EF4444',
  '#EC4899', '#8B5CF6', '#06B6D4', '#3B82F6',
];
