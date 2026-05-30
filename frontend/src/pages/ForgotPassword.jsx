import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Wallet, Mail } from 'lucide-react';
import InputField from '../components/InputField';
import CustomButton from '../components/CustomButton';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Mock — no actual backend endpoint
    setSent(true);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">
          <Wallet size={28} />
        </div>
        <h2 className="auth-title">Reset Password</h2>
        <p className="auth-subtitle">
          {sent
            ? 'If an account with that email exists, a reset link has been sent.'
            : 'Enter your email and we\'ll send a reset link'}
        </p>

        {!sent ? (
          <form onSubmit={handleSubmit}>
            <InputField
              label="Email Address"
              icon={Mail}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <CustomButton type="submit" className="btn-full btn-lg" style={{ marginTop: 8 }}>
              Send Reset Link
            </CustomButton>
          </form>
        ) : (
          <CustomButton variant="outline" className="btn-full" onClick={() => setSent(false)}>
            Try another email
          </CustomButton>
        )}

        <p className="auth-footer">
          Remember your password? <Link to="/login">Log In</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
