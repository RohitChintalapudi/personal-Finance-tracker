import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ArrowLeftRight, PieChart, Wallet, User,
  TrendingUp, DollarSign, ChevronLeft, Sun, Moon, LogOut
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import ConfirmDialog from './ConfirmDialog';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { path: '/analytics', label: 'Analytics', icon: PieChart },
  { path: '/budget', label: 'Budget', icon: Wallet },
  { path: '/profile', label: 'Profile', icon: User },
];

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [showLogout, setShowLogout] = useState(false);

  // Pages that should show back button instead of sidebar
  const isSubPage = ['/add-transaction', '/edit-transaction', '/currency-converter', '/stock-market', '/forgot-password'].some(
    p => location.pathname.startsWith(p)
  );

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="app-layout">
      {/* Mobile Header */}
      <header className="mobile-header">
        <div className="mobile-header-brand">
          <div className="mobile-brand-icon">
            <Wallet size={18} />
          </div>
          <span>FinTrack Pro</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="mobile-theme-toggle" onClick={toggleTheme} title="Toggle Theme">
            {isDark ? <Sun size={20} color="var(--warning)" /> : <Moon size={20} />}
          </button>
          <button className="mobile-logout-btn" onClick={() => setShowLogout(true)} title="Log Out">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Sidebar - Desktop */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">
            <Wallet size={22} />
          </div>
          <div>
            <h1>FinTrack Pro</h1>
            <span>Finance Manager</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <item.icon size={20} />
              {item.label}
            </NavLink>
          ))}

          <div style={{ borderTop: '1px solid var(--border)', margin: '16px 4px', opacity: 0.5 }} />

          <NavLink to="/currency-converter" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <DollarSign size={20} />
            Currency Converter
          </NavLink>
          <NavLink to="/stock-market" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <TrendingUp size={20} />
            Stock Market
          </NavLink>
        </nav>

        {/* Sidebar Footer with Theme Toggle and User Info */}
        <div className="sidebar-footer">
          <div className="theme-toggle-row">
            <div className="theme-toggle-label">
              {isDark ? <Moon size={18} /> : <Sun size={18} />}
              <span>{isDark ? 'Dark Mode' : 'Light Mode'}</span>
            </div>
            <div className={`toggle-switch ${isDark ? 'active' : ''}`} onClick={toggleTheme} />
          </div>

          {user && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div className="sidebar-user" onClick={() => navigate('/profile')} style={{ cursor: 'pointer', flex: 1, minWidth: 0 }}>
                <div className="avatar avatar-sm">
                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="user-details">
                  <span className="user-name">{user.name}</span>
                  <span className="user-email">{user.email}</span>
                </div>
              </div>
              <button className="logout-icon-btn" onClick={() => setShowLogout(true)} title="Log Out">
                <LogOut size={18} />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {isSubPage && (
          <button className="back-btn" onClick={() => navigate(-1)} style={{ marginBottom: 20 }}>
            <ChevronLeft size={20} />
          </button>
        )}
        {children}
      </main>

      {/* Bottom Nav - Mobile */}
      <nav className="bottom-nav">
        <div className="bottom-nav-items">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
            >
              <item.icon size={22} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Global Log Out Dialog */}
      <ConfirmDialog
        open={showLogout}
        title="Log Out"
        message="Are you sure you want to log out of FinTrack Pro?"
        confirmLabel="Log Out"
        danger
        onConfirm={handleLogout}
        onCancel={() => setShowLogout(false)}
      />
    </div>
  );
};

export default Layout;
