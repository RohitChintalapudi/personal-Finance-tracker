import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { useFinance } from '../contexts/FinanceContext';
import { incomeCategories, expenseCategories } from '../utils/categories';
import CustomButton from '../components/CustomButton';
import toast from 'react-hot-toast';

const AddTransaction = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { id } = useParams();
  const { transactions, createTransaction, updateTransaction } = useFinance();

  const isEdit = !!id;
  const editTx = isEdit ? transactions.find(t => t._id === id) : null;

  const [type, setType] = useState(searchParams.get('type') || editTx?.type || 'income');
  const [amount, setAmount] = useState(editTx?.amount?.toString() || '');
  const [category, setCategory] = useState(editTx?.category || '');
  const [dateOption, setDateOption] = useState('today');
  const [customDate, setCustomDate] = useState('');
  const [notes, setNotes] = useState(editTx?.notes || '');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editTx) {
      setType(editTx.type);
      setAmount(editTx.amount.toString());
      setCategory(editTx.category);
      setNotes(editTx.notes || '');
      setDateOption('custom');
      setCustomDate(new Date(editTx.date).toISOString().split('T')[0]);
    }
  }, [editTx]);

  const categories = type === 'income' ? incomeCategories : expenseCategories;

  const getDate = () => {
    if (dateOption === 'today') return new Date().toISOString();
    if (dateOption === 'yesterday') {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      return d.toISOString();
    }
    return new Date(customDate).toISOString();
  };

  const handleSubmit = async () => {
    const errs = {};
    if (!amount || parseFloat(amount) <= 0) errs.amount = 'Amount must be greater than 0';
    if (!category) errs.category = 'Please select a category';
    if (dateOption === 'custom' && !customDate) errs.date = 'Please select a date';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      const txData = {
        type,
        amount: parseFloat(amount),
        category,
        notes,
        date: getDate(),
      };

      if (isEdit) {
        await updateTransaction(id, txData);
        toast.success('Transaction updated!');
      } else {
        await createTransaction(txData);
        toast.success('Transaction saved!');
      }
      navigate(-1);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="page-title" style={{ marginBottom: 28 }}>
        {isEdit ? 'Edit Transaction' : 'New Transaction'}
      </h1>

      {/* Type Selector */}
      <div className="segmented-control" style={{ marginBottom: 24, width: '100%', display: 'flex' }}>
        <button
          className={`segment-btn ${type === 'income' ? 'income-active' : ''}`}
          style={{ flex: 1 }}
          onClick={() => { setType('income'); setCategory(''); }}
        >
          Income
        </button>
        <button
          className={`segment-btn ${type === 'expense' ? 'expense-active' : ''}`}
          style={{ flex: 1 }}
          onClick={() => { setType('expense'); setCategory(''); }}
        >
          Expense
        </button>
      </div>

      {/* Amount */}
      <div className="card" style={{ marginBottom: 20 }}>
        <label className="form-label">Amount</label>
        <div className="amount-input-card" style={{ border: 'none', padding: '16px 0', boxShadow: 'none' }}>
          <span className="amount-currency">₹</span>
          <input
            type="number"
            className="amount-input"
            placeholder="0.00"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            min="0.01"
            step="0.01"
          />
        </div>
        {errors.amount && <p className="form-error">{errors.amount}</p>}
      </div>

      {/* Category */}
      <div className="card" style={{ marginBottom: 20 }}>
        <label className="form-label">Category</label>
        <div className="category-grid" style={{ marginTop: 8 }}>
          {categories.map(cat => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                className={`category-btn ${category === cat.id ? 'selected' : ''}`}
                onClick={() => setCategory(cat.id)}
              >
                <div className="category-icon-wrapper" style={{ backgroundColor: `${cat.color}15`, color: cat.color }}>
                  <Icon size={18} />
                </div>
                {cat.name}
              </button>
            );
          })}
        </div>
        {errors.category && <p className="form-error">{errors.category}</p>}
      </div>

      {/* Date */}
      <div className="card" style={{ marginBottom: 20 }}>
        <label className="form-label">Date</label>
        <div className="date-presets">
          {['today', 'yesterday', 'custom'].map(opt => (
            <button
              key={opt}
              className={`pill ${dateOption === opt ? 'active' : ''}`}
              onClick={() => setDateOption(opt)}
            >
              {opt.charAt(0).toUpperCase() + opt.slice(1)}
            </button>
          ))}
        </div>
        {dateOption === 'custom' && (
          <input
            type="date"
            className="form-input no-icon"
            value={customDate}
            onChange={e => setCustomDate(e.target.value)}
            style={{ marginTop: 8 }}
          />
        )}
        {errors.date && <p className="form-error">{errors.date}</p>}
      </div>

      {/* Notes */}
      <div className="card" style={{ marginBottom: 28 }}>
        <label className="form-label">Notes (optional)</label>
        <div className="input-wrapper">
          <span className="input-icon"><FileText size={18} /></span>
          <input
            type="text"
            className="form-input"
            placeholder="Add a note..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        </div>
      </div>

      {/* Submit */}
      <CustomButton
        loading={loading}
        className="btn-full btn-lg"
        onClick={handleSubmit}
      >
        {isEdit ? 'Update Transaction' : 'Save Transaction'}
      </CustomButton>
    </div>
  );
};

export default AddTransaction;
