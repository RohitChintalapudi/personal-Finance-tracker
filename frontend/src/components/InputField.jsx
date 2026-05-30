import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const InputField = ({ label, icon: Icon, type = 'text', error, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      <div className="input-wrapper">
        {Icon && (
          <span className="input-icon">
            <Icon size={18} />
          </span>
        )}
        <input
          type={isPassword && showPassword ? 'text' : type}
          className={`form-input ${!Icon ? 'no-icon' : ''}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            className="input-toggle"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && <p className="form-error">{error}</p>}
    </div>
  );
};

export default InputField;
