/**
 * Helper: Convert shop name to slug.
 * Exact mirror of generateSlug in buy-goods-backend/src/routes/publicRoutes.ts:133-139.
 *
 * @param {string} shopName
 * @returns {string}
 */
export function generateSlug(shopName) {
  if (!shopName || typeof shopName !== 'string') return '';
  return shopName
    .toLowerCase()
    .replace(/'s/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export const slugify = generateSlug;

/**
 * Builds the canonical public DZYstore URL for a merchant/shop.
 * Exact mirror of storeUrl in buy-goods-backend/src/controllers/publicController.ts:604-614
 * with fallback chain: shop.slug -> generateSlug(shop_name || shop.name) -> shop.id -> 'store'.
 *
 * @param {Object} shop - Merchant or shop object (may include .raw fallback)
 * @returns {string} The public DZYstore URL
 */
export function buildDzyStoreUrl(shop) {
  if (!shop) return 'https://dizzitup.com/DZYstore/global/city/store';
  const rawData = shop.raw || {};
  const name = shop.shop_name || shop.name || rawData.shop_name || rawData.name || '';
  const nameSlug = generateSlug(name);
  const shopSlug = shop.slug || rawData.slug || nameSlug || shop.id || rawData.id || 'store';
  const countryRaw = shop.country || rawData.country;
  const cityRaw = shop.city_village || rawData.city_village || shop.city || rawData.city;
  const country = countryRaw ? String(countryRaw).toLowerCase().replace(/\s+/g, '-') : 'global';
  const city = cityRaw ? String(cityRaw).toLowerCase().replace(/\s+/g, '-') : 'city';
  return `https://dizzitup.com/DZYstore/${country}/${city}/${shopSlug}`;
}
