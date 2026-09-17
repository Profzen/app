import AsyncStorage from '@react-native-async-storage/async-storage';

let memoryCountry = null;

const COUNTRY_NAME_TO_CODE = {
  'ALGERIA': 'DZ', 'ALGÉRIE': 'DZ', 'ALGERIE': 'DZ',
  'BENIN': 'BJ', 'BÉNIN': 'BJ',
  'FRANCE': 'FR',
  'MOROCCO': 'MA', 'MAROC': 'MA',
  'TOGO': 'TG',
  'MADAGASCAR': 'MG',
  'SENEGAL': 'SN', 'SÉNÉGAL': 'SN',
  'IVORY COAST': 'CI', 'COTE D\'IVOIRE': 'CI', 'CÔTE D’IVOIRE': 'CI', 'COTE D’IVOIRE': 'CI',
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

/**
 * Detect user's actual physical country via IP geolocation with local caching.
 * Real IP location takes precedence over registration profile strings so traveling/diaspora
 * or testing users see their real physical payment rails.
 * @param {string} userProfileCountry - Optional fallback country code or name from user profile
 * @returns {Promise<string>} 2-letter ISO country code (e.g. 'DZ', 'MA', 'FR', 'TN', 'IN', 'BJ', 'TG', 'MG')
 */
export async function detectUserCountry(userProfileCountry) {
  // 1. Query fast IP geolocation services first (REAL PHYSICAL LOCATION)
  const geoApis = [
    'https://api.country.is/',
    'https://ipwho.is/',
    'https://api.ip.sb/geoip',
  ];

  for (const apiUrl of geoApis) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(apiUrl, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        let rawCode = null;
        if (apiUrl.includes('country.is')) rawCode = data.country;
        else if (apiUrl.includes('ipwho.is') || apiUrl.includes('ip.sb')) rawCode = data.country_code;

        if (rawCode && typeof rawCode === 'string') {
          const code = rawCode.trim().substring(0, 2).toUpperCase();
          if (code.length === 2) {
            memoryCountry = code;
            AsyncStorage.setItem('dizzit_detected_country', code).catch(() => {});
            return code;
          }
        }
      }
    } catch (e) {
      // Continue to next provider
    }
  }

  // 2. Fallback to memory cache
  if (memoryCountry) {
    return memoryCountry;
  }

  // 3. Fallback to AsyncStorage cache from previous IP detection
  try {
    const cached = await AsyncStorage.getItem('dizzit_detected_country');
    if (cached && cached.length === 2) {
      memoryCountry = cached;
      return cached;
    }
  } catch (e) {
    // Ignore cache read errors
  }

  // 4. Fallback to userProfileCountry only if IP detection failed (offline)
  if (userProfileCountry && typeof userProfileCountry === 'string') {
    const clean = userProfileCountry.trim().toUpperCase();
    if (clean.length === 2) {
      memoryCountry = clean;
      return clean;
    }
    if (COUNTRY_NAME_TO_CODE[clean]) {
      const code = COUNTRY_NAME_TO_CODE[clean];
      memoryCountry = code;
      return code;
    }
  }

  return 'DZ';
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
  return memoryCountry || 'DZ';
}

