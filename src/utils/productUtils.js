/**
 * Utility functions for product offering types and escrow rules.
 * Physical goods use escrow, PIN, delivery confirmations, and warnings.
 * Services, tickets, and digital products use direct fulfillment (no escrow, no PIN, no physical notices).
 */

export function isTicketProduct(product) {
  if (!product) return false;
  const prod = product.product || product;
  const rawCat = prod.category?.name || prod.category?.title || prod.category || prod.category_name || prod.category_title || '';
  const categoryStr = (typeof rawCat === 'string' ? rawCat : '').toLowerCase();
  const categoriesArrayStr = Array.isArray(prod.categories)
    ? prod.categories.map(c => (typeof c === 'string' ? c : (c?.name || c?.title || ''))).join(' ').toLowerCase()
    : '';
  const fullCategory = `${categoryStr} ${categoriesArrayStr}`;
  const isCategoryTicket = fullCategory.includes('event') || fullCategory.includes('ticket');
  const isMetaTicket =
    (typeof prod.metadata === 'object' && prod.metadata !== null && prod.metadata.kind === 'ticket') ||
    prod.metadata?.item_type === 'ticket' ||
    prod.metadata?.is_ticket === true;
  const isOfferingTicket = prod.offering_type === 'ticket' || prod.type === 'ticket';
  return isCategoryTicket || isMetaTicket || isOfferingTicket;
}

export function isPhysicalItem(item) {
  if (!item) return false;
  const prod = item.product || item;
  if (isTicketProduct(prod) || isTicketProduct(item)) {
    return false;
  }
  const offeringType = item.offering_type || prod.offering_type || item.metadata?.offering_type || prod.metadata?.offering_type;
  const escrowPolicy = item.escrow_policy || prod.escrow_policy;

  if (offeringType === 'service' || offeringType === 'digital_product' || offeringType === 'ticket') {
    return false;
  }
  if (escrowPolicy === 'none') {
    return false;
  }
  if (escrowPolicy === 'physical_delivery') {
    return true;
  }
  return (offeringType || 'physical_good') === 'physical_good';
}

export function isPhysicalCart(items) {
  if (!items || !items.length) return false;
  return items.some(isPhysicalItem);
}

export function getWebCartUrl() {
  const envUrl = process.env.EXPO_PUBLIC_BUY_GOODS_URL;
  const baseUrl = (envUrl && typeof envUrl === 'string' && envUrl.trim())
    ? envUrl.trim().replace(/\/+$/, '')
    : 'https://dizzitup.com';
  return `${baseUrl}/cart`;
}

/**
 * Build the web URL for a product to open in the browser.
 * Uses EXPO_PUBLIC_BUY_GOODS_URL if present, otherwise falls back to https://dizzitup.com.
 * If no productId is provided, falls back to the web cart URL.
 */
export function getWebProductUrl(productId) {
  const envUrl = process.env.EXPO_PUBLIC_BUY_GOODS_URL;
  const baseUrl = (envUrl && typeof envUrl === 'string' && envUrl.trim())
    ? envUrl.trim().replace(/\/+$/, '')
    : 'https://dizzitup.com';
  return productId ? `${baseUrl}/product/${productId}` : `${baseUrl}/cart`;
}

