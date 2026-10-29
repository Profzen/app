import { ALL_COUNTRIES } from './countriesData';

const LEADING_EMOJI_REGEX = /^[\p{Extended_Pictographic}\uFE0F\u200D\s]+/u;

/**
 * Strips only leading emoji characters and leading whitespace from a category label.
 * Values without emojis (e.g. "General", "Professional Services") remain unchanged.
 *
 * @param {string} name
 * @returns {string}
 */
export function cleanCategoryName(name) {
  if (!name || typeof name !== 'string') return '';
  return name.replace(LEADING_EMOJI_REGEX, '').trim();
}

/**
 * Splits raw category data (comma-separated string, JSON string, or array),
 * cleans each item, and drops empty entries.
 *
 * @param {string|Array} rawCategories
 * @returns {string[]}
 */
export function parseCleanCategories(rawCategories) {
  if (!rawCategories) return [];

  let items = [];

  if (Array.isArray(rawCategories)) {
    items = rawCategories;
  } else if (typeof rawCategories === 'string') {
    const trimmed = rawCategories.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          items = parsed;
        }
      } catch (e) {
        items = trimmed.split(',');
      }
    } else {
      items = trimmed.split(',');
    }
  }

  return items
    .map((item) => {
      const str = typeof item === 'string' ? item : (item?.name || String(item || ''));
      return cleanCategoryName(str);
    })
    .filter((item) => item.length > 0);
}

/**
 * Resolves a country string (name or 2-letter ISO code, case-insensitive)
 * against ALL_COUNTRIES and returns the FlagCDN image URL.
 * If no match is found, returns null (no fallback source).
 *
 * @param {string} countryInput
 * @returns {string|null}
 */
export function getCountryFlagUrl(countryInput) {
  if (!countryInput || typeof countryInput !== 'string') return null;
  const normalized = countryInput.trim().toLowerCase();
  if (!normalized) return null;

  const matched = ALL_COUNTRIES.find(
    (c) => c.code.toLowerCase() === normalized || c.name.toLowerCase() === normalized
  );

  if (!matched || !matched.code) return null;
  return `https://flagcdn.com/w40/${matched.code.toLowerCase()}.png`;
}

/**
 * Formats city and country for display.
 * Trims city and country without altering casing.
 * If city is empty or the placeholder "Unknown", shows only country.
 *
 * @param {string} cityVillage
 * @param {string} country
 * @returns {string}
 */
export function formatMerchantLocation(cityVillage, country) {
  const trimmedCity = (cityVillage || '').trim();
  const trimmedCountry = (country || '').trim();

  const isUnknownCity = !trimmedCity || trimmedCity.toLowerCase() === 'unknown';

  if (isUnknownCity) {
    return trimmedCountry;
  }
  if (!trimmedCountry) {
    return trimmedCity;
  }
  return `${trimmedCity}, ${trimmedCountry}`;
}

