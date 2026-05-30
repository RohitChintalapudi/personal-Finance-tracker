import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard, ArrowDownLeft, ArrowUpRight, Sparkles,
  PlusCircle, MinusCircle, PieChart, List, Wallet, User,
  DollarSign, TrendingUp
} from 'lucide-react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  ArcElement, Tooltip, Legend, PointElement, LineElement, Filler
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { useAuth } from '../contexts/AuthContext';
import { useFinance } from '../contexts/FinanceContext';
import DashboardCard from '../components/DashboardCard';
import TransactionCard from '../components/TransactionCard';
import ChartWrapper from '../components/ChartWrapper';
import EmptyState from '../components/EmptyState';
import { getGreeting, formatCurrency } from '../utils/formatCurrency';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend, PointElement, LineElement, Filler);

const quickActions = [
  { label: 'Add Income', icon: PlusCircle, color: '#10B981', bg: 'rgba(16,185,129,0.1)', path: '/add-transaction?type=income' },
  { label: 'Add Expense', icon: MinusCircle, color: '#EF4444', bg: 'rgba(239,68,68,0.1)', path: '/add-transaction?type=expense' },
  { label: 'Analytics', icon: PieChart, color: '#6366F1', bg: 'rgba(99,102,241,0.1)', path: '/analytics' },
  { label: 'All Ledger', icon: List, color: '#3B82F6', bg: 'rgba(59,130,246,0.1)', path: '/transactions' },
  { label: 'Budgets', icon: Wallet, color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)', path: '/budget' },
  { label: 'My Profile', icon: User, color: '#EC4899', bg: 'rgba(236,72,153,0.1)', path: '/profile' },
];

const Dashboard = () => {
  const { user } = useAuth();
  const { transactions, fetchTransactions, getMetrics, getChartData } = useFinance();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const metrics = useMemo(() => getMetrics(), [getMetrics]);
  const chartData = useMemo(() => getChartData(), [getChartData]);
  const recentTx = useMemo(() => transactions.slice(0, 4), [transactions]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { padding: 20, usePointStyle: true, font: { size: 12, weight: 600 } } },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0,0,0,0.04)' },
        ticks: { callback: v => '₹' + v.toLocaleString('en-IN'), font: { size: 11 } },
      },
      x: { grid: { display: false }, ticks: { font: { size: 12, weight: 600 } } },
    },
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { padding: 16, usePointStyle: true, font: { size: 12, weight: 600 } } },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.label}: ${formatCurrency(ctx.parsed)}`,
        },
      },
    },
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
            {getGreeting()},
          </p>
          <h1 className="page-title">{user?.name || 'User'} 👋</h1>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-outline btn-icon" onClick={() => navigate('/currency-converter')} title="Currency Converter">
            <DollarSign size={18} />
          </button>
          <button className="btn btn-outline btn-icon" onClick={() => navigate('/stock-market')} title="Stock Market">
            <TrendingUp size={18} />
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="metrics-grid">
        <DashboardCard icon={CreditCard} label="Total Balance" amount={metrics.totalBalance} variant="primary" />
        <DashboardCard icon={ArrowDownLeft} label="Total Income" amount={metrics.totalIncome} variant="income" />
        <DashboardCard icon={ArrowUpRight} label="Total Expense" amount={metrics.totalExpense} variant="expense" />
        <DashboardCard icon={Sparkles} label="Monthly Savings" amount={metrics.monthlySavings} variant="savings" />
      </div>

      {/* Quick Actions */}
      <div className="section-header">
        <h2 className="section-title">Quick Actions</h2>
      </div>
      <div className="quick-actions">
        {quickActions.map(action => (
          <button
            key={action.label}
            className="quick-action-btn"
            onClick={() => navigate(action.path)}
          >
            <div className="quick-action-icon" style={{ backgroundColor: action.bg, color: action.color }}>
              <action.icon size={22} />
            </div>
            <span className="quick-action-label">{action.label}</span>
          </button>
        ))}
      </div>

      {/* Charts */}
      {transactions.length > 0 && (
        <div className="grid-2" style={{ marginBottom: 32 }}>
          <ChartWrapper title="Income vs Expense Trend" subtitle="Past 6 months">
            <div style={{ height: 280 }}>
              <Bar data={chartData.incomeVsExpenseData} options={chartOptions} />
            </div>
          </ChartWrapper>
          <ChartWrapper title="Expenses by Category" subtitle="All time breakdown">
            <div style={{ height: 280 }}>
              {chartData.categoryBreakdownData.labels.length > 0 ? (
                <Pie data={chartData.categoryBreakdownData} options={pieOptions} />
              ) : (
                <p className="text-secondary text-center" style={{ paddingTop: 80 }}>No expense data yet</p>
              )}
            </div>
          </ChartWrapper>
        </div>
      )}

      {/* Recent Transactions */}
      <div className="section-header">
        <h2 className="section-title">Recent Transactions</h2>
        {transactions.length > 0 && (
          <span className="section-link" onClick={() => navigate('/transactions')}>See All</span>
        )}
      </div>

      {recentTx.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {recentTx.map(tx => (
            <TransactionCard key={tx._id} transaction={tx} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No transactions yet"
          description="Start recording your finances to see them here"
          actionLabel="Add Transaction"
          onAction={() => navigate('/add-transaction')}
        />
      )}
    </div>
  );
};

export default Dashboard;
