import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Cellular from 'expo-cellular';
import { Platform } from 'react-native';

let memoryCountry = null;
let inFlightPromise = null;
const BACKEND_GEO_URL = `${process.env.EXPO_PUBLIC_BUY_GOODS_API_URL || 'http://localhost:3001/api'}/public/geo/ip-country`;

export const COUNTRY_NAME_TO_CODE = {
  'ALGERIA': 'DZ', 'ALGÉRIE': 'DZ', 'ALGERIE': 'DZ',
  'BENIN': 'BJ', 'BÉNIN': 'BJ',
  'FRANCE': 'FR',
  'MOROCCO': 'MA', 'MAROC': 'MA',
  'TOGO': 'TG',
  'MADAGASCAR': 'MG',
  'SENEGAL': 'SN', 'SÉNÉGAL': 'SN',
  'IVORY COAST': 'CI', "COTE D'IVOIRE": 'CI', 'CÔTE D’IVOIRE': 'CI', 'COTE D’IVOIRE': 'CI',
  'CAMEROON': 'CM', 'CAMEROUN': 'CM',
  'KENYA': 'KE',
  'NIGERIA': 'NG',
  'GHANA': 'GH',
  'INDIA': 'IN', 'INDE': 'IN',
  'UNITED STATES': 'US', 'USA': 'US', 'ÉTATS-UNIS': 'US',
  'CANADA': 'CA',
  'TURKEY': 'TR', 'TURQUIE': 'TR',
  'TUNISIA': 'TN', 'TUNISIE': 'TN',
  'SPAIN': 'ES', 'ESPAGNE': 'ES',
  'UNITED KINGDOM': 'GB', 'ROYAUME-UNI': 'GB', 'UK': 'GB',
};

// 6 Fast, independent IP Geolocation endpoints in priority order
const GEO_PROVIDERS = [
  { url: 'https://api.country.is/', extract: (d) => d?.country },
  { url: 'https://freeipapi.com/api/json', extract: (d) => d?.countryCode },
  { url: 'https://ipwho.is/', extract: (d) => d?.country_code },
  { url: 'https://api.ip.sb/geoip', extract: (d) => d?.country_code },
  { url: 'https://ipinfo.io/json', extract: (d) => d?.country },
  { url: 'https://api.db-ip.com/v2/free/self', extract: (d) => d?.countryCode },
];

/**
 * Shared marketplace country detection function for mobile (dizzitapp-v2).
 * Priority Order:
 *   1. Manual "Pay with" choice (manual parameter or AsyncStorage selection)
 *   2. IP providers tried sequentially with a short timeout (~2.5s), session-cached
 *   3. User's profile country
 *   4. SIM operator on mobile (Cellular.isoCountryCode)
 *   5. Finally no conversion (returns null -> product currency plus USD)
 *
 * Never derives country from device/system language (French does not mean France).
 *
 * @param {Object} [options]
 * @param {string} [options.manualCountry] - Manual override/selection from UI
 * @param {string} [options.userProfileCountry] - Profile/account country code or name
 * @returns {Promise<string|null>} 2-letter uppercase ISO country code, or null for no conversion
 */
export async function getEffectiveMarketplaceCountry(options = {}) {
  // 1. Manual "Pay with" choice
  if (options.manualCountry && typeof options.manualCountry === 'string') {
    const clean = options.manualCountry.trim().toUpperCase();
    if (clean.length === 2) return clean;
    if (COUNTRY_NAME_TO_CODE[clean]) return COUNTRY_NAME_TO_CODE[clean];
  }

  try {
    const manual = await AsyncStorage.getItem('dizzit_user_selected_country');
    if (manual && manual.trim().length === 2) {
      return manual.trim().toUpperCase();
    }
  } catch (e) {}

  // Session Cache check: if already resolved during this app session, return immediately
  // so every screen shows the same country and we do not call external APIs on every screen.
  if (memoryCountry) {
    return memoryCountry;
  }

  // Deduplicate concurrent detection calls across screens
  if (inFlightPromise) {
    return await inFlightPromise;
  }

  inFlightPromise = (async () => {
    // 2. IP providers tried one after another with short timeout (2.5s)
    for (const provider of GEO_PROVIDERS) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);

        const res = await fetch(provider.url, {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Mobile; DizzitApp)',
          },
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          const raw = provider.extract(data);

          if (raw && typeof raw === 'string') {
            const code = raw.trim().substring(0, 2).toUpperCase();
            if (/^[A-Z]{2}$/.test(code)) {
              memoryCountry = code;
              AsyncStorage.setItem('dizzit_detected_country', code).catch(() => {});
              return code;
            }
          }
        }
      } catch (e) {
        // Next provider
      }
    }

    // Backend Edge IP Detection fallback
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);
      const res = await fetch(BACKEND_GEO_URL, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' },
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data?.success && data.countryCode) {
          const code = data.countryCode.trim().substring(0, 2).toUpperCase();
          if (/^[A-Z]{2}$/.test(code)) {
            memoryCountry = code;
            AsyncStorage.setItem('dizzit_detected_country', code).catch(() => {});
            return code;
          }
        }
      }
    } catch (e) {}

    // Check previously stored detected country from AsyncStorage (offline session recovery)
    try {
      const cached = await AsyncStorage.getItem('dizzit_detected_country');
      if (cached && typeof cached === 'string' && /^[A-Z]{2}$/i.test(cached.trim())) {
        const code = cached.trim().toUpperCase();
        memoryCountry = code;
        return code;
      }
    } catch (e) {}

    // 3. User's profile country
    const profileCandidate = options.userProfileCountry;
    if (profileCandidate && typeof profileCandidate === 'string') {
      const clean = profileCandidate.trim().toUpperCase();
      if (/^[A-Z]{2}$/.test(clean)) {
        memoryCountry = clean;
        return clean;
      }
      if (COUNTRY_NAME_TO_CODE[clean]) {
        const code = COUNTRY_NAME_TO_CODE[clean];
        memoryCountry = code;
        return code;
      }
    }

    // 4. SIM operator on mobile
    try {
      if (Platform.OS !== 'web' && Cellular.isoCountryCode) {
        const simCode = Cellular.isoCountryCode.trim().substring(0, 2).toUpperCase();
        if (/^[A-Z]{2}$/.test(simCode)) {
          memoryCountry = simCode;
          AsyncStorage.setItem('dizzit_detected_country', simCode).catch(() => {});
          return simCode;
        }
      }
    } catch (e) {}

    // 5. Finally no conversion (product currency plus USD)
    return null;
  })();

  try {
    return await inFlightPromise;
  } finally {
    inFlightPromise = null;
  }
}

/**
 * Legacy wrapper: delegates to getEffectiveMarketplaceCountry
 */
export async function detectUserCountry(userProfileCountry) {
  return await getEffectiveMarketplaceCountry({ userProfileCountry });
}

export async function setManualCountry(code) {
  if (!code || typeof code !== 'string') return;
  const clean = code.trim().toUpperCase();
  if (clean.length === 2) {
    memoryCountry = clean;
    try {
      await AsyncStorage.setItem('dizzit_user_selected_country', clean);
    } catch (e) {}
  }
}

export async function clearManualCountry() {
  memoryCountry = null;
  try {
    await AsyncStorage.removeItem('dizzit_user_selected_country');
  } catch (e) {}
}

export async function getEffectiveCountry(userProfileCountry) {
  return await getEffectiveMarketplaceCountry({ userProfileCountry });
}

export function getCachedCountry() {
  return memoryCountry || null;
}

