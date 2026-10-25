export const TOKENS_BY_CHAIN = {
  polygon: ['USDC', 'USDT', 'POL', 'WPOL', 'WBTC', 'WETH', 'DAI'],
  ethereum: ['USDC', 'USDT', 'EURC', 'ETH', 'WBTC', 'WETH', 'DAI', 'POL'],
  base: ['USDC', 'EURC', 'ETH', 'WETH', 'DAI'],
  bsc: ['BNB', 'USDC', 'USDT', 'DAI'],
  solana: ['USDC', 'USDT', 'EURC', 'SOL'],
};

export const WEB_DEFAULT_TOKENS = [
  { symbol: "DZY", name: "DIZZITUP INDEX", chain: "polygon" },

  // USDT
  { symbol: "USDT", name: "Tether USD", chain: "polygon" },
  { symbol: "USDT", name: "Tether USD", chain: "ethereum" },
  { symbol: "USDT", name: "Tether USD", chain: "solana" },
  { symbol: "USDT", name: "Tether USD", chain: "bsc" },

  // USDC
  { symbol: "USDC", name: "USD Coin", chain: "polygon" },
  { symbol: "USDC.e", name: "Bridged USD Coin", chain: "polygon" },
  { symbol: "USDC", name: "USD Coin", chain: "ethereum" },
  { symbol: "USDC", name: "USD Coin", chain: "base" },
  { symbol: "USDC", name: "USD Coin", chain: "solana" },
  { symbol: "USDC", name: "USD Coin", chain: "bsc" },

  // EURC
  { symbol: "EURC", name: "Euro Coin", chain: "ethereum" },
  { symbol: "EURC", name: "Euro Coin", chain: "base" },
  { symbol: "EURC", name: "Euro Coin", chain: "solana" },

  // POL
  { symbol: "POL", name: "Polygon (POL)", chain: "polygon" },
  { symbol: "POL", name: "POL (Ethereum)", chain: "ethereum" },
  { symbol: "WPOL", name: "Wrapped POL", chain: "polygon" },

  // BNB
  { symbol: "BNB", name: "BNB", chain: "bsc" },

  // DAI
  { symbol: "DAI", name: "Dai Stablecoin", chain: "polygon" },
  { symbol: "DAI", name: "Dai Stablecoin", chain: "ethereum" },
  { symbol: "DAI", name: "Dai Stablecoin", chain: "bsc" },
  { symbol: "DAI", name: "Dai Stablecoin", chain: "base" },

  // ETH
  { symbol: "ETH", name: "Ethereum", chain: "ethereum" },
  { symbol: "ETH", name: "Ethereum", chain: "base" },

  // SOL
  { symbol: "SOL", name: "Solana", chain: "solana" },

  // WBTC
  { symbol: "WBTC", name: "Wrapped Bitcoin", chain: "polygon" },
  { symbol: "WBTC", name: "Wrapped Bitcoin", chain: "ethereum" },

  // WETH
  { symbol: "WETH", name: "Wrapped Ethereum", chain: "polygon" },
  { symbol: "WETH", name: "Wrapped Ethereum", chain: "ethereum" },
  { symbol: "WETH", name: "Wrapped Ethereum", chain: "base" },
];

/**
 * Normalizes a blockchain identifier into canonical form (e.g., 'bnbchain' / 'bnb' -> 'bsc').
 * Strips whitespace, converts to lowercase, and validates input. Returns null if missing or invalid.
 */
export const normalizeChainName = (chain) => {
  if (!chain || typeof chain !== 'string') return null;
  const clean = chain.toLowerCase().trim().replace(/\s+/g, '');
  if (!clean) return null;
  if (clean === 'bnbchain' || clean === 'bnb' || clean === 'binancesmartchain' || clean === 'binance') {
    return 'bsc';
  }
  if (clean === 'matic') return 'polygon';
  if (clean === 'eth' || clean === 'mainnet') return 'ethereum';
  if (clean === 'sol') return 'solana';
  return clean;
};
