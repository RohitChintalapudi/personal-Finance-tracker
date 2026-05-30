import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Wallet, Mail, Lock, AlertCircle, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import InputField from '../components/InputField';
import CustomButton from '../components/CustomButton';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: localStorage.getItem('fintrack_remember_email') || '', password: '' });
  const [remember, setRemember] = useState(!!localStorage.getItem('fintrack_remember_email'));
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Valid email is required';
    if (!form.password || form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setApiError('');
    try {
      await login(form.email, form.password);
      if (remember) localStorage.setItem('fintrack_remember_email', form.email);
      else localStorage.removeItem('fintrack_remember_email');
      navigate('/', { replace: true });
    } catch (err) {
      setApiError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">
          <Wallet size={28} />
        </div>
        <h2 className="auth-title">Welcome Back</h2>
        <p className="auth-subtitle">Log in to continue managing your funds</p>

        {apiError && (
          <div className="error-banner">
            <AlertCircle size={18} />
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <InputField
            label="Email"
            icon={Mail}
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            error={errors.email}
          />
          <InputField
            label="Password"
            icon={Lock}
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            error={errors.password}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div className="checkbox-wrapper" onClick={() => setRemember(!remember)}>
              <div className={`checkbox ${remember ? 'checked' : ''}`}>
                {remember && <Check size={12} />}
              </div>
              <span className="checkbox-label">Remember me</span>
            </div>
            <Link to="/forgot-password" style={{ fontSize: '0.82rem', fontWeight: 600 }}>
              Forgot Password?
            </Link>
          </div>

          <CustomButton type="submit" loading={loading} className="btn-full btn-lg">
            Log In
          </CustomButton>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
