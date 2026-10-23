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
