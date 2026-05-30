import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Moon, Sun, ChevronRight, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import InputField from '../components/InputField';
import CustomButton from '../components/CustomButton';
import ConfirmDialog from '../components/ConfirmDialog';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateProfile, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (form.name.length < 2) errs.name = 'Name must be at least 2 characters';
    if (!form.email.includes('@')) errs.email = 'Valid email is required';
    if (form.password && form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (form.password && form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const data = { name: form.name, email: form.email };
      if (form.password) data.password = form.password;
      await updateProfile(data);
      toast.success('Profile updated!');
      setIsEditing(false);
      setForm(prev => ({ ...prev, password: '', confirmPassword: '' }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div>
      <h1 className="page-title" style={{ marginBottom: 32 }}>Profile</h1>

      {/* User Card */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
        <div className="avatar">
          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        <div>
          <h2 style={{ fontWeight: 700, fontSize: '1.15rem' }}>{user?.name}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{user?.email}</p>
        </div>
      </div>

      {/* Settings */}
      {!isEditing && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 20 }}>Settings</h3>

          {/* Dark Mode */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '14px 0', borderBottom: '1px solid var(--border)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {isDark ? <Moon size={20} /> : <Sun size={20} />}
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Dark Mode</span>
            </div>
            <div className={`toggle-switch ${isDark ? 'active' : ''}`} onClick={toggleTheme} />
          </div>

          {/* Edit Profile */}
          <button
            onClick={() => setIsEditing(true)}
            style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '14px 0', width: '100%', background: 'none', border: 'none',
              cursor: 'pointer', color: 'var(--text)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <User size={20} />
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Edit Profile Details</span>
            </div>
            <ChevronRight size={18} color="var(--text-tertiary)" />
          </button>
        </div>
      )}

      {/* Edit Form */}
      {isEditing && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 20 }}>Edit Profile</h3>
          <InputField
            label="Full Name"
            icon={User}
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            error={errors.name}
          />
          <InputField
            label="Email"
            icon={Mail}
            type="email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            error={errors.email}
          />
          <InputField
            label="New Password (optional)"
            icon={Lock}
            type="password"
            placeholder="Leave blank to keep current"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            error={errors.password}
          />
          {form.password && (
            <InputField
              label="Confirm New Password"
              icon={Lock}
              type="password"
              value={form.confirmPassword}
              onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
              error={errors.confirmPassword}
            />
          )}
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <CustomButton variant="outline" className="flex-1" onClick={() => setIsEditing(false)}>
              Cancel
            </CustomButton>
            <CustomButton loading={loading} className="flex-1" onClick={handleSave}>
              Save Changes
            </CustomButton>
          </div>
        </div>
      )}

      {/* Logout */}
      <CustomButton variant="danger" className="btn-full" onClick={() => setShowLogout(true)}>
        <LogOut size={18} /> Log Out
      </CustomButton>

      <ConfirmDialog
        open={showLogout}
        title="Log Out"
        message="Are you sure you want to log out?"
        confirmLabel="Log Out"
        danger
        onConfirm={handleLogout}
        onCancel={() => setShowLogout(false)}
      />
    </div>
  );
};

export default Profile;
