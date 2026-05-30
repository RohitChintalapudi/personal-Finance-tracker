import { formatCurrency } from '../utils/formatCurrency';

const DashboardCard = ({ icon: Icon, label, amount, variant = 'primary' }) => {
  return (
    <div className={`metric-card ${variant}`}>
      <div className={`metric-icon ${variant}`}>
        <Icon size={24} />
      </div>
      <p className="metric-label">{label}</p>
      <p className="metric-value">{formatCurrency(amount)}</p>
    </div>
  );
};

export default DashboardCard;
