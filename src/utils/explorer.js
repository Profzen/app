/**
 * Utility functions for blockchain transaction explorers and hash validation.
 */

export const isOnChainHash = (hash, chain) => {
  if (!hash || typeof hash !== 'string') return false;
  const trimmed = hash.trim();
  if (!trimmed) return false;

  // EVM transaction hashes: starts with '0x' and hex characters
  if (trimmed.startsWith('0x') && trimmed.length >= 10) {
    return true;
  }

  // Solana transaction signatures: base58 string without hyphens, length >= 32
  const c = String(chain || '').toLowerCase();
  if ((c.includes('solana') || c.includes('sol')) && !trimmed.includes('-') && trimmed.length >= 32) {
    return true;
  }

  return false;
};

export const getExplorerTxUrl = (chain, hash) => {
  if (!hash || typeof hash !== 'string') return null;
  const h = hash.trim();
  if (!h) return null;

  const c = String(chain || '').toLowerCase();
  if (c.includes('solana') || c.includes('sol')) {
    return `https://solscan.io/tx/${h}`;
  }
  if (c.includes('base')) {
    return `https://basescan.org/tx/${h}`;
  }
  if (c.includes('bsc') || c.includes('binance')) {
    return `https://bscscan.com/tx/${h}`;
  }
  if (c.includes('eth') || c.includes('ethereum') || c.includes('mainnet')) {
    return `https://etherscan.io/tx/${h}`;
  }
  // Default to Polygon
  return `https://polygonscan.com/tx/${h}`;
};
