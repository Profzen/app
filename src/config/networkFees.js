import { normalizeChainName } from './tokensByChain';

// Estimated Crossmint network fees paid in USDC per chain
export const ESTIMATED_NETWORK_FEES_USDC = {
  polygon: 0,
  base: 0,
  ethereum: 0,
  bsc: 0,
  solana: 0.01,
  default: 0,
};

export const getEstimatedNetworkFee = (chain) => {
  const c = normalizeChainName(chain);
  return ESTIMATED_NETWORK_FEES_USDC[c] ?? ESTIMATED_NETWORK_FEES_USDC.default;
};
