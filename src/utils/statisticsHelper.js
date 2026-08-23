/**
 * Analyzes an array of transactions and returns aggregated statistics for a specific currency.
 * Useful for building NeoBank/Exchange style analytics dashboards.
 * 
 * @param {Array} transactions - The raw transactions array from AppContext
 * @param {String} targetCurrency - The currency to filter by (e.g., 'DZY', 'USDT', 'EURC')
 * @param {Function} t - The i18n translation function
 * @returns {Object} Aggregated stats (totalIn, totalOut, typeBreakdown)
 */
export const calculateTransactionStats = (transactions, targetCurrency = 'DZY', t) => {
  if (!transactions || transactions.length === 0) {
    return {
      totalIn: 0,
      totalOut: 0,
      currency: targetCurrency,
      categories: [],
      maxCategoryValue: 0
    };
  }

  let totalIn = 0;
  let totalOut = 0;
  
  // Categorize outgoing spending
  const typeMap = {};

  transactions.forEach(tx => {
    // Determine the currency of this transaction
    let txCurrency = 'DZY'; // Default fallback
    
    // Check possible currency fields from the backend
    if (tx.currency) txCurrency = tx.currency.toUpperCase();
    else if (tx.token) txCurrency = tx.token.toUpperCase();
    else if (tx.symbol) txCurrency = tx.symbol.toUpperCase();
    else if (tx.asset) txCurrency = tx.asset.toUpperCase();

    // Only process transactions matching the target currency
    if (txCurrency !== targetCurrency.toUpperCase()) return;

    // Parse amount
    const amount = parseFloat(tx.amount || tx.amount_dzy || tx.value || 0);
    if (isNaN(amount) || amount <= 0) return;

    // Determine direction and type
    const tType = (tx.type || tx.transaction_type || '').toUpperCase();
    
    // Categories for "In" (Received)
    if (tType === 'RECEIVE' || tType === 'TOP_UP' || tType === 'TOP-UP' || tType === 'IN') {
      totalIn += amount;
    } 
    // Categories for "Out" (Spent/Sent)
    else {
      totalOut += amount;
      
      // Group by user-friendly category names
      let categoryName = t ? t('stats.category.other', 'Other') : 'Other';
      let icon = 'ellipsis-horizontal-circle-outline';
      let color = '#9CA3AF';
      let bgColor = '#F3F4F6';

      if (tType === 'SEND' || tType === 'OUT' || tType === 'TRANSFER') {
        categoryName = t ? t('stats.category.transfers', 'Transfers') : 'Transfers';
        icon = 'paper-plane-outline';
        color = '#3B82F6';
        bgColor = '#EFF6FF';
      } else if (tType === 'BUY' || tType === 'BUY_GOODS' || tType === 'SALE') {
        categoryName = t ? t('stats.category.shopping', 'Shopping') : 'Shopping';
        icon = 'bag-handle-outline';
        color = '#F59E0B';
        bgColor = '#FFFBEB';
      } else if (tType === 'PAY' || tType === 'PAY_BILLS') {
        categoryName = t ? t('stats.category.utilities', 'Utilities & Bills') : 'Utilities & Bills';
        icon = 'flash-outline';
        color = '#10B981';
        bgColor = '#ECFDF5';
      } else if (tType === 'SWAP') {
        categoryName = t ? t('stats.category.exchange', 'Exchange') : 'Exchange';
        icon = 'swap-horizontal-outline';
        color = '#8B5CF6';
        bgColor = '#F5F3FF';
      }

      if (!typeMap[categoryName]) {
        typeMap[categoryName] = { 
          name: categoryName, 
          value: 0, 
          icon, 
          color, 
          bgColor 
        };
      }
      typeMap[categoryName].value += amount;
    }
  });

  // Convert map to array and sort by value (highest first)
  let categories = Object.values(typeMap).sort((a, b) => b.value - a.value);
  
  // Calculate percentages
  let maxCategoryValue = 0;
  categories = categories.map(cat => {
    if (cat.value > maxCategoryValue) maxCategoryValue = cat.value;
    const percentage = totalOut > 0 ? ((cat.value / totalOut) * 100) : 0;
    return { ...cat, percentage };
  });

  return {
    totalIn,
    totalOut,
    currency: targetCurrency,
    categories,
    maxCategoryValue // Used for progress bar relative scaling
  };
};

/**
 * Extracts a unique list of all valid currencies the user has transacted in.
 * Filters out spam/airdrop tokens (e.g. WWW.BAIRDROP.CO).
 */
export const getActiveCurrencies = (transactions) => {
  if (!transactions || transactions.length === 0) return ['DZY'];
  
  const currencies = new Set();
  transactions.forEach(tx => {
    let curr = '';
    if (tx.currency) curr = tx.currency.toUpperCase();
    else if (tx.token) curr = tx.token.toUpperCase();
    else if (tx.symbol) curr = tx.symbol.toUpperCase();
    else if (tx.asset) curr = tx.asset.toUpperCase();
    
    // Filter out obvious spam tokens (URLs, long strings, weird characters)
    if (curr && curr.length <= 8 && !curr.includes('.') && !curr.includes('WWW') && !curr.includes('HTTP')) {
      currencies.add(curr);
    }
  });

  const arr = Array.from(currencies);
  if (arr.length === 0) return ['DZY'];
  return arr;
};
