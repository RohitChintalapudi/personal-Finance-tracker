import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Plus } from 'lucide-react';
import { useFinance } from '../contexts/FinanceContext';
import { incomeCategories, expenseCategories, allCategories } from '../utils/categories';
import TransactionCard from '../components/TransactionCard';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';
import { SkeletonCards } from '../components/LoadingSpinner';
import CustomButton from '../components/CustomButton';

const sortOptions = [
  { id: 'date_desc', label: 'Latest Date' },
  { id: 'date_asc', label: 'Oldest Date' },
  { id: 'amount_desc', label: 'Highest Amount' },
  { id: 'amount_asc', label: 'Lowest Amount' },
];

const Transactions = () => {
  const navigate = useNavigate();
  const { transactions, loading, fetchTransactions, deleteTransaction } = useFinance();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sort, setSort] = useState('date_desc');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [searchApplied, setSearchApplied] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const filteredCategories = useMemo(() => {
    if (typeFilter === 'income') return incomeCategories;
    if (typeFilter === 'expense') return expenseCategories;
    return allCategories;
  }, [typeFilter]);

  const filtered = useMemo(() => {
    let list = [...transactions];

    if (typeFilter !== 'all') list = list.filter(t => t.type === typeFilter);
    if (categoryFilter !== 'all') list = list.filter(t => t.category === categoryFilter);
    if (searchApplied) {
      const q = searchApplied.toLowerCase();
      list = list.filter(t =>
        t.category.toLowerCase().includes(q) ||
        (t.notes && t.notes.toLowerCase().includes(q))
      );
    }

    list.sort((a, b) => {
      switch (sort) {
        case 'date_asc': return new Date(a.date) - new Date(b.date);
        case 'amount_desc': return b.amount - a.amount;
        case 'amount_asc': return a.amount - b.amount;
        default: return new Date(b.date) - new Date(a.date);
      }
    });

    return list;
  }, [transactions, typeFilter, categoryFilter, sort, searchApplied]);

  const handleDelete = async () => {
    if (deleteTarget) {
      await deleteTransaction(deleteTarget._id);
      setDeleteTarget(null);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">All Transactions</h1>
          <p className="page-subtitle">{filtered.length} transactions found</p>
        </div>
        <CustomButton onClick={() => navigate('/add-transaction')}>
          <Plus size={18} /> Add New
        </CustomButton>
      </div>

      {/* Search Bar */}
      <div className="input-wrapper" style={{ marginBottom: 16 }}>
        <span className="input-icon"><Search size={18} /></span>
        <input
          type="text"
          className="form-input"
          placeholder="Search transactions..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && setSearchApplied(search)}
        />
        {search && (
          <button className="input-toggle" onClick={() => { setSearch(''); setSearchApplied(''); }}>
            <X size={18} />
          </button>
        )}
      </div>

      {/* Type Filter */}
      <div className="segmented-control" style={{ marginBottom: 16 }}>
        {['all', 'income', 'expense'].map(t => (
          <button
            key={t}
            className={`segment-btn ${typeFilter === t ? 'active' : ''}`}
            onClick={() => { setTypeFilter(t); setCategoryFilter('all'); }}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Category Pills */}
      <div className="pills-scroll" style={{ marginBottom: 16 }}>
        <button
          className={`pill ${categoryFilter === 'all' ? 'active' : ''}`}
          onClick={() => setCategoryFilter('all')}
        >
          All Categories
        </button>
        {filteredCategories.map(cat => (
          <button
            key={cat.id}
            className={`pill ${categoryFilter === cat.id ? 'active' : ''}`}
            onClick={() => setCategoryFilter(cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Sort */}
      <div className="pills-scroll" style={{ marginBottom: 24 }}>
        {sortOptions.map(s => (
          <button
            key={s.id}
            className={`pill ${sort === s.id ? 'active' : ''}`}
            onClick={() => setSort(s.id)}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <SkeletonCards count={5} />
      ) : filtered.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(tx => (
            <TransactionCard
              key={tx._id}
              transaction={tx}
              onEdit={(t) => navigate(`/edit-transaction/${t._id}`)}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No transactions found"
          description="Try adjusting your search or filters"
          actionLabel="Add Transaction"
          onAction={() => navigate('/add-transaction')}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Transaction"
        message={`Are you sure you want to delete this ${deleteTarget?.type} of ₹${deleteTarget?.amount}?`}
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default Transactions;
