import { ALL_COUNTRIES } from './countriesData.js';
import countryToCurrency from 'country-to-currency';

// Manual overrides for country names that need special handling
// (e.g. older spellings, French names from DB, or regional aliases)
const LEGACY_NAME_TO_ISO = {
  // French country names that may come from the DB
  'algerie': 'DZ', 'algérie': 'DZ',
  'benin': 'BJ', 'bénin': 'BJ',
  'senegal': 'SN', 'sénégal': 'SN',
  "cote d'ivoire": 'CI', 'côte d\'ivoire': 'CI',
  'ivory coast': 'CI',
  'drc': 'CD',
  'congo brazzaville': 'CG',
  'north macedonia': 'MK',
  'czechia': 'CZ', 'czech republic': 'CZ',
  'south korea': 'KR',
  'north korea': 'KP',
  'taiwan': 'TW',
  'uk': 'GB',
  'usa': 'US',
  'états-unis': 'US',
};

/**
 * Resolve a full country name to a 2-letter ISO code.
 * Uses Intl.DisplayNames (covers ALL 240+ countries) with manual overrides for edge cases.
 */
const nameToIsoCode = (() => {
  // Build a reverse lookup map from Intl.DisplayNames at init time (fast, cached)
  const map = {};
  try {
    const ALL_CODES = Object.keys(countryToCurrency); // All valid ISO 2-letter codes
    const displayNames = new Intl.DisplayNames(['en'], { type: 'region' });
    for (const iso of ALL_CODES) {
      if (!/^[A-Z]{2}$/.test(iso)) continue;
      try {
        const name = displayNames.of(iso);
        if (name && name !== iso) {
          map[name.toLowerCase()] = iso;
        }
      } catch (_) {}
    }
  } catch (e) {
    // Intl.DisplayNames not available — will fall back to ISO_TO_COUNTRY_NAME
  }
  return map;
})();

export const getCountryCurrencyInfo = (countryStr) => {
  if (!countryStr || countryStr === 'GLOBAL' || countryStr === 'WW') {
    return { code: 'us', currency: 'USD', label: 'US Dollar' };
  }

  const str = countryStr.trim();
  const strLower = str.toLowerCase();
  const isIsoCode = str.length === 2 && /^[a-zA-Z]{2}$/.test(str);

  let code;

  if (isIsoCode) {
    // Already a 2-letter ISO code — use it directly
    code = str.toUpperCase();
  } else {
    // 1. Check manual overrides first (French names, aliases, etc.)
    code = LEGACY_NAME_TO_ISO[strLower];

    // 2. Check ISO_TO_COUNTRY_NAME reverse lookup (English canonical names)
    if (!code) {
      const normalize = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
      const strNorm = normalize(str);
      for (const [iso, name] of Object.entries(ISO_TO_COUNTRY_NAME)) {
        if (normalize(name) === strNorm) { code = iso; break; }
      }
    }

    // 3. Use Intl.DisplayNames reverse lookup (covers ALL 240+ countries)
    if (!code) {
      code = nameToIsoCode[strLower];
    }

    // 4. Unknown country — fall back to USD
    if (!code) {
      return { code: 'us', currency: 'USD', label: 'US Dollar' };
    }
  }

  // Use country-to-currency package (ISO 4217 standard — 240+ countries)
  let currency = countryToCurrency[code] || 'USD';

  // DizzitUp overrides: West/Central African CFA zones share a regional currency
  const xofCountries = ['BJ', 'BF', 'CI', 'GW', 'ML', 'NE', 'SN', 'TG'];
  const xafCountries = ['CM', 'CF', 'TD', 'CG', 'GQ', 'GA'];
  if (xofCountries.includes(code)) currency = 'XOF';
  else if (xafCountries.includes(code)) currency = 'XAF';

  // Build a human-readable label
  let displayName;
  try {
    displayName = new Intl.DisplayNames(['en'], { type: 'region' }).of(code);
  } catch (_) {}
  const countryName = displayName || ISO_TO_COUNTRY_NAME[code] || code;

  let label;
  if (currency === 'XOF' || currency === 'XAF') label = 'CFA Franc';
  else if (currency === 'USD') label = 'US Dollar';
  else if (currency === 'EUR') label = 'Euro';
  else label = `${countryName} (${currency})`;

  return {
    code: code.toLowerCase(),
    currency,
    label,
    countryName
  };
};

// Comprehensive mapping from 2-letter ISO country codes to Full Country Names
export const ISO_TO_COUNTRY_NAME = {
  'AF': 'Afghanistan', 'AL': 'Albania', 'DZ': 'Algeria', 'AD': 'Andorra', 'AO': 'Angola',
  'AR': 'Argentina', 'AM': 'Armenia', 'AU': 'Australia', 'AT': 'Austria', 'AZ': 'Azerbaijan',
  'BS': 'Bahamas', 'BH': 'Bahrain', 'BD': 'Bangladesh', 'BB': 'Barbados', 'BY': 'Belarus',
  'BE': 'Belgium', 'BZ': 'Belize', 'BJ': 'Benin', 'BT': 'Bhutan', 'BO': 'Bolivia',
  'BA': 'Bosnia and Herzegovina', 'BW': 'Botswana', 'BR': 'Brazil', 'BN': 'Brunei', 'BG': 'Bulgaria',
  'BF': 'Burkina Faso', 'BI': 'Burundi', 'KH': 'Cambodia', 'CM': 'Cameroon', 'CA': 'Canada',
  'CV': 'Cape Verde', 'CF': 'Central African Republic', 'TD': 'Chad', 'CL': 'Chile', 'CN': 'China',
  'CO': 'Colombia', 'KM': 'Comoros', 'CG': 'Congo', 'CD': 'Democratic Republic of the Congo',
  'CR': 'Costa Rica', 'HR': 'Croatia', 'CU': 'Cuba', 'CY': 'Cyprus', 'CZ': 'Czech Republic',
  'DK': 'Denmark', 'DJ': 'Djibouti', 'DO': 'Dominican Republic', 'EC': 'Ecuador', 'EG': 'Egypt',
  'SV': 'El Salvador', 'GQ': 'Equatorial Guinea', 'ER': 'Eritrea', 'EE': 'Estonia', 'SZ': 'Eswatini',
  'ET': 'Ethiopia', 'FJ': 'Fiji', 'FI': 'Finland', 'FR': 'France', 'GA': 'Gabon',
  'GM': 'Gambia', 'GE': 'Georgia', 'DE': 'Germany', 'GH': 'Ghana', 'GR': 'Greece',
  'GT': 'Guatemala', 'GN': 'Guinea', 'GW': 'Guinea-Bissau', 'GY': 'Guyana', 'HT': 'Haiti',
  'HN': 'Honduras', 'HU': 'Hungary', 'IS': 'Iceland', 'IN': 'India', 'ID': 'Indonesia',
  'IR': 'Iran', 'IQ': 'Iraq', 'IE': 'Ireland', 'IL': 'Israel', 'IT': 'Italy',
  'CI': "Côte d'Ivoire", 'JM': 'Jamaica', 'JP': 'Japan', 'JO': 'Jordan', 'KZ': 'Kazakhstan',
  'KE': 'Kenya', 'KW': 'Kuwait', 'KG': 'Kyrgyzstan', 'LA': 'Laos', 'LV': 'Latvia',
  'LB': 'Lebanon', 'LS': 'Lesotho', 'LR': 'Liberia', 'LY': 'Libya', 'LT': 'Lithuania',
  'LU': 'Luxembourg', 'MG': 'Madagascar', 'MW': 'Malawi', 'MY': 'Malaysia', 'MV': 'Maldives',
  'ML': 'Mali', 'MT': 'Malta', 'MR': 'Mauritania', 'MU': 'Mauritius', 'MX': 'Mexico',
  'MD': 'Moldova', 'MC': 'Monaco', 'MN': 'Mongolia', 'ME': 'Montenegro', 'MA': 'Morocco',
  'MZ': 'Mozambique', 'MM': 'Myanmar', 'NA': 'Namibia', 'NP': 'Nepal', 'NL': 'Netherlands',
  'NZ': 'New Zealand', 'NI': 'Nicaragua', 'NE': 'Niger', 'NG': 'Nigeria', 'KP': 'North Korea',
  'MK': 'North Macedonia', 'NO': 'Norway', 'OM': 'Oman', 'PK': 'Pakistan', 'PS': 'Palestine',
  'PA': 'Panama', 'PG': 'Papua New Guinea', 'PY': 'Paraguay', 'PE': 'Peru', 'PH': 'Philippines',
  'PL': 'Poland', 'PT': 'Portugal', 'QA': 'Qatar', 'RO': 'Romania', 'RU': 'Russia',
  'RW': 'Rwanda', 'SA': 'Saudi Arabia', 'SN': 'Senegal', 'RS': 'Serbia', 'SC': 'Seychelles',
  'SL': 'Sierra Leone', 'SG': 'Singapore', 'SK': 'Slovakia', 'SI': 'Slovenia', 'SO': 'Somalia',
  'ZA': 'South Africa', 'KR': 'South Korea', 'SS': 'South Sudan', 'ES': 'Spain', 'LK': 'Sri Lanka',
  'SD': 'Sudan', 'SE': 'Sweden', 'CH': 'Switzerland', 'SY': 'Syria', 'TW': 'Taiwan',
  'TJ': 'Tajikistan', 'TZ': 'Tanzania', 'TH': 'Thailand', 'TG': 'Togo', 'TT': 'Trinidad and Tobago',
  'TN': 'Tunisia', 'TR': 'Turkey', 'TM': 'Turkmenistan', 'UG': 'Uganda', 'UA': 'Ukraine',
  'AE': 'United Arab Emirates', 'GB': 'United Kingdom', 'US': 'United States', 'UY': 'Uruguay',
  'UZ': 'Uzbekistan', 'VE': 'Venezuela', 'VN': 'Vietnam', 'YE': 'Yemen', 'ZM': 'Zambia',
  'ZW': 'Zimbabwe'
};

/**
 * Resolves any country identifier (2-letter ISO, lowercase, or full name)
 * into a beautiful, human-readable full country name. Never returns raw initials.
 * Example: 'TG' -> 'Togo', 'NG' -> 'Nigeria', 'DZ' -> 'Algeria'
 */
export const getFullCountryName = (countryInput, lang = 'en') => {
  if (!countryInput || typeof countryInput !== 'string') return 'Nigeria';
  const clean = countryInput.trim();
  if (!clean) return 'Nigeria';

  // 1. If clean is 2-letter ISO code (e.g., 'TG', 'NG', 'DZ')
  if (clean.length === 2) {
    const code = clean.toUpperCase();
    if (ISO_TO_COUNTRY_NAME[code]) {
      return ISO_TO_COUNTRY_NAME[code];
    }
    try {
      if (typeof Intl !== 'undefined' && Intl.DisplayNames) {
        const intlName = new Intl.DisplayNames([lang, 'en'], { type: 'region' }).of(code);
        if (intlName && intlName !== code) return intlName;
      }
    } catch (_) {}
    return code;
  }

  // 2. If it's a comma-separated city/country like "Lome, TG"
  if (clean.includes(',')) {
    const parts = clean.split(',').map(p => p.trim());
    const lastPart = parts[parts.length - 1];
    if (lastPart.length === 2 && ISO_TO_COUNTRY_NAME[lastPart.toUpperCase()]) {
      return `${parts.slice(0, -1).join(', ')}, ${ISO_TO_COUNTRY_NAME[lastPart.toUpperCase()]}`;
    }
  }

  // 3. Match against known dictionary values (case-insensitive)
  const lower = clean.toLowerCase();
  for (const name of Object.values(ISO_TO_COUNTRY_NAME)) {
    if (name.toLowerCase() === lower) {
      return name;
    }
  }

  // 4. Default: Proper title case
  return clean.replace(/\b\w/g, c => c.toUpperCase());
};

/**
 * Resolves any country identifier (full name, city-country, lowercase, or ISO)
 * into an uppercase 2-letter ISO code (e.g. 'Nigeria' -> 'NG', 'Lagos, Nigeria' -> 'NG').
 */
export const getIsoCountryCode = (countryInput, fallback = 'NG') => {
  if (!countryInput || typeof countryInput !== 'string') return fallback;
  const clean = countryInput.trim();
  if (!clean) return fallback;

  // 1. If clean is already 2 letters
  if (clean.length === 2 && /^[a-zA-Z]{2}$/.test(clean)) {
    return clean.toUpperCase();
  }

  // 2. If it's comma separated, e.g. "Lagos, Nigeria" or "Lome, TG"
  if (clean.includes(',')) {
    const parts = clean.split(',').map(p => p.trim());
    const lastPart = parts[parts.length - 1];
    const resolvedLast = getIsoCountryCode(lastPart, null);
    if (resolvedLast) return resolvedLast;
  }

  // Helper to normalize accents/diacritics
  const normalize = (s) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  const cleanNorm = normalize(clean);

  // 3. Search in ISO_TO_COUNTRY_NAME
  for (const [iso, name] of Object.entries(ISO_TO_COUNTRY_NAME)) {
    if (normalize(name) === cleanNorm) {
      return iso;
    }
  }

  // 4. Also check substring matches (e.g. "nigeria" in "Federal Republic of Nigeria")
  for (const [iso, name] of Object.entries(ISO_TO_COUNTRY_NAME)) {
    const nameNorm = normalize(name);
    if (cleanNorm.includes(nameNorm) || nameNorm.includes(cleanNorm)) {
      return iso;
    }
  }

  return fallback;
};

// Cached sorted countries by dial prefix length descending for precise prefix matching
let _sortedDialCountries = null;

const getSortedDialCountries = () => {
  if (!_sortedDialCountries) {
    if (Array.isArray(ALL_COUNTRIES)) {
      _sortedDialCountries = [...ALL_COUNTRIES]
        .filter(c => c.dial && c.code)
        .map(c => ({
          code: c.code.toUpperCase(),
          dialDigits: c.dial.replace(/\D/g, '')
        }))
        .filter(c => c.dialDigits.length > 0)
        .sort((a, b) => b.dialDigits.length - a.dialDigits.length);
    } else {
      _sortedDialCountries = [];
    }
  }
  return _sortedDialCountries;
};

/**
 * Derives a 2-letter ISO country code from an international phone number.
 * Example: '+234 80 1234 5678' -> 'NG', '+228 90 12 34 56' -> 'TG'
 */
export const getCountryFromPhone = (phoneInput) => {
  if (!phoneInput) return null;
  const digits = String(phoneInput).replace(/\D/g, '');
  if (!digits || digits.length < 5) return null;

  const list = getSortedDialCountries();
  for (const item of list) {
    if (digits.startsWith(item.dialDigits)) {
      return item.code;
    }
  }

  return null;
};

/**
 * 3-Tier dynamic country resolver:
 * Tier 1: Explicit beneficiary country field (country_code, country_iso, country, country_name)
 * Tier 2: E.164 dial prefix derived from beneficiary.phone or recipientPhone
 * Tier 3: Active logged-in user context (user?.country or user?.country_code)
 * Fallback: optional fallback, or null if unresolvable
 */
export const resolveBeneficiaryCountry = (beneficiary = {}, options = {}) => {
  const { phone, user, fallback = null } = options;

  // Tier 1: Check explicit country fields on beneficiary
  const explicitRaw = 
    beneficiary?.country_code ||
    beneficiary?.country_code_iso ||
    beneficiary?.country_iso ||
    beneficiary?.country ||
    beneficiary?.country_name;

  if (explicitRaw && typeof explicitRaw === 'string') {
    const iso = getIsoCountryCode(explicitRaw, null);
    if (iso) {
      return {
        countryCode: iso,
        countryName: getFullCountryName(iso),
        source: 'explicit'
      };
    }
  }

  // Tier 2: Derive dynamically from phone number (E.164 dial prefix)
  const phoneToTest = phone || beneficiary?.phone || beneficiary?.phone_number || beneficiary?.dial_code;
  if (phoneToTest) {
    const phoneIso = getCountryFromPhone(phoneToTest);
    if (phoneIso) {
      return {
        countryCode: phoneIso,
        countryName: getFullCountryName(phoneIso),
        source: 'phone'
      };
    }
  }

  // Tier 3: Check logged-in user profile / app context
  const userCountryRaw = user?.country || user?.country_code || user?.country_name;
  if (userCountryRaw && typeof userCountryRaw === 'string') {
    const userIso = getIsoCountryCode(userCountryRaw, null);
    if (userIso) {
      return {
        countryCode: userIso,
        countryName: getFullCountryName(userIso),
        source: 'user_profile'
      };
    }
  }

  // Final fallback (if caller explicitly provided a fallback or null)
  if (fallback) {
    const fallbackIso = getIsoCountryCode(fallback, fallback);
    return {
      countryCode: fallbackIso,
      countryName: getFullCountryName(fallbackIso),
      source: 'fallback'
    };
  }

  return {
    countryCode: null,
    countryName: '',
    source: 'unknown'
  };
};

export const getFlagEmoji = (countryCodeOrName) => {
  if (!countryCodeOrName) return '🌍';
  let iso = String(countryCodeOrName).trim();
  if (iso.length !== 2) {
    const info = getCountryCurrencyInfo(iso);
    iso = info?.code || '';
  }
  if (!iso || iso.length !== 2) return '🌍';
  const codePoints = iso.toUpperCase().split('').map(char => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
};

import { currencyRateService, EMERGENCY_RATES } from '../services/currencyRateService.js';

export const EXCHANGE_RATES_TO_USD = EMERGENCY_RATES;

export const convertCurrencyAmount = (amount, fromCurrency = 'USD', toCurrency = 'USD') => {
  return currencyRateService.convert(amount, fromCurrency, toCurrency);
};

