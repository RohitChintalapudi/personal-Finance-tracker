import { useState, useEffect } from 'react';
import { ArrowRightLeft, RefreshCw, DollarSign } from 'lucide-react';
import CustomButton from '../components/CustomButton';

const CURRENCIES = ['USD', 'INR', 'EUR', 'GBP', 'AUD', 'CAD', 'JPY', 'SGD', 'AED'];

const FALLBACK_RATES = {
  USD: 1.0, INR: 83.5, EUR: 0.92, GBP: 0.78,
  AUD: 1.51, CAD: 1.37, JPY: 156.8, SGD: 1.35, AED: 3.67,
};

const SYMBOLS = {
  USD: '$', INR: '₹', EUR: '€', GBP: '£', JPY: '¥',
  AUD: 'A$', CAD: 'C$', SGD: 'S$', AED: 'د.إ',
};

const CurrencyConverter = () => {
  const [amount, setAmount] = useState('1');
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('INR');
  const [rates, setRates] = useState(FALLBACK_RATES);
  const [lastUpdated, setLastUpdated] = useState('Using offline rates');
  const [loading, setLoading] = useState(false);

  const fetchRates = async () => {
    setLoading(true);
    try {
      const apiKey = import.meta.env.VITE_EXCHANGE_RATE_API_KEY;
      if (!apiKey) throw new Error('No API key');
      const res = await fetch(`https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`);
      const data = await res.json();
      if (data.result === 'success') {
        const filtered = {};
        CURRENCIES.forEach(c => { filtered[c] = data.conversion_rates[c] || FALLBACK_RATES[c]; });
        setRates(filtered);
        setLastUpdated(new Date(data.time_last_update_utc).toLocaleString());
      } else throw new Error('API failed');
    } catch {
      setRates(FALLBACK_RATES);
      setLastUpdated('Using offline rates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRates(); }, []);

  const convert = () => {
    const amt = parseFloat(amount) || 0;
    const fromRate = rates[from] || 1;
    const toRate = rates[to] || 1;
    return (amt / fromRate) * toRate;
  };

  const swap = () => {
    setFrom(to);
    setTo(from);
  };

  const result = convert();

  return (
    <div>
      <h1 className="page-title" style={{ marginBottom: 32 }}>Currency Converter</h1>

      <div className="card" style={{ marginBottom: 24 }}>
        {/* Amount */}
        <label className="form-label">Amount</label>
        <div className="input-wrapper" style={{ marginBottom: 24 }}>
          <span className="input-icon"><DollarSign size={18} /></span>
          <input
            type="number"
            className="form-input"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            min="0"
            step="0.01"
          />
        </div>

        {/* From / Swap / To */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', marginBottom: 24 }}>
          <div style={{ flex: 1 }}>
            <label className="form-label">From</label>
            <select
              className="form-input no-icon"
              value={from}
              onChange={e => setFrom(e.target.value)}
            >
              {CURRENCIES.map(c => <option key={c} value={c}>{c} ({SYMBOLS[c]})</option>)}
            </select>
          </div>

          <button
            className="btn btn-outline btn-icon"
            onClick={swap}
            style={{ marginBottom: 2 }}
            title="Swap currencies"
          >
            <ArrowRightLeft size={18} />
          </button>

          <div style={{ flex: 1 }}>
            <label className="form-label">To</label>
            <select
              className="form-input no-icon"
              value={to}
              onChange={e => setTo(e.target.value)}
            >
              {CURRENCIES.map(c => <option key={c} value={c}>{c} ({SYMBOLS[c]})</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Result */}
      <div className="card converter-result" style={{ marginBottom: 24 }}>
        <p className="converter-result-label">
          {parseFloat(amount) || 0} {from} =
        </p>
        <p className="converter-result-value">
          {SYMBOLS[to]}{result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {to}
        </p>
        <p className="converter-result-timestamp">
          Rates provided: {lastUpdated}
        </p>
      </div>

      <CustomButton variant="outline" className="btn-full" onClick={fetchRates} loading={loading}>
        <RefreshCw size={16} /> Refresh Live Rates
      </CustomButton>
    </div>
  );
};

export default CurrencyConverter;
