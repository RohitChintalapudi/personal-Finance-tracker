import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const SplashScreen = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      navigate(user ? '/' : '/login', { replace: true });
    }, 1800);
    return () => clearTimeout(timer);
  }, [user, loading, navigate]);

  if (!show) return null;

  return (
    <div className="splash-screen">
      <div className="splash-logo">
        <Wallet size={40} />
      </div>
      <h1 className="splash-title">FinTrack Pro</h1>
      <p className="splash-subtitle">Your personal finance manager</p>
      <div className="spinner spinner-dark" style={{ marginTop: 32 }} />
    </div>
  );
};

export default SplashScreen;
