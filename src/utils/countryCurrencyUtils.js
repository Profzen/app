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
