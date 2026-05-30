import { createContext, useContext, useState, useCallback } from 'react';
import api from '../config/api';
import { chartColors } from '../utils/categories';
import { getMonthLabel, getCurrentMonth } from '../utils/formatCurrency';

const FinanceContext = createContext(null);

export const FinanceProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ totalPages: 1, currentPage: 1, totalTransactions: 0 });

  // ===== TRANSACTIONS =====
  const fetchTransactions = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const { data } = await api.get('/transactions', { params: { limit: 100, ...params } });
      setTransactions(data.data);
      setPagination({
        totalPages: data.totalPages,
        currentPage: data.currentPage,
        totalTransactions: data.totalTransactions,
      });
      return data;
    } catch (err) {
      console.error('Fetch transactions error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createTransaction = async (txData) => {
    const { data } = await api.post('/transactions', txData);
    await fetchTransactions();
    return data.data;
  };

  const updateTransaction = async (id, txData) => {
    const { data } = await api.put(`/transactions/${id}`, txData);
    await fetchTransactions();
    return data.data;
  };

  const deleteTransaction = async (id) => {
    await api.delete(`/transactions/${id}`);
    await fetchTransactions();
  };

  // ===== BUDGETS =====
  const fetchBudgets = useCallback(async (month) => {
    try {
      const { data } = await api.get('/budgets', { params: { month: month || getCurrentMonth() } });
      setBudgets(data.data);
      return data.data;
    } catch (err) {
      console.error('Fetch budgets error:', err);
      throw err;
    }
  }, []);

  const createBudget = async (budgetData) => {
    const { data } = await api.post('/budgets', budgetData);
    await fetchBudgets();
    return data.data;
  };

  const updateBudget = async (id, budgetData) => {
    const { data } = await api.put(`/budgets/${id}`, budgetData);
    await fetchBudgets();
    return data.data;
  };

  const deleteBudget = async (id) => {
    await api.delete(`/budgets/${id}`);
    await fetchBudgets();
  };

  // ===== COMPUTED METRICS =====
  const getMetrics = useCallback(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let totalIncome = 0, totalExpense = 0, monthlyIncome = 0, monthlyExpense = 0;

    transactions.forEach(tx => {
      const txDate = new Date(tx.date);
      if (tx.type === 'income') {
        totalIncome += tx.amount;
        if (txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear) {
          monthlyIncome += tx.amount;
        }
      } else {
        totalExpense += tx.amount;
        if (txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear) {
          monthlyExpense += tx.amount;
        }
      }
    });

    return {
      totalBalance: totalIncome - totalExpense,
      totalIncome,
      totalExpense,
      monthlySavings: monthlyIncome - monthlyExpense,
    };
  }, [transactions]);

  // ===== CHART DATA =====
  const getChartData = useCallback(() => {
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        label: getMonthLabel(d),
        month: d.getMonth(),
        year: d.getFullYear(),
        income: 0,
        expense: 0,
      });
    }

    transactions.forEach(tx => {
      const txDate = new Date(tx.date);
      const bucket = months.find(m => m.month === txDate.getMonth() && m.year === txDate.getFullYear());
      if (bucket) {
        if (tx.type === 'income') bucket.income += tx.amount;
        else bucket.expense += tx.amount;
      }
    });

    // Income vs Expense bar chart
    const incomeVsExpenseData = {
      labels: months.map(m => m.label),
      datasets: [
        {
          label: 'Income',
          data: months.map(m => m.income),
          backgroundColor: 'rgba(16, 185, 129, 0.7)',
          borderColor: '#10B981',
          borderWidth: 2,
          borderRadius: 6,
        },
        {
          label: 'Expense',
          data: months.map(m => m.expense),
          backgroundColor: 'rgba(239, 68, 68, 0.7)',
          borderColor: '#EF4444',
          borderWidth: 2,
          borderRadius: 6,
        },
      ],
    };

    // Category breakdown pie
    const categoryMap = {};
    transactions.forEach(tx => {
      if (tx.type === 'expense') {
        categoryMap[tx.category] = (categoryMap[tx.category] || 0) + tx.amount;
      }
    });

    const categories = Object.entries(categoryMap).sort((a, b) => b[1] - a[1]);
    const categoryBreakdownData = {
      labels: categories.map(([cat]) => cat),
      datasets: [{
        data: categories.map(([, amt]) => amt),
        backgroundColor: categories.map((_, i) => chartColors[i % chartColors.length]),
        borderWidth: 0,
      }],
    };

    // Savings trend line
    const savingsData = {
      labels: months.map(m => m.label),
      datasets: [{
        label: 'Savings',
        data: months.map(m => Math.max(0, m.income - m.expense)),
        borderColor: '#6366F1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#6366F1',
      }],
    };

    // Cash flow line
    const cashFlowData = {
      labels: months.map(m => m.label),
      datasets: [
        {
          label: 'Income',
          data: months.map(m => m.income),
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: '#10B981',
        },
        {
          label: 'Expense',
          data: months.map(m => m.expense),
          borderColor: '#EF4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: '#EF4444',
        },
      ],
    };

    return { incomeVsExpenseData, categoryBreakdownData, savingsData, cashFlowData, months };
  }, [transactions]);

  return (
    <FinanceContext.Provider value={{
      transactions, budgets, loading, pagination,
      fetchTransactions, createTransaction, updateTransaction, deleteTransaction,
      fetchBudgets, createBudget, updateBudget, deleteBudget,
      getMetrics, getChartData,
    }}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error('useFinance must be used within FinanceProvider');
  return ctx;
};
