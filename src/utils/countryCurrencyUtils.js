import { ALL_COUNTRIES } from './countriesData.js';

export const getCountryCurrencyInfo = (countryStr) => {
  if (!countryStr || countryStr === 'GLOBAL' || countryStr === 'WW') {
    return { code: 'us', currency: 'USD', label: 'US Dollar' };
  }

  const str = countryStr.trim().toLowerCase();
  
  // Comprehensive mapping of country names to ISO-2 codes
  const nameToIso = {
    'afghanistan': 'AF', 'albania': 'AL', 'algeria': 'DZ', 'andorra': 'AD', 'angola': 'AO', 'argentina': 'AR', 'armenia': 'AM', 'australia': 'AU', 'austria': 'AT', 'azerbaijan': 'AZ',
    'bahamas': 'BS', 'bahrain': 'BH', 'bangladesh': 'BD', 'barbados': 'BB', 'belarus': 'BY', 'belgium': 'BE', 'belize': 'BZ', 'benin': 'BJ', 'bhutan': 'BT', 'bolivia': 'BO',
    'bosnia and herzegovina': 'BA', 'botswana': 'BW', 'brazil': 'BR', 'brunei': 'BN', 'bulgaria': 'BG', 'burkina faso': 'BF', 'burundi': 'BI', 'cambodia': 'KH', 'cameroon': 'CM',
    'canada': 'CA', 'cape verde': 'CV', 'central african republic': 'CF', 'chad': 'TD', 'chile': 'CL', 'china': 'CN', 'colombia': 'CO', 'comoros': 'KM', 'congo': 'CG',
    'drc': 'CD', 'democratic republic of the congo': 'CD', 'costa rica': 'CR', 'croatia': 'HR', 'cuba': 'CU', 'cyprus': 'CY', 'czech republic': 'CZ', 'denmark': 'DK',
    'djibouti': 'DJ', 'dominican republic': 'DO', 'ecuador': 'EC', 'egypt': 'EG', 'el salvador': 'SV', 'equatorial guinea': 'GQ', 'eritrea': 'ER', 'estonia': 'EE',
    'eswatini': 'SZ', 'ethiopia': 'ET', 'fiji': 'FJ', 'finland': 'FI', 'france': 'FR', 'gabon': 'GA', 'gambia': 'GM', 'georgia': 'GE', 'germany': 'DE', 'ghana': 'GH',
    'greece': 'GR', 'guatemala': 'GT', 'guinea': 'GN', 'guinea-bissau': 'GW', 'guyana': 'GY', 'haiti': 'HT', 'honduras': 'HN', 'hungary': 'HU', 'iceland': 'IS', 'india': 'IN',
    'indonesia': 'ID', 'iran': 'IR', 'iraq': 'IQ', 'ireland': 'IE', 'israel': 'IL', 'italy': 'IT', 'ivory coast': 'CI', "cote d'ivoire": 'CI', 'jamaica': 'JM', 'japan': 'JP',
    'jordan': 'JO', 'kazakhstan': 'KZ', 'kenya': 'KE', 'kuwait': 'KW', 'kyrgyzstan': 'KG', 'laos': 'LA', 'latvia': 'LV', 'lebanon': 'LB', 'lesotho': 'LS', 'liberia': 'LR',
    'libya': 'LY', 'lithuania': 'LT', 'luxembourg': 'LU', 'madagascar': 'MG', 'malawi': 'MW', 'malaysia': 'MY', 'maldives': 'MV', 'mali': 'ML', 'malta': 'MT', 'mauritania': 'MR',
    'mauritius': 'MU', 'mexico': 'MX', 'moldova': 'MD', 'monaco': 'MC', 'mongolia': 'MN', 'montenegro': 'ME', 'morocco': 'MA', 'mozambique': 'MZ', 'myanmar': 'MM',
    'namibia': 'NA', 'nepal': 'NP', 'netherlands': 'NL', 'new zealand': 'NZ', 'nicaragua': 'NI', 'niger': 'NE', 'nigeria': 'NG', 'north korea': 'KP', 'north macedonia': 'MK',
    'norway': 'NO', 'oman': 'OM', 'pakistan': 'PK', 'palestine': 'PS', 'panama': 'PA', 'papua new guinea': 'PG', 'paraguay': 'PY', 'peru': 'PE', 'philippines': 'PH',
    'poland': 'PL', 'portugal': 'PT', 'qatar': 'QA', 'romania': 'RO', 'russia': 'RU', 'rwanda': 'RW', 'saudi arabia': 'SA', 'senegal': 'SN', 'serbia': 'RS', 'seychelles': 'SC',
    'sierra leone': 'SL', 'singapore': 'SG', 'slovakia': 'SK', 'slovenia': 'SI', 'somalia': 'SO', 'south africa': 'ZA', 'south korea': 'KR', 'south sudan': 'SS', 'spain': 'ES',
    'sri lanka': 'LK', 'sudan': 'SD', 'sweden': 'SE', 'switzerland': 'CH', 'syria': 'SY', 'taiwan': 'TW', 'tajikistan': 'TJ', 'tanzania': 'TZ', 'thailand': 'TH', 'togo': 'TG',
    'trinidad and tobago': 'TT', 'tunisia': 'TN', 'turkey': 'TR', 'turkmenistan': 'TM', 'uganda': 'UG', 'ukraine': 'UA', 'united arab emirates': 'AE', 'united kingdom': 'GB',
    'united states': 'US', 'uruguay': 'UY', 'uzbekistan': 'UZ', 'venezuela': 'VE', 'vietnam': 'VN', 'yemen': 'YE', 'zambia': 'ZM', 'zimbabwe': 'ZW'
  };

  // Comprehensive mapping of ISO-2 codes to Currency Codes
  const isoToCurrency = {
    'AF': 'AFN', 'AL': 'ALL', 'DZ': 'DZD', 'AD': 'EUR', 'AO': 'AOA', 'AR': 'ARS', 'AM': 'AMD', 'AU': 'AUD', 'AT': 'EUR', 'AZ': 'AZN', 'BS': 'BSD', 'BH': 'BHD', 'BD': 'BDT',
    'BB': 'BBD', 'BY': 'BYN', 'BE': 'EUR', 'BZ': 'BZD', 'BJ': 'XOF', 'BT': 'BTN', 'BO': 'BOB', 'BA': 'BAM', 'BW': 'BWP', 'BR': 'BRL', 'BN': 'BND', 'BG': 'BGN', 'BF': 'XOF',
    'BI': 'BIF', 'KH': 'KHR', 'CM': 'XAF', 'CA': 'CAD', 'CV': 'CVE', 'CF': 'XAF', 'TD': 'XAF', 'CL': 'CLP', 'CN': 'CNY', 'CO': 'COP', 'KM': 'KMF', 'CG': 'XAF', 'CD': 'CDF',
    'CR': 'CRC', 'HR': 'EUR', 'CU': 'CUP', 'CY': 'EUR', 'CZ': 'CZK', 'DK': 'DKK', 'DJ': 'DJF', 'DO': 'DOP', 'EC': 'USD', 'EG': 'EGP', 'SV': 'USD', 'GQ': 'XAF', 'ER': 'ERN',
    'EE': 'EUR', 'SZ': 'SZL', 'ET': 'ETB', 'FJ': 'FJD', 'FI': 'EUR', 'FR': 'EUR', 'GA': 'XAF', 'GM': 'GMD', 'GE': 'GEL', 'DE': 'EUR', 'GH': 'GHS', 'GR': 'EUR', 'GT': 'GTQ',
    'GN': 'GNF', 'GW': 'XOF', 'GY': 'GYD', 'HT': 'HTG', 'HN': 'HNL', 'HU': 'HUF', 'IS': 'ISK', 'IN': 'INR', 'ID': 'IDR', 'IR': 'IRR', 'IQ': 'IQD', 'IE': 'EUR', 'IL': 'ILS',
    'IT': 'EUR', 'CI': 'XOF', 'JM': 'JMD', 'JP': 'JPY', 'JO': 'JOD', 'KZ': 'KZT', 'KE': 'KES', 'KW': 'KWD', 'KG': 'KGS', 'LA': 'LAK', 'LV': 'EUR', 'LB': 'LBP', 'LS': 'LSL',
    'LR': 'LRD', 'LY': 'LYD', 'LT': 'EUR', 'LU': 'EUR', 'MG': 'MGA', 'MW': 'MWK', 'MY': 'MYR', 'MV': 'MVR', 'ML': 'XOF', 'MT': 'EUR', 'MR': 'MRU', 'MU': 'MUR', 'MX': 'MXN',
    'MD': 'MDL', 'MC': 'EUR', 'MN': 'MNT', 'ME': 'EUR', 'MA': 'MAD', 'MZ': 'MZN', 'MM': 'MMK', 'NA': 'NAD', 'NP': 'NPR', 'NL': 'EUR', 'NZ': 'NZD', 'NI': 'NIO', 'NE': 'XOF',
    'NG': 'NGN', 'KP': 'KPW', 'MK': 'MKD', 'NO': 'NOK', 'OM': 'OMR', 'PK': 'PKR', 'PS': 'ILS', 'PA': 'PAB', 'PG': 'PGK', 'PY': 'PYG', 'PE': 'PEN', 'PH': 'PHP', 'PL': 'PLN',
    'PT': 'EUR', 'QA': 'QAR', 'RO': 'RON', 'RU': 'RUB', 'RW': 'RWF', 'SA': 'SAR', 'SN': 'XOF', 'RS': 'RSD', 'SC': 'SCR', 'SL': 'SLE', 'SG': 'SGD', 'SK': 'EUR', 'SI': 'EUR',
    'SO': 'SOS', 'ZA': 'ZAR', 'KR': 'KRW', 'SS': 'SSP', 'ES': 'EUR', 'LK': 'LKR', 'SD': 'SDG', 'SE': 'SEK', 'CH': 'CHF', 'SY': 'SYP', 'TW': 'TWD', 'TJ': 'TJS', 'TZ': 'TZS',
    'TH': 'THB', 'TG': 'XOF', 'TT': 'TTD', 'TN': 'TND', 'TR': 'TRY', 'TM': 'TMT', 'UG': 'UGX', 'UA': 'UAH', 'AE': 'AED', 'GB': 'GBP', 'US': 'USD', 'UY': 'UYU', 'UZ': 'UZS',
    'VE': 'VES', 'VN': 'VND', 'YE': 'YER', 'ZM': 'ZMW', 'ZW': 'ZWL'
  };

  const isoToName = {
    'DZ': 'Algeria', 'CA': 'Canada', 'TR': 'Turkey', 'US': 'United States', 'FR': 'France', 'GB': 'United Kingdom'
  };

  const isIsoCode = str.length === 2 && /^[a-z]{2}$/.test(str);
  let code = isIsoCode ? str.toUpperCase() : nameToIso[str];
  
  // Fallback to USD if country is completely unknown
  if (!code) {
    return { code: 'us', currency: 'USD', label: 'US Dollar' };
  }

  const currency = isoToCurrency[code] || 'USD';
  
  // Format the label nicely
  let label = isoToName[code] || (isIsoCode ? str.toUpperCase() : str.charAt(0).toUpperCase() + str.slice(1));
  if (currency === 'XOF') label = 'CFA Franc';
  else if (currency === 'TRY') label = 'Turkish Lira';
  else if (currency === 'CAD') label = 'Canadian Dollar';
  else if (currency === 'USD') label = 'US Dollar';
  else if (currency === 'EUR') label = 'Euro';
  else label = label + ' (' + currency + ')';

  return {
    code: code.toLowerCase(),
    currency,
    label
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

import { currencyRateService, EMERGENCY_RATES } from '../services/currencyRateService';

export const EXCHANGE_RATES_TO_USD = EMERGENCY_RATES;

export const convertCurrencyAmount = (amount, fromCurrency = 'USD', toCurrency = 'USD') => {
  return currencyRateService.convert(amount, fromCurrency, toCurrency);
};

