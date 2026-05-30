import { Pencil, Trash2 } from 'lucide-react';
import { getCategoryInfo } from '../utils/categories';
import { formatCurrency, formatDate } from '../utils/formatCurrency';

const TransactionCard = ({ transaction, onEdit, onDelete }) => {
  const cat = getCategoryInfo(transaction.category);
  const Icon = cat.icon;
  const isIncome = transaction.type === 'income';

  return (
    <div className="transaction-card">
      <div
        className="transaction-icon"
        style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
      >
        <Icon size={20} />
      </div>

      <div className="transaction-info">
        <p className="transaction-category">{transaction.category}</p>
        <p className="transaction-notes">
          {transaction.notes || (isIncome ? 'Income' : 'Expense')}
        </p>
      </div>

      <div className="transaction-right">
        <p className={`transaction-amount ${transaction.type}`}>
          {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
        </p>
        <p className="transaction-date">{formatDate(transaction.date)}</p>
      </div>

      {(onEdit || onDelete) && (
        <div className="transaction-actions">
          {onEdit && (
            <button className="btn btn-ghost btn-icon" onClick={() => onEdit(transaction)}>
              <Pencil size={15} />
            </button>
          )}
          {onDelete && (
            <button className="btn btn-ghost btn-icon" onClick={() => onDelete(transaction)} style={{ color: 'var(--expense)' }}>
              <Trash2 size={15} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TransactionCard;
