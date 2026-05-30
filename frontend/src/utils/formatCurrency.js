export const formatCurrency = (amount, currencyCode = 'INR') => {
  const num = Number(amount) || 0;
  
  if (currencyCode === 'INR') {
    const formatted = Math.abs(num).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `${num < 0 ? '-' : ''}₹${formatted}`;
  }
  
  const symbols = {
    USD: '$', EUR: '€', GBP: '£', JPY: '¥',
    AUD: 'A$', CAD: 'C$', SGD: 'S$', AED: 'د.إ',
  };
  
  const symbol = symbols[currencyCode] || currencyCode;
  const formatted = Math.abs(num).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${num < 0 ? '-' : ''}${symbol}${formatted}`;
};

export const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};

export const getMonthLabel = (date) => {
  return date.toLocaleDateString('en-US', { month: 'short' });
};

export const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};
