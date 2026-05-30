import { useState, useEffect, useMemo } from 'react';
import { Search, Star } from 'lucide-react';

const STOCKS = [
  { symbol: 'AAPL', name: 'Apple Inc.', base: 189.84 },
  { symbol: 'TSLA', name: 'Tesla Inc.', base: 179.24 },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', base: 948.21 },
  { symbol: 'MSFT', name: 'Microsoft Corporation', base: 429.17 },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', base: 173.96 },
  { symbol: 'AMZN', name: 'Amazon.com, Inc.', base: 180.75 },
  { symbol: 'NFLX', name: 'Netflix, Inc.', base: 645.10 },
  { symbol: 'BTC', name: 'Bitcoin (USD)', base: 68420.50 },
  { symbol: 'ETH', name: 'Ethereum (USD)', base: 3824.12 },
  { symbol: 'COIN', name: 'Coinbase Global, Inc.', base: 224.50 },
];

// Generate simulated price data
const generateSparkline = (base, symbol) => {
  const seed = symbol.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const points = [];
  for (let i = 0; i < 7; i++) {
    const variation = Math.cos(seed * 0.1 + i * 0.7) * base * 0.03;
    points.push(base + variation);
  }
  return points;
};

const getSimulatedPrice = (base, symbol) => {
  const now = Date.now();
  const seed = symbol.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const variation = Math.sin(now * 0.00001 + seed) * base * 0.025;
  return base + variation;
};

// Mini sparkline canvas
const Sparkline = ({ data, color, width = 80, height = 30 }) => {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} style={{ flexShrink: 0 }}>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
};

const StockMarket = () => {
  const [tab, setTab] = useState('watchlist');
  const [search, setSearch] = useState('');
  const [watchlist, setWatchlist] = useState(() => {
    const stored = localStorage.getItem('fintrack_watchlist');
    return stored ? JSON.parse(stored) : ['AAPL', 'TSLA', 'BTC'];
  });
  const [prices, setPrices] = useState({});

  useEffect(() => {
    // Simulate price updates
    const update = () => {
      const newPrices = {};
      STOCKS.forEach(s => {
        const price = getSimulatedPrice(s.base, s.symbol);
        const change = ((price - s.base) / s.base) * 100;
        newPrices[s.symbol] = { price, change, sparkline: generateSparkline(s.base, s.symbol) };
      });
      setPrices(newPrices);
    };
    update();
    const interval = setInterval(update, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    localStorage.setItem('fintrack_watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  const toggleWatchlist = (symbol) => {
    setWatchlist(prev =>
      prev.includes(symbol) ? prev.filter(s => s !== symbol) : [...prev, symbol]
    );
  };

  const displayStocks = useMemo(() => {
    let list = tab === 'watchlist'
      ? STOCKS.filter(s => watchlist.includes(s.symbol))
      : STOCKS;

    if (search) {
      const q = search.toUpperCase();
      list = list.filter(s => s.symbol.includes(q) || s.name.toUpperCase().includes(q));
    }

    return list;
  }, [tab, search, watchlist]);

  return (
    <div>
      <h1 className="page-title" style={{ marginBottom: 24 }}>Stock Market</h1>

      {/* Search */}
      <div className="input-wrapper" style={{ marginBottom: 16 }}>
        <span className="input-icon"><Search size={18} /></span>
        <input
          type="text"
          className="form-input"
          placeholder="Search stocks (e.g. AAPL, TSLA)"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ textTransform: 'uppercase' }}
        />
      </div>

      {/* Tabs */}
      <div className="segmented-control" style={{ marginBottom: 24 }}>
        <button className={`segment-btn ${tab === 'watchlist' ? 'active' : ''}`} onClick={() => setTab('watchlist')}>
          My Watchlist
        </button>
        <button className={`segment-btn ${tab === 'all' ? 'active' : ''}`} onClick={() => setTab('all')}>
          All Indices
        </button>
      </div>

      {/* Stock List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {displayStocks.map(stock => {
          const data = prices[stock.symbol] || { price: stock.base, change: 0, sparkline: [] };
          const isPositive = data.change >= 0;

          return (
            <div key={stock.symbol} className="stock-card">
              <div className="stock-info">
                <p className="stock-symbol">{stock.symbol}</p>
                <p className="stock-name">{stock.name}</p>
              </div>

              {data.sparkline.length > 0 && (
                <Sparkline
                  data={data.sparkline}
                  color={isPositive ? '#10B981' : '#EF4444'}
                />
              )}

              <div style={{ textAlign: 'right', minWidth: 80 }}>
                <p className="stock-price">
                  ${data.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <span className={`stock-change ${isPositive ? 'positive' : 'negative'}`}>
                  {isPositive ? '+' : ''}{data.change.toFixed(2)}%
                </span>
              </div>

              <button
                onClick={() => toggleWatchlist(stock.symbol)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
              >
                <Star
                  size={20}
                  fill={watchlist.includes(stock.symbol) ? '#F59E0B' : 'none'}
                  color={watchlist.includes(stock.symbol) ? '#F59E0B' : 'var(--text-tertiary)'}
                />
              </button>
            </div>
          );
        })}

        {displayStocks.length === 0 && (
          <div className="empty-state" style={{ padding: '40px 0' }}>
            <p className="empty-state-title">No stocks found</p>
            <p className="empty-state-desc">
              {tab === 'watchlist' ? 'Add stocks to your watchlist from the "All Indices" tab' : 'Try a different search term'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockMarket;
