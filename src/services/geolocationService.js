import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Cellular from 'expo-cellular';
import { Platform } from 'react-native';

let memoryCountry = null;
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
 * Detect user's actual physical country via IP geolocation with multiple fallbacks.
 * Queries fast IP providers sequentially with 2.5s timeouts.
 * @param {string} [userProfileCountry] - Optional fallback country code or name from profile/settings
 * @returns {Promise<string|null>} 2-letter ISO country code (e.g. 'FR', 'MG', 'DZ', 'BJ', 'US') or fallback
 */
export async function detectUserCountry(userProfileCountry) {
  // 1. Query fast IP geolocation services (REAL PHYSICAL LOCATION)
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
      // Failover to next IP provider immediately
    }
  }

  // 2. Priority 2: SIM Card Country Detection (Instant, VPN-proof)
  try {
    if (Platform.OS !== 'web' && Cellular.isoCountryCode) {
      const code = Cellular.isoCountryCode.toUpperCase();
      if (/^[A-Z]{2}$/.test(code)) {
        memoryCountry = code;
        AsyncStorage.setItem('dizzit_detected_country', code).catch(() => {});
        console.log("📍 Geolocation via SIM Card:", code);
        return code;
      }
    }
  } catch (e) {
    console.log("SIM Card detection failed", e);
  }

  // 3. Priority 3: Backend Edge IP Detection (Cloudflare / Hostinger proxy)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(BACKEND_GEO_URL, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data?.success && data.countryCode) {
        const code = data.countryCode.toUpperCase();
        memoryCountry = code;
        AsyncStorage.setItem('dizzit_detected_country', code).catch(() => {});
        console.log(`📍 Geolocation via Backend Edge (${data.source}):`, code);
        return code;
      }
    }
  } catch (e) {
    console.log("Backend Edge detection failed", e);
  }

  // 4. Fallback to memory cache from current session
  if (memoryCountry) {
    return memoryCountry;
  }

  // 3. Fallback to AsyncStorage cache from previous IP detection
  try {
    const cached = await AsyncStorage.getItem('dizzit_detected_country');
    if (cached && typeof cached === 'string' && /^[A-Z]{2}$/i.test(cached.trim())) {
      const code = cached.trim().toUpperCase();
      memoryCountry = code;
      return code;
    }
  } catch (e) {
    // Ignore cache read errors
  }

  // 4. Fallback to profile / settings country if provided
  if (userProfileCountry && typeof userProfileCountry === 'string') {
    const clean = userProfileCountry.trim().toUpperCase();
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

  return null;
}

export async function setManualCountry(code) {
  if (!code || typeof code !== 'string') return;
  const clean = code.trim().toUpperCase();
  if (clean.length === 2) {
    try {
      await AsyncStorage.setItem('dizzit_user_selected_country', clean);
    } catch (e) {}
  }
}

export async function clearManualCountry() {
  try {
    await AsyncStorage.removeItem('dizzit_user_selected_country');
  } catch (e) {}
}

export async function getEffectiveCountry(userProfileCountry) {
  // 1. Check if user manually selected a region in this device
  try {
    const manual = await AsyncStorage.getItem('dizzit_user_selected_country');
    if (manual && manual.length === 2) {
      return manual.toUpperCase();
    }
  } catch (e) {}

  // 2. Profile country if valid
  if (userProfileCountry && typeof userProfileCountry === 'string') {
    const clean = userProfileCountry.trim().toUpperCase();
    if (clean.length === 2) return clean;
  }

  // 3. Fallback to IP detection
  return await detectUserCountry();
}

export function getCachedCountry() {
  return memoryCountry || null;
}

