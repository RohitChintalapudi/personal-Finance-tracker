import { useEffect, useMemo, useState } from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, ArcElement, Tooltip, Legend, Filler
} from 'chart.js';
import { Line, Pie } from 'react-chartjs-2';
import { useFinance } from '../contexts/FinanceContext';
import ChartWrapper from '../components/ChartWrapper';
import EmptyState from '../components/EmptyState';
import { BarChart2 } from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler);

const Analytics = () => {
  const { transactions, fetchTransactions, getChartData } = useFinance();
  const [filter, setFilter] = useState('monthly');

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  const chartData = useMemo(() => getChartData(), [getChartData]);

  const getFilteredData = useMemo(() => {
    const now = new Date();

    if (filter === 'weekly') {
      const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
      const income = [0, 0, 0, 0];
      const expense = [0, 0, 0, 0];

      transactions.forEach(tx => {
        const d = new Date(tx.date);
        if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
          const week = Math.min(3, Math.floor((d.getDate() - 1) / 7));
          if (tx.type === 'income') income[week] += tx.amount;
          else expense[week] += tx.amount;
        }
      });

      return {
        labels: weeks,
        income,
        expense,
        savings: income.map((v, i) => Math.max(0, v - expense[i])),
      };
    }

    if (filter === 'yearly') {
      const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
      const income = [0, 0, 0, 0];
      const expense = [0, 0, 0, 0];

      transactions.forEach(tx => {
        const d = new Date(tx.date);
        if (d.getFullYear() === now.getFullYear()) {
          const q = Math.floor(d.getMonth() / 3);
          if (tx.type === 'income') income[q] += tx.amount;
          else expense[q] += tx.amount;
        }
      });

      return {
        labels: quarters,
        income,
        expense,
        savings: income.map((v, i) => Math.max(0, v - expense[i])),
      };
    }

    // monthly (default) — use past 6 months
    return {
      labels: chartData.cashFlowData.labels,
      income: chartData.cashFlowData.datasets[0].data,
      expense: chartData.cashFlowData.datasets[1].data,
      savings: chartData.savingsData.datasets[0].data,
    };
  }, [filter, transactions, chartData]);

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { padding: 20, usePointStyle: true, font: { size: 12, weight: 600 } } },
      tooltip: { callbacks: { label: ctx => ` ${ctx.dataset.label}: ${formatCurrency(ctx.parsed.y)}` } },
    },
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { callback: v => '₹' + v.toLocaleString('en-IN'), font: { size: 11 } } },
      x: { grid: { display: false }, ticks: { font: { size: 12, weight: 600 } } },
    },
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { padding: 16, usePointStyle: true, font: { size: 12, weight: 600 } } },
      tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${formatCurrency(ctx.parsed)}` } },
    },
  };

  if (transactions.length === 0) {
    return (
      <div>
        <h1 className="page-title" style={{ marginBottom: 32 }}>Analytics</h1>
        <EmptyState
          icon={BarChart2}
          title="No Data Available"
          description="Add some transactions to see your financial analytics"
        />
      </div>
    );
  }

  const cashFlowLineData = {
    labels: getFilteredData.labels,
    datasets: [
      { label: 'Income', data: getFilteredData.income, borderColor: '#10B981', backgroundColor: 'rgba(16,185,129,0.1)', fill: true, tension: 0.4, pointRadius: 5, pointBackgroundColor: '#10B981' },
      { label: 'Expense', data: getFilteredData.expense, borderColor: '#EF4444', backgroundColor: 'rgba(239,68,68,0.1)', fill: true, tension: 0.4, pointRadius: 5, pointBackgroundColor: '#EF4444' },
    ],
  };

  const savingsLineData = {
    labels: getFilteredData.labels,
    datasets: [{
      label: 'Savings', data: getFilteredData.savings, borderColor: '#6366F1', backgroundColor: 'rgba(99,102,241,0.1)', fill: true, tension: 0.4, pointRadius: 5, pointBackgroundColor: '#6366F1',
    }],
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Analytics</h1>
        <div className="segmented-control">
          {['weekly', 'monthly', 'yearly'].map(f => (
            <button
              key={f}
              className={`segment-btn ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <ChartWrapper title="Cash Flow" subtitle={`${filter.charAt(0).toUpperCase() + filter.slice(1)} income vs expense`}>
        <div style={{ height: 300 }}>
          <Line data={cashFlowLineData} options={lineOptions} />
        </div>
      </ChartWrapper>

      <ChartWrapper title="Savings Trend" subtitle="Net savings over time">
        <div style={{ height: 300 }}>
          <Line data={savingsLineData} options={lineOptions} />
        </div>
      </ChartWrapper>

      <ChartWrapper title="Expense Breakdown" subtitle="Spending by category">
        <div style={{ height: 320 }}>
          <Pie data={chartData.categoryBreakdownData} options={pieOptions} />
        </div>
      </ChartWrapper>
    </div>
  );
};

export default Analytics;
