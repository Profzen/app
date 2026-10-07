/**
 * Payment Corridor Service
 * Centralized eligibility engine for Payment Rails (Crypto, Cards, Mobile Money, Banks)
 * across Checkout, Wallet Top-Up (On-Ramp), and Cash-Out (Off-Ramp).
 *
 * Official September 2026 partner coverage:
 * - KkiaPay (UEMOA 6 markets)
 * - IziChange Pay (18 off-ramp markets)
 * - Kotani Pay (18 African markets)
 * - Ecobank / CyberSource (Card & Bank settlement across 33 African countries)
 */

export const KKIAPAY_CORRIDORS = ['BJ', 'CI', 'SN', 'TG', 'NE', 'BF'];

export const KOTANIPAY_CORRIDORS = [
  'KE', 'GH', 'ZM', 'ZA', 'RW', 'UG', 'TZ', 'CD', 'CM', 'CI',
  'BJ', 'BF', 'GA', 'NG', 'SN', 'SL', 'ET'
];

export const IZICHANGE_OFFRAMP_CORRIDORS = [
  'BJ', 'CM', 'GA', 'CI', 'BF', 'SN', 'CD', 'ML', 'TG', 'GN',
  'NE', 'CG', 'GH', 'KE', 'NG', 'CF', 'TD', 'GW'
];

// Union of all active Mobile Money corridors (MG removed - no active offramp/onramp partner in DizzyWallet)
export const ALL_MOMO_CORRIDORS = Array.from(
  new Set([...KKIAPAY_CORRIDORS, ...KOTANIPAY_CORRIDORS, ...IZICHANGE_OFFRAMP_CORRIDORS])
);

// Dedicated Off-ramp Corridors matching DizzyWallet MOMO_PROVIDERS registry
export const OFFRAMP_MOMO_CORRIDORS = [
  'BJ', 'CM', 'CG', 'CD', 'EG', 'ET', 'GA', 'GH', 'CI', 'KE', 'MW', 'RW', 'SN', 'TZ', 'TG', 'UG', 'ZM'
];

export const OFFRAMP_BANK_CORRIDORS = [
  'BW', 'CM', 'CG', 'CD', 'GA', 'GH', 'CI', 'KE', 'MW', 'NG', 'RW', 'SN', 'ZA', 'TZ', 'UG', 'ZM',
  // European SEPA / International wire
  'FR', 'DE', 'IT', 'ES', 'NL', 'BE'
];

// Ecobank primary retail and corporate banking markets
export const ECOBANK_CORRIDORS = [
  'BJ', 'BF', 'CI', 'GW', 'ML', 'NE', 'SN', 'TG', // UEMOA
  'CM', 'CF', 'TD', 'CG', 'GA', 'GQ',             // CEMAC
  'GH', 'GN', 'LR', 'NG', 'SL', 'GM',             // WAMZ
  'BI', 'CD', 'RW', 'ST',                         // Central Africa
  'KE', 'MW', 'MZ', 'SS', 'TZ', 'UG', 'ZM', 'ZW'  // East & Southern Africa
];

export const COUNTRY_METADATA = {
  BJ: { name: 'Bénin', nameEn: 'Benin', flag: '🇧🇯', currency: 'XOF', dialCode: '+229', momoNetworks: ['MTN', 'Moov', 'Celtiis'] },
  CI: { name: 'Côte d’Ivoire', nameEn: 'Ivory Coast', flag: '🇨🇮', currency: 'XOF', dialCode: '+225', momoNetworks: ['Orange', 'Wave', 'MTN', 'Moov'] },
  SN: { name: 'Sénégal', nameEn: 'Senegal', flag: '🇸🇳', currency: 'XOF', dialCode: '+221', momoNetworks: ['Orange', 'Wave', 'Free Money'] },
  TG: { name: 'Togo', nameEn: 'Togo', flag: '🇹🇬', currency: 'XOF', dialCode: '+228', momoNetworks: ['Mixx by Yas (Tmoney)', 'Moov (Flooz)'] },
  MG: { name: 'Madagascar', nameEn: 'Madagascar', flag: '🇲🇬', currency: 'MGA', dialCode: '+261', momoNetworks: [] },
  NE: { name: 'Niger', nameEn: 'Niger', flag: '🇳🇪', currency: 'XOF', dialCode: '+227', momoNetworks: ['Airtel', 'Nita', 'Moov'] },
  BF: { name: 'Burkina Faso', nameEn: 'Burkina Faso', flag: '🇧🇫', currency: 'XOF', dialCode: '+226', momoNetworks: ['Orange', 'Moov'] },
  ML: { name: 'Mali', nameEn: 'Mali', flag: '🇲🇱', currency: 'XOF', dialCode: '+223', momoNetworks: ['Orange', 'Moov'] },
  GW: { name: 'Guinée-Bissau', nameEn: 'Guinea-Bissau', flag: '🇬🇼', currency: 'XOF', dialCode: '+245', momoNetworks: ['Orange', 'MTN'] },
  CM: { name: 'Cameroun', nameEn: 'Cameroon', flag: '🇨🇲', currency: 'XAF', dialCode: '+237', momoNetworks: ['MTN', 'Orange'] },
  GA: { name: 'Gabon', nameEn: 'Gabon', flag: '🇬🇦', currency: 'XAF', dialCode: '+241', momoNetworks: ['Airtel', 'Moov'] },
  CG: { name: 'Congo Brazzaville', nameEn: 'Congo Brazzaville', flag: '🇨🇬', currency: 'XAF', dialCode: '+242', momoNetworks: ['MTN', 'Airtel'] },
  CD: { name: 'RD Congo', nameEn: 'DR Congo', flag: '🇨🇩', currency: 'CDF', dialCode: '+243', momoNetworks: ['Vodacom', 'Airtel', 'Orange'] },
  CF: { name: 'Centrafrique', nameEn: 'Central African Republic', flag: '🇨🇫', currency: 'XAF', dialCode: '+236', momoNetworks: ['Orange Money', 'Telecel'] },
  TD: { name: 'Tchad', nameEn: 'Chad', flag: '🇹🇩', currency: 'XAF', dialCode: '+235', momoNetworks: ['Airtel', 'Moov'] },
  GN: { name: 'Guinée', nameEn: 'Guinea', flag: '🇬🇳', currency: 'GNF', dialCode: '+224', momoNetworks: ['Orange', 'MTN'] },
  GH: { name: 'Ghana', nameEn: 'Ghana', flag: '🇬🇭', currency: 'GHS', dialCode: '+233', momoNetworks: ['MTN', 'Telecel', 'AirtelTigo'] },
  KE: { name: 'Kenya', nameEn: 'Kenya', flag: '🇰🇪', currency: 'KES', dialCode: '+254', momoNetworks: ['Safaricom', 'Airtel'] },
  NG: { name: 'Nigeria', nameEn: 'Nigeria', flag: '🇳🇬', currency: 'NGN', dialCode: '+234', momoNetworks: ['OPay', 'Palmpay', 'Bank Transfer'] },
  RW: { name: 'Rwanda', nameEn: 'Rwanda', flag: '🇷🇼', currency: 'RWF', dialCode: '+250', momoNetworks: ['MTN', 'Airtel'] },
  UG: { name: 'Ouganda', nameEn: 'Uganda', flag: '🇺🇬', currency: 'UGX', dialCode: '+256', momoNetworks: ['MTN', 'Airtel'] },
  ZM: { name: 'Zambie', nameEn: 'Zambia', flag: '🇿🇲', currency: 'ZMW', dialCode: '+260', momoNetworks: ['MTN', 'Airtel', 'Zamtel'] },
  TZ: { name: 'Tanzanie', nameEn: 'Tanzania', flag: '🇹🇿', currency: 'TZS', dialCode: '+255', momoNetworks: ['Vodacom', 'Airtel', 'Tigo', 'Halopesa'] },
  ZA: { name: 'Afrique du Sud', nameEn: 'South Africa', flag: '🇿🇦', currency: 'ZAR', dialCode: '+27', momoNetworks: ['Vodacom', 'MTN', 'EFT Instant Banks'] },
  SL: { name: 'Sierra Leone', nameEn: 'Sierra Leone', flag: '🇸🇱', currency: 'SLE', dialCode: '+232', momoNetworks: ['Orange Money'] },
  ET: { name: 'Éthiopie', nameEn: 'Ethiopia', flag: '🇪🇹', currency: 'ETB', dialCode: '+251', momoNetworks: ['Ethio Telecom (Telebirr)', 'CBE', 'Dashen Bank'] },
  // Common non-MoMo regions
  MA: { name: 'Maroc', nameEn: 'Morocco', flag: '🇲🇦', currency: 'MAD', dialCode: '+212', momoNetworks: [] },
  DZ: { name: 'Algérie', nameEn: 'Algeria', flag: '🇩🇿', currency: 'DZD', dialCode: '+213', momoNetworks: [] },
  TN: { name: 'Tunisie', nameEn: 'Tunisia', flag: '🇹🇳', currency: 'TND', dialCode: '+216', momoNetworks: [] },
  EG: { name: 'Égypte', nameEn: 'Egypt', flag: '🇪🇬', currency: 'EGP', dialCode: '+20', momoNetworks: [] },
  FR: { name: 'France', nameEn: 'France', flag: '🇫🇷', currency: 'EUR', dialCode: '+33', momoNetworks: [] },
  IN: { name: 'Inde', nameEn: 'India', flag: '🇮🇳', currency: 'INR', dialCode: '+91', momoNetworks: [] },
  TR: { name: 'Turquie', nameEn: 'Turkey', flag: '🇹🇷', currency: 'TRY', dialCode: '+90', momoNetworks: [] },
  US: { name: 'États-Unis', nameEn: 'United States', flag: '🇺🇸', currency: 'USD', dialCode: '+1', momoNetworks: [] },
  CA: { name: 'Canada', nameEn: 'Canada', flag: '🇨🇦', currency: 'CAD', dialCode: '+1', momoNetworks: [] },
  GB: { name: 'Royaume-Uni', nameEn: 'United Kingdom', flag: '🇬🇧', currency: 'GBP', dialCode: '+44', momoNetworks: [] },
};

export function getLocalizedCountryName(code, lang = 'en') {
  const norm = (code || '').toUpperCase().trim();
  const meta = COUNTRY_METADATA[norm];
  if (!meta) return norm || 'International';
  return (lang === 'fr' ? meta.name : (meta.nameEn || meta.name)) || meta.name;
}

/**
 * Evaluates payment rails availability based on buyer country and flow type
 * @param {string} countryCode - ISO-2 code (e.g. 'BJ', 'CI', 'MA', 'FR')
 * @param {'checkout' | 'onramp' | 'offramp'} flow
 * @param {string} lang - 'en', 'fr', 'pt', 'am', 'ar'
 */
export function getPaymentRailEligibility(countryCode, flow = 'checkout', lang = 'en') {
  const normCountry = (countryCode || '').toUpperCase().trim();
  const meta = COUNTRY_METADATA[normCountry] || {
    name: normCountry || 'International',
    nameEn: normCountry || 'International',
    flag: '🌍',
    currency: 'USD',
    dialCode: '+1',
    momoNetworks: [],
  };

  const isFr = lang === 'fr';
  const isPt = lang === 'pt';
  const localizedCountryName = isFr ? meta.name : (meta.nameEn || meta.name);
  const licensedNetworkStr = isFr
    ? 'Réseau Partenaire Agréé'
    : isPt
      ? 'Rede Parceira Autorizada'
      : 'Licensed Partner Network';

  // 1. CRYPTO / STABLECOINS: Always 100% supported worldwide
  const crypto = {
    enabled: true,
    badge: isFr ? '100% Mondial' : isPt ? '100% Global' : '100% Global',
    tokens: ['USDC', 'USDT', 'EURC', 'DZY'],
    networks: ['Polygon', 'Base', 'Solana', 'Ethereum'],
  };

  // 2. CREDIT / DEBIT CARDS: Active worldwide
  const card = {
    enabled: true,
    provider: 'card_secure_3ds',
    badge: 'Visa & Mastercard 3DS',
    feeDesc: isFr ? 'Paiement Sécurisé' : isPt ? 'Pagamento Seguro' : 'Secure Payment',
  };

  // 3. MOBILE MONEY: Strict corridor check (Flow-aware)
  const momoSupported = flow === 'offramp'
    ? OFFRAMP_MOMO_CORRIDORS.includes(normCountry)
    : ALL_MOMO_CORRIDORS.includes(normCountry);

  let momoProviders = [];
  if (momoSupported) {
    momoProviders.push(licensedNetworkStr);
  }

  const momo = {
    enabled: momoSupported,
    countryCode: normCountry,
    countryName: localizedCountryName,
    countryFlag: meta.flag,
    dialCode: meta.dialCode || '+229',
    operators: meta.momoNetworks || [],
    providers: momoProviders,
    reason: momoSupported
      ? (isFr ? `Disponible (${meta.momoNetworks.join(', ')})` : `Available (${meta.momoNetworks.join(', ')})`)
      : (isFr
        ? `Indisponible pour ${localizedCountryName}. Actif dans 20 pays d'Afrique Subsaharienne.`
        : `Not available in ${localizedCountryName}. Available in 20 Sub-Saharan African countries.`),
  };

  // 4. BANK TRANSFER / PAYOUT (Flow-aware)
  let bankSupported = false;
  let bankProvider = 'international_wire';

  if (flow === 'offramp') {
    bankSupported = OFFRAMP_BANK_CORRIDORS.includes(normCountry);
    if (['FR', 'DE', 'IT', 'ES', 'NL', 'BE'].includes(normCountry)) {
      bankProvider = 'sepa';
    } else if (['ZA', 'NG', 'ET', 'KE', 'GH', 'UG', 'TZ', 'RW', 'MW', 'ZM', 'CD', 'CM'].includes(normCountry)) {
      bankProvider = 'kotanipay_bank';
    } else {
      bankProvider = 'yellowcard_bank';
    }
  } else {
    if (ECOBANK_CORRIDORS.includes(normCountry)) {
      bankSupported = true;
      bankProvider = 'ecobank';
    } else if (['ZA', 'NG', 'ET'].includes(normCountry)) {
      bankSupported = true;
      bankProvider = 'kotanipay_bank';
    } else if (['FR', 'DE', 'IT', 'ES', 'NL', 'BE'].includes(normCountry)) {
      bankSupported = true;
      bankProvider = 'sepa';
    }
  }

  const bank = {
    enabled: bankSupported,
    provider: bankProvider,
    badge: bankProvider === 'ecobank'
      ? 'Ecobank (Gratuit)'
      : bankProvider === 'sepa'
        ? 'SEPA Wire'
        : (isFr ? 'Virement Bancaire' : 'Bank Transfer'),
    reason: bankSupported
      ? (isFr ? `Virement bancaire disponible en ${localizedCountryName}` : `Bank transfer available in ${localizedCountryName}`)
      : (isFr ? `Virement local indisponible pour ${localizedCountryName}` : `Bank transfer unavailable in ${localizedCountryName}`),
  };

  return {
    countryCode: normCountry,
    countryName: meta.name,
    countryFlag: meta.flag,
    crypto,
    card,
    momo,
    bank,
  };
}

// Priority order: major African economies listed first 
export const MAJOR_AFRICAN_ECONOMIES_ORDER = [
  'NG', // Nigeria
  'ZA', // South Africa
  'ET', // Ethiopia
  'KE', // Kenya
  'CD', // DR Congo
  'GH', // Ghana
  'TZ', // Tanzania
  'CI', // Côte d'Ivoire
  'CM', // Cameroon
  'UG', // Uganda
  'SN', // Senegal
  'RW', // Rwanda
  'ZM', // Zambia
  'GA', // Gabon
  'BJ', // Benin
  'BF', // Burkina Faso
  'ML', // Mali
  'TG', // Togo
  'NE', // Niger
  'GN', // Guinea
  'SL', // Sierra Leone
  'CG', // Congo
  'CF', // Central African Republic
  'TD', // Chad
  'GW', // Guinea-Bissau
];

/**
 * Returns array of all supported African MoMo countries for country selector modal
 */
export function getSupportedMoMoCountries(lang = 'en') {
  return ALL_MOMO_CORRIDORS.map((code) => {
    const meta = COUNTRY_METADATA[code];
    const name = lang === 'fr' ? meta?.name : (meta?.nameEn || meta?.name);
    return {
      code,
      name: name || code,
      flag: meta?.flag || '🌍',
      currency: meta?.currency || 'XOF',
      networks: meta?.momoNetworks || [],
    };
  }).sort((a, b) => {
    const indexA = MAJOR_AFRICAN_ECONOMIES_ORDER.indexOf(a.code);
    const indexB = MAJOR_AFRICAN_ECONOMIES_ORDER.indexOf(b.code);
    const rankA = indexA !== -1 ? indexA : 999;
    const rankB = indexB !== -1 ? indexB : 999;
    if (rankA !== rankB) return rankA - rankB;
    return a.name.localeCompare(b.name);
  });
}

export default {
  KKIAPAY_CORRIDORS,
  KOTANIPAY_CORRIDORS,
  IZICHANGE_OFFRAMP_CORRIDORS,
  ALL_MOMO_CORRIDORS,
  OFFRAMP_MOMO_CORRIDORS,
  OFFRAMP_BANK_CORRIDORS,
  ECOBANK_CORRIDORS,
  COUNTRY_METADATA,
  getPaymentRailEligibility,
  getSupportedMoMoCountries,
};
