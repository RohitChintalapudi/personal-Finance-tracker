import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { FinanceProvider } from './contexts/FinanceContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Pages
import SplashScreen from './pages/SplashScreen';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import AddTransaction from './pages/AddTransaction';
import Transactions from './pages/Transactions';
import Analytics from './pages/Analytics';
import Budget from './pages/Budget';
import Profile from './pages/Profile';
import CurrencyConverter from './pages/CurrencyConverter';
import StockMarket from './pages/StockMarket';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <FinanceProvider>
          <Router>
            <Toaster
              position="top-center"
              toastOptions={{
                duration: 3000,
                style: {
                  background: 'var(--card)',
                  color: 'var(--text)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                },
              }}
            />
            <Routes>
              {/* Public */}
              <Route path="/splash" element={<SplashScreen />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* Protected */}
              <Route path="/" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
              <Route path="/add-transaction" element={<ProtectedRoute><Layout><AddTransaction /></Layout></ProtectedRoute>} />
              <Route path="/edit-transaction/:id" element={<ProtectedRoute><Layout><AddTransaction /></Layout></ProtectedRoute>} />
              <Route path="/transactions" element={<ProtectedRoute><Layout><Transactions /></Layout></ProtectedRoute>} />
              <Route path="/analytics" element={<ProtectedRoute><Layout><Analytics /></Layout></ProtectedRoute>} />
              <Route path="/budget" element={<ProtectedRoute><Layout><Budget /></Layout></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
              <Route path="/currency-converter" element={<ProtectedRoute><Layout><CurrencyConverter /></Layout></ProtectedRoute>} />
              <Route path="/stock-market" element={<ProtectedRoute><Layout><StockMarket /></Layout></ProtectedRoute>} />
            </Routes>
          </Router>
        </FinanceProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
