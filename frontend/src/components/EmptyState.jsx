import { Inbox } from 'lucide-react';
import CustomButton from './CustomButton';

const EmptyState = ({ icon: Icon = Inbox, title, description, actionLabel, onAction }) => {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <Icon size={36} />
      </div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-desc">{description}</p>
      {actionLabel && onAction && (
        <CustomButton onClick={onAction}>{actionLabel}</CustomButton>
      )}
    </div>
  );
};

export default EmptyState;
