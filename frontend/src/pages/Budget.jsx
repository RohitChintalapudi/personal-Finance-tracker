import { useState, useEffect } from 'react';
import { Plus, X, Pencil, Trash2, AlertTriangle, AlertCircle } from 'lucide-react';
import { useFinance } from '../contexts/FinanceContext';
import { expenseCategories, getCategoryInfo } from '../utils/categories';
import { formatCurrency, getCurrentMonth } from '../utils/formatCurrency';
import CustomButton from '../components/CustomButton';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import toast from 'react-hot-toast';

const Budget = () => {
  const { budgets, fetchBudgets, createBudget, updateBudget, deleteBudget } = useFinance();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [category, setCategory] = useState('');
  const [limit, setLimit] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => { fetchBudgets(); }, [fetchBudgets]);

  const resetForm = () => {
    setCategory('');
    setLimit('');
    setEditId(null);
    setShowForm(false);
  };

  const handleSubmit = async () => {
    if (!category || !limit || parseFloat(limit) <= 0) {
      toast.error('Please select a category and enter a valid limit');
      return;
    }
    setLoading(true);
    try {
      if (editId) {
        await updateBudget(editId, { limit: parseFloat(limit) });
        toast.success('Budget updated!');
      } else {
        await createBudget({ category, limit: parseFloat(limit), month: getCurrentMonth() });
        toast.success('Budget created!');
      }
      resetForm();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save budget');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (budget) => {
    setEditId(budget._id);
    setCategory(budget.category);
    setLimit(budget.limit.toString());
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (deleteTarget) {
      await deleteBudget(deleteTarget._id);
      setDeleteTarget(null);
      toast.success('Budget deleted');
    }
  };

  const getProgressColor = (pct) => {
    if (pct >= 85) return 'red';
    if (pct >= 60) return 'yellow';
    return 'green';
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Budget Manager</h1>
          <p className="page-subtitle">{getCurrentMonth()}</p>
        </div>
      </div>

      {/* Add Budget Card */}
      <div className="card" style={{ marginBottom: 24 }}>
        {!showForm ? (
          <button
            onClick={() => setShowForm(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 12, width: '100%',
              background: 'none', border: 'none', cursor: 'pointer', padding: 8,
              color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem',
            }}
          >
            <Plus size={20} />
            Set Category Budget
          </button>
        ) : (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontWeight: 700 }}>{editId ? 'Update Budget' : 'New Budget'}</h3>
              <button className="btn btn-ghost btn-icon" onClick={resetForm}><X size={18} /></button>
            </div>

            {!editId && (
              <>
                <label className="form-label">Category</label>
                <div className="category-grid" style={{ marginBottom: 20 }}>
                  {expenseCategories.map(cat => {
                    const Icon = cat.icon;
                    return (
                      <button
                        key={cat.id}
                        className={`category-btn ${category === cat.id ? 'selected' : ''}`}
                        onClick={() => setCategory(cat.id)}
                      >
                        <div className="category-icon-wrapper" style={{ backgroundColor: `${cat.color}15`, color: cat.color }}>
                          <Icon size={16} />
                        </div>
                        {cat.name}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            <label className="form-label">Monthly Limit (₹)</label>
            <input
              type="number"
              className="form-input no-icon"
              placeholder="e.g. 5000"
              value={limit}
              onChange={e => setLimit(e.target.value)}
              style={{ marginBottom: 20 }}
            />

            <CustomButton loading={loading} className="btn-full" onClick={handleSubmit}>
              {editId ? 'Update Limit' : 'Create Budget Boundary'}
            </CustomButton>
          </div>
        )}
      </div>

      {/* Budget Cards */}
      {budgets.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {budgets.map(budget => {
            const cat = getCategoryInfo(budget.category);
            const Icon = cat.icon;
            const pct = budget.limit > 0 ? Math.round((budget.currentSpending / budget.limit) * 100) : 0;
            const remaining = budget.limit - budget.currentSpending;
            const color = getProgressColor(pct);

            return (
              <div key={budget._id} className="card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div className="transaction-icon" style={{ backgroundColor: `${cat.color}15`, color: cat.color }}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>{budget.category}</p>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        {formatCurrency(budget.currentSpending)} of {formatCurrency(budget.limit)} spent
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn btn-ghost btn-icon" onClick={() => handleEdit(budget)}>
                      <Pencil size={15} />
                    </button>
                    <button className="btn btn-ghost btn-icon" onClick={() => setDeleteTarget(budget)} style={{ color: 'var(--expense)' }}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <div className="progress-bar-container">
                  <div className={`progress-bar-fill ${color}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  <span>{remaining >= 0 ? `${formatCurrency(remaining)} remaining` : `${formatCurrency(Math.abs(remaining))} over`}</span>
                  <span style={{ fontWeight: 700, color: color === 'red' ? 'var(--expense)' : color === 'yellow' ? 'var(--warning)' : 'var(--income)' }}>
                    {pct}%
                  </span>
                </div>

                {pct >= 100 && (
                  <div className="alert alert-danger" style={{ marginTop: 12, marginBottom: 0 }}>
                    <AlertCircle size={16} />
                    Limit Exceeded! You have spent {formatCurrency(Math.abs(remaining))} over your {budget.category} limit.
                  </div>
                )}
                {pct >= 85 && pct < 100 && (
                  <div className="alert alert-warning" style={{ marginTop: 12, marginBottom: 0 }}>
                    <AlertTriangle size={16} />
                    Warning: You've consumed {pct}% of your {budget.category} limit.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No budgets set"
          description="Create budget boundaries to track your spending by category"
          actionLabel="Set Budget"
          onAction={() => setShowForm(true)}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Budget"
        message={`Delete the budget for "${deleteTarget?.category}"?`}
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default Budget;
