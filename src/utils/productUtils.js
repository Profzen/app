/**
 * Utility functions for product offering types and escrow rules.
 * Physical goods use escrow, PIN, delivery confirmations, and warnings.
 * Services, tickets, and digital products use direct fulfillment (no escrow, no PIN, no physical notices).
 */

export function isPhysicalItem(item) {
  if (!item) return true;
  const offeringType = item.offering_type || item.product?.offering_type;
  const escrowPolicy = item.escrow_policy || item.product?.escrow_policy;
  return (offeringType || 'physical_good') === 'physical_good' || escrowPolicy === 'physical_delivery';
}

export function isPhysicalCart(items) {
  if (!items || !items.length) return true;
  return items.some(isPhysicalItem);
}

/**
 * Check whether a product is a festival or event ticket.
 * Rule: category contains "event" or "ticket" (case-insensitive) or metadata.kind === 'ticket'.
 */
export function isTicketProduct(product) {
  if (!product) return false;
  const categoryStr = String(
    product.category ||
    product.category_name ||
    product.category_title ||
    (Array.isArray(product.categories) ? product.categories.map(c => c?.name || c?.title || c).join(' ') : '') ||
    ''
  ).toLowerCase();
  const kind = product.metadata?.kind;
  const offeringType = product.offering_type || product.type;
  return categoryStr.includes('event') || categoryStr.includes('ticket') || kind === 'ticket' || offeringType === 'ticket';
}

/**
 * Build the web URL for a product to open in the browser.
 * Uses EXPO_PUBLIC_BUY_GOODS_URL if present, otherwise falls back to https://dizzitup.com.
 */
export function getWebProductUrl(productId) {
  const envUrl = process.env.EXPO_PUBLIC_BUY_GOODS_URL;
  const baseUrl = (envUrl && typeof envUrl === 'string' && envUrl.trim())
    ? envUrl.trim().replace(/\/+$/, '')
    : 'https://dizzitup.com';
  return `${baseUrl}/product/${productId}`;
}
