import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import enDict from '../i18n/locales/en.json';
import frDict from '../i18n/locales/fr.json';
import ptDict from '../i18n/locales/pt.json';
import amDict from '../i18n/locales/am.json';
import arDict from '../i18n/locales/ar.json';

const TRANSLATIONS = { en: enDict, fr: frDict, pt: ptDict, am: amDict, ar: arDict };
import { supabase } from '../services/supabaseClient';
import { transactionService } from '../services/transactionService';
import contactService from '../services/contactService';
import { buyGoodsApi } from '../services/buyGoodsApi';
import { detectUserCountry, getCachedCountry, setManualCountry } from '../services/geolocationService';
import { notificationService } from '../services/notificationService';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [user, setUser] = useState({
    name: 'Utilisateur',
    email: '',
    avatar: null,
    balanceDZY: 0,
    allBalances: {},
    currency: 'DZY',
    role: 'user',
    country: '', // Dynamic via backend profile
  });
  
  const [session, setSession] = useState(null);
  const [isUserLoading, setIsUserLoading] = useState(true);

  // Instant Stale-While-Revalidate: load cached user immediately on mount
  useEffect(() => {
    const hydrateCachedUser = async () => {
      try {
        const cached = await AsyncStorage.getItem('@dizzitup_cached_user');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && (parsed.id || parsed.name)) {
            setUser(prev => ({ ...prev, ...parsed }));
            setIsUserLoading(false);
          }
        }
      } catch (err) {
        console.log("Error hydrating cached user:", err);
      }
    };
    hydrateCachedUser();
  }, []);

  const [detectedCountry, setDetectedCountry] = useState(getCachedCountry() || null);
  const [userSelectedCountry, setUserSelectedCountry] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const initGeolocation = async () => {
      try {
        const stored = await AsyncStorage.getItem('dizzit_user_selected_country');
        if (stored && stored.length === 2 && isMounted) {
          setUserSelectedCountry(stored.toUpperCase());
        }
        const detected = await detectUserCountry();
        if (detected && isMounted) {
          setDetectedCountry(detected);
        }
      } catch (err) {
        console.log("Error initializing geolocation:", err);
      }
    };
    initGeolocation();
    return () => { isMounted = false; };
  }, []);

  const userCountry = userSelectedCountry || 
    detectedCountry || 
    (user?.country_code && user.country_code.length === 2 ? user.country_code : null) || 
    (user?.country && user.country.length === 2 ? user.country : null) || 
    'DZ';

  /**
   * Rule 1 (Wallet): IP geolocation first, residence/account country fallback.
   * For the user/merchant wallet (Home & Dashboard), the currency follows the user's
   * current detected location. Account/residence country is only a fallback if geolocation fails.
   */
  const getEffectiveWalletCountry = (isBusinessCard = false) => {
    // Forward to POS logic if explicitly requested
    if (isBusinessCard === 'pos') {
      return getEffectivePosCountry();
    }

    // 1. Priority 1 for ALL WALLETS & MARKETPLACE: Physical IP geolocation or manual country selection
    // Wallets and marketplace prices should ALWAYS reflect the physical location of the user/smartphone 
    // so they know how much their balance is worth locally right now and can buy things in their local currency,
    // regardless of where their store is registered (which only applies to the POS).

    // 2. Priority 1 for PERSONAL WALLET: Physical IP geolocation or manual country selection
    if (userSelectedCountry && typeof userSelectedCountry === 'string' && userSelectedCountry.length === 2) {
      return userSelectedCountry.toUpperCase();
    }
    if (detectedCountry && typeof detectedCountry === 'string' && detectedCountry.length === 2) {
      return detectedCountry.toUpperCase();
    }

    // 3. Fallback for Wallets if IP geolocation fails
    if (isBusinessCard === true) {
      // Business Wallet Fallback: Merchant store country
      const bizCountry = user?.merchantProfile?.country || 
                         user?.merchantProfile?.country_code || 
                         user?.business_country || 
                         user?.company_country;
      if (bizCountry && typeof bizCountry === 'string' && bizCountry.trim().length >= 2) {
        return bizCountry.trim().toUpperCase();
      }
    }

    // Personal Wallet Fallback (or if Business Wallet has no country): User profile residence
    const userSettingsCountry = user?.country_of_residence || 
                                user?.residence_country || 
                                user?.country || 
                                user?.country_code ||
                                user?.profile?.country;
    if (userSettingsCountry && typeof userSettingsCountry === 'string' && userSettingsCountry.trim().length >= 2) {
      return userSettingsCountry.trim().toUpperCase();
    }

    // 4. Default fallback
    return 'US';
  };

  /**
   * Rule 2 (POS): Store/business country currency, regardless of current IP location.
   * For Merchant POS (Cash Register), use the store/business country (local currency).
   * No hardcoded country/business-specific logic. Works dynamically for every merchant, store, country.
   */
  const getEffectivePosCountry = () => {
    // 1. Priority 1: Store/business country currency (regardless of IP location)
    const bizCountry = user?.merchantProfile?.country || 
                       user?.merchantProfile?.country_code || 
                       user?.merchantProfile?.business_country || 
                       user?.business_country || 
                       user?.company_country;
    if (bizCountry && typeof bizCountry === 'string' && bizCountry.trim().length >= 2) {
      return bizCountry.trim().toUpperCase();
    }

    // 2. Priority 2: User account / residence country fallback
    const userSettingsCountry = userSelectedCountry || 
                                user?.country_of_residence || 
                                user?.residence_country || 
                                user?.country || 
                                user?.country_code ||
                                user?.profile?.country;
    if (userSettingsCountry && typeof userSettingsCountry === 'string' && userSettingsCountry.trim().length >= 2) {
      return userSettingsCountry.trim().toUpperCase();
    }

    // 3. Priority 3: Fallback to physical IP geolocation if no store/business country is available
    if (detectedCountry && typeof detectedCountry === 'string' && detectedCountry.length === 2) {
      return detectedCountry.toUpperCase();
    }

    // 4. Fallback
    return 'US';
  };

  const handleSetUserCountry = async (code) => {
    if (!code || typeof code !== 'string') return;
    const clean = code.trim().toUpperCase();
    if (clean.length === 2) {
      setUserSelectedCountry(clean);
      await setManualCountry(clean);
    }
  };

  const handleClearUserCountry = async () => {
    setUserSelectedCountry(null);
    try {
      await AsyncStorage.removeItem('dizzit_user_selected_country');
    } catch (e) {}
    const fresh = await detectUserCountry();
    if (fresh) setDetectedCountry(fresh);
  };

  const [cart, setCart] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [isTransactionsLoading, setIsTransactionsLoading] = useState(false);
  const [isAppLocked, setIsAppLocked] = useState(false);
  const [isCheckingLock, setIsCheckingLock] = useState(true);

  // Cart Hydration
  useEffect(() => {
    const hydrateCart = async () => {
      try {
        const stored = await AsyncStorage.getItem('@dizzitup_cart');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setCart(parsed);
          }
        }
      } catch (err) {
        console.log("Error hydrating cart:", err);
      }
    };
    hydrateCart();
  }, []);

  const [appSettings, setAppSettings] = useState({
    support_email: 'support@dizzitup.com',
    whatsapp_number: '+228 90 00 00 00',
    help_center_url: 'dizzitup.com/faq',
    refer_user_reward: 5,
    refer_business_reward: 10
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('app_settings')
          .select('*')
          .maybeSingle();
        if (data && !error) {
          setAppSettings(prev => ({ ...prev, ...data }));
        }
      } catch (err) {
        console.log("Error fetching app settings:", err);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    const checkLockState = async () => {
      try {
        if (Platform.OS !== 'web') {
          // Add a 2-second timeout to prevent the app from getting stuck on Android if SecureStore hangs
          const storedPin = await Promise.race([
            SecureStore.getItemAsync('user_pin'),
            new Promise((resolve) => setTimeout(() => resolve(null), 2000))
          ]);
          if (storedPin) {
            setIsAppLocked(true);
          }
        }
      } catch (error) {
        console.log("Error checking secure store:", error);
      } finally {
        setIsCheckingLock(false);
      }
    };
    checkLockState();
  }, []);

  useEffect(() => {
    const syncUser = async (sessionObj) => {
      setSession(sessionObj);
      setIsUserLoading(true);
      if (sessionObj?.user) {
        let fetchedName = sessionObj.user.user_metadata?.full_name || sessionObj.user.email.split('@')[0];
        let fetchedFirstName = '';
        let fetchedLastName = '';
        let fetchedRole = 'user';
        let fetchedCountry = '';
        let fetchedCity = '';
        let fetchedPhone = '';
        let fetchedAvatar = null;
        let fetchedMerchantProfile = null;
        let fetchedEvmAddress = '';
        let fetchedSolanaAddress = '';
        let fetchedBusinessEvmAddress = '';
        let fetchedBusinessSolanaAddress = '';
        let fetchedDizzyToken = '';
        let fetchedBusinessDizzyToken = '';
        let newBalances = { DZY: 0 };
        let businessBalances = { DZY: 0 };
        let totalUsdValue = 0;
        let rawBalancesArray = [];
        let businessRawBalancesArray = [];
        let businessTotalUsdValue = 0;
        
        try {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', sessionObj.user.id)
            .single();

          if (profile) {
            if (profile.role) fetchedRole = profile.role;
            
            // OPTION 1: Smart Routing. We do NOT block merchants. 
            // We fetch their profile, and the UI will dynamically show/hide features based on `fetchedRole`.

            if (profile.first_name) fetchedFirstName = profile.first_name;
            if (profile.last_name) fetchedLastName = profile.last_name;

            if (profile.full_name) {
               fetchedName = profile.full_name;
            } else if (fetchedFirstName || fetchedLastName) {
               fetchedName = `${fetchedFirstName} ${fetchedLastName}`.trim();
            }

            if (profile.country_of_residence) fetchedCountry = profile.country_of_residence;
            if (profile.city_of_residence) fetchedCity = profile.city_of_residence;
            if (profile.mobile_number) fetchedPhone = profile.mobile_number;
            if (profile.avatar_url) fetchedAvatar = profile.avatar_url;
            if (profile.evm_wallet_address) fetchedEvmAddress = profile.evm_wallet_address;
            if (profile.solana_wallet_address) fetchedSolanaAddress = profile.solana_wallet_address;
            
            // If they are a merchant, fetch full business profile
            if (fetchedRole === 'merchant') {
              const { data: merchant } = await supabase
                .from('merchants')
                .select('*')
                .eq('user_id', profile.id)
                .maybeSingle();
                
              if (merchant) {
                if (merchant.shop_logo_url) fetchedAvatar = merchant.shop_logo_url;
                fetchedMerchantProfile = merchant;
              }
            }
          }
        } catch (e) {
          console.log("Profile fetch failed:", e);
        }

        fetchedDizzyToken = sessionObj.access_token; // Fallback
        try {
          let DIZZY_URL = process.env.EXPO_PUBLIC_DIZZY_WALLET_API_URL || 'http://localhost:5000/api';
          if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
            try {
              const urlObj = new URL(DIZZY_URL);
              if (urlObj.hostname === 'localhost') {
                urlObj.hostname = window.location.hostname;
                DIZZY_URL = urlObj.toString();
              }
            } catch (e) {}
          } else if (Platform.OS === 'android' && DIZZY_URL.includes('localhost')) {
            DIZZY_URL = DIZZY_URL.replace('localhost', '10.0.2.2');
          }

          console.log("calling sync-buygoods for email:", sessionObj.user.email);
          const syncRes = await fetch(`${DIZZY_URL}/auth/sync-buygoods`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: sessionObj.user.email,
              supabaseUserId: sessionObj.user.id,
              authProvider: 'EMAIL'
            })
          });
          if (syncRes.ok) {
            const syncData = await syncRes.json();
            console.log("sync-buygoods success, evmAddress:", syncData.user?.evmAddress);
            if (syncData.token) {
              fetchedDizzyToken = syncData.token;
            }
            if (syncData.user) {
              // Only use sync-buygoods address as fallback — do NOT overwrite the user's
              // primary dizzy-wallet address (from Supabase evm_wallet_address)
              if (!fetchedEvmAddress) {
                fetchedEvmAddress = syncData.user.evmAddress || syncData.user.walletAddress || '';
              }
              if (!fetchedSolanaAddress) {
                fetchedSolanaAddress = syncData.user.solanaAddress || '';
              }
            }
          } else {
            console.log("sync-buygoods failed with status:", syncRes.status);
          }

          console.log("fetchedRole:", fetchedRole, "merchantProfile:", !!fetchedMerchantProfile);
          if (fetchedRole === 'merchant' && fetchedMerchantProfile && fetchedMerchantProfile.id) {
            console.log("calling sync-crossmint for biz_" + fetchedMerchantProfile.id);
            const bizSyncRes = await fetch(`${DIZZY_URL}/auth/sync-crossmint`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                supabaseUserId: 'biz_' + fetchedMerchantProfile.id,
                email: sessionObj.user.email,
                authProvider: 'EMAIL',
                allowWalletCreation: true
              })
            });
            if (bizSyncRes.ok) {
              const bizSyncData = await bizSyncRes.json();
              console.log("sync-crossmint success, evmAddress:", bizSyncData.user?.evmAddress);
              if (bizSyncData.token) {
                fetchedBusinessDizzyToken = bizSyncData.token;
              }
              if (bizSyncData.user) {
                fetchedBusinessEvmAddress = bizSyncData.user.evmAddress || bizSyncData.user.walletAddress || '';
                fetchedBusinessSolanaAddress = bizSyncData.user.solanaAddress || '';
              }
            } else {
              console.log("sync-crossmint failed with status:", bizSyncRes.status);
              const errData = await bizSyncRes.text();
              console.log("sync-crossmint error response:", errData);
            }
          }
        } catch (e) {
          console.log("Failed to fetch dizzyToken:", e);
        }

        try {
          let DIZZY_URL = process.env.EXPO_PUBLIC_DIZZY_WALLET_API_URL || 'http://localhost:5000/api';
          if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
            try {
              const urlObj = new URL(DIZZY_URL);
              if (urlObj.hostname === 'localhost') {
                urlObj.hostname = window.location.hostname;
                DIZZY_URL = urlObj.toString();
              }
            } catch (e) {}
          } else if (Platform.OS === 'android' && DIZZY_URL.includes('localhost')) {
            // Android emulator maps 10.0.2.2 to the host machine's localhost
            DIZZY_URL = DIZZY_URL.replace('localhost', '10.0.2.2');
          }
          const fetchBalance = async (token) => {
            const res = await fetch(`${DIZZY_URL}/wallet/balance`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
              return await res.json();
            }
            return null;
          };

          // Fetch personal balance using dizzyToken
          if (fetchedDizzyToken) {
            const bData = await fetchBalance(fetchedDizzyToken);
            if (bData) {
              let sumPersonalTokensUsd = 0;
              if (bData.balances) {
                rawBalancesArray = bData.balances;
                bData.balances.forEach(b => {
                  const cur = (b.currency || b.token || b.symbol || '').toUpperCase();
                  const bal = parseFloat(b.balance || 0);
                  if (cur) newBalances[cur] = bal;
                  const uv = parseFloat(b.usdValue);
                  if (!isNaN(uv) && uv > 0) {
                    sumPersonalTokensUsd += uv;
                  } else if (['USDT', 'USDC', 'USD'].includes(cur)) {
                    sumPersonalTokensUsd += bal;
                  } else if (cur === 'EURC') {
                    sumPersonalTokensUsd += bal * 1.08;
                  }
                });
              }
              const backendUsd = bData.totalUsdValue !== undefined ? parseFloat(bData.totalUsdValue || 0) : 0;
              const usdVal = Math.max(backendUsd, sumPersonalTokensUsd);
              totalUsdValue = usdVal;
              newBalances['DZY'] = usdVal * 10;
              newBalances['USD'] = usdVal;
              try {
                const rateRes = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
                if (rateRes.ok) {
                  const rateData = await rateRes.json();
                  const rates = rateData.rates || {};
                  Object.keys(rates).forEach(fiat => {
                    newBalances[fiat] = usdVal * rates[fiat];
                  });
                }
              } catch (rateErr) {
                newBalances['UGX'] = usdVal * 3750;
                newBalances['EUR'] = usdVal * 0.92;
                newBalances['XOF'] = usdVal * 605;
              }
            }
          }
          // Fetch business balance if merchant
          if (fetchedBusinessDizzyToken) {
            const bData = await fetchBalance(fetchedBusinessDizzyToken);
            if (bData) {
              let sumBusinessTokensUsd = 0;
              if (bData.balances) {
                businessRawBalancesArray = bData.balances;
                bData.balances.forEach(b => {
                  const cur = (b.currency || b.token || b.symbol || '').toUpperCase();
                  const bal = parseFloat(b.balance || 0);
                  if (cur) businessBalances[cur] = bal;
                  const uv = parseFloat(b.usdValue);
                  if (!isNaN(uv) && uv > 0) {
                    sumBusinessTokensUsd += uv;
                  } else if (['USDT', 'USDC', 'USD'].includes(cur)) {
                    sumBusinessTokensUsd += bal;
                  } else if (cur === 'EURC') {
                    sumBusinessTokensUsd += bal * 1.08;
                  }
                });
              }
              const backendBizUsd = bData.totalUsdValue !== undefined ? parseFloat(bData.totalUsdValue || 0) : 0;
              const usdVal = Math.max(backendBizUsd, sumBusinessTokensUsd);
              businessTotalUsdValue = usdVal;
              businessBalances['DZY'] = usdVal * 10;
              businessBalances['USD'] = usdVal;
              const knownCryptoTokens = ['POL', 'USDT', 'USDC', 'ETH', 'BTC', 'WBTC', 'SOL', 'MATIC', 'BNB', 'DAI'];
              Object.keys(newBalances).forEach(key => {
                if (key !== 'DZY' && key !== 'USD' && !knownCryptoTokens.includes(key) && newBalances[key]) {
                   businessBalances[key] = (newBalances[key] / (newBalances['USD'] || 1)) * usdVal;
                }
              });
            }
          }
        } catch (e) {
          console.log("Balance fetch failed:", e);
        }

        try {
          setIsTransactionsLoading(true);
          const txs = await transactionService.fetchUnifiedTransactions(sessionObj.user.id, fetchedDizzyToken);
          setTransactions(txs);
        } catch (e) {
          console.log("Transaction fetch failed:", e);
        } finally {
          setIsTransactionsLoading(false);
        }

        const isMerchant = fetchedRole === 'merchant';
        const primaryBalances = (isMerchant && (businessTotalUsdValue > 0 || Object.keys(businessBalances).length > 0))
          ? businessBalances
          : newBalances;
        const primaryRawBalances = (isMerchant && businessRawBalancesArray.length > 0)
          ? businessRawBalancesArray
          : rawBalancesArray;
        const primaryTotalUsd = (isMerchant && businessTotalUsdValue > 0)
          ? businessTotalUsdValue
          : totalUsdValue;

        const fullUserData = {
          name: fetchedName,
          firstName: fetchedFirstName,
          lastName: fetchedLastName,
          role: fetchedRole,
          id: sessionObj.user.id,
          email: sessionObj.user.email,
          country: fetchedCountry,
          city: fetchedCity,
          phone: fetchedPhone,
          avatar: fetchedAvatar ? { uri: fetchedAvatar } : null,
          balanceDZY: primaryBalances.DZY ?? (primaryTotalUsd * 10),
          balanceUSDT: primaryBalances.USDT,
          balanceCFA: primaryBalances.XOF || primaryBalances.CFA,
          totalUsdValue: primaryTotalUsd,
          allBalances: primaryBalances,
          rawBalances: primaryRawBalances,
          personalBalances: newBalances,
          personalRawBalances: rawBalancesArray,
          personalTotalUsdValue: totalUsdValue,
          merchantProfile: fetchedMerchantProfile,
          evmAddress: fetchedEvmAddress,
          solanaAddress: fetchedSolanaAddress,
          businessEvmAddress: fetchedBusinessEvmAddress,
          businessSolanaAddress: fetchedBusinessSolanaAddress,
          dizzyToken: fetchedDizzyToken,
          businessDizzyToken: fetchedBusinessDizzyToken,
          businessBalances: businessBalances,
          businessRawBalances: businessRawBalancesArray,
          businessTotalUsdValue: businessTotalUsdValue
        };
        setUser(fullUserData);
        AsyncStorage.setItem('@dizzitup_cached_user', JSON.stringify(fullUserData)).catch(() => {});
        
        if (contactService?.getBeneficiaries) {
          contactService.getBeneficiaries(sessionObj.user.id).then(res => {
            if (res && res.success && Array.isArray(res.data)) {
              setContacts(res.data);
            }
          }).catch(err => console.log('Error fetching beneficiaries:', err));
        }

        // Auto-register and sync Expo Push Token to user_profiles table in Supabase
        if (sessionObj.user.id) {
          notificationService.registerForPushNotificationsAsync().then(token => {
            if (token) {
              notificationService.syncPushTokenToSupabase(sessionObj.user.id, token);
            }
          }).catch(err => console.log('Auto push registration error:', err));
        }
      } else {
        setContacts([]);
      }
      setIsUserLoading(false);
    };

    let lastToken = null;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.access_token !== lastToken) {
        lastToken = session?.access_token;
        syncUser(session);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.access_token !== lastToken) {
        lastToken = session?.access_token;
        syncUser(session);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const [shops, setShops] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [favorites, setFavorites] = useState([]);

  // Hydrate favorites from AsyncStorage
  useEffect(() => {
    const hydrateFavorites = async () => {
      try {
        const stored = await AsyncStorage.getItem('@dizzitup_favorites');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) setFavorites(parsed);
        }
      } catch (e) {}
    };
    hydrateFavorites();
  }, []);

  // Hydrate shops dynamically from buyGoodsApi
  useEffect(() => {
    buyGoodsApi.getMerchants().then(data => {
      if (Array.isArray(data) && data.length > 0) {
        setShops(data);
      }
    }).catch(() => {});
  }, []);

  const [accountMode, setAccountMode] = useState('personal');
  const [hideBalance, setHideBalance] = useState(false);
  const [language, setLanguage] = useState('en'); // Default to English for international & tester consistency ('en' | 'fr' | 'pt' | 'am' | 'ar')

  const handleSetLanguage = useCallback((newLang) => {
    const saveLang = (lang) => {
      if (Platform.OS === 'web') {
        try {
          if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.setItem('app_language', lang);
          }
        } catch (e) {}
      } else {
        SecureStore.setItemAsync('app_language', lang).catch(() => {});
      }
    };

    if (typeof newLang === 'function') {
      setLanguage(prev => {
        const result = newLang(prev);
        saveLang(result);
        return result;
      });
    } else {
      saveLang(newLang);
      setLanguage(newLang);
    }
  }, []);

  useEffect(() => {
    const loadLanguage = async () => {
      try {
        if (Platform.OS === 'web') {
          if (typeof window !== 'undefined' && window.localStorage) {
            const webLang = window.localStorage.getItem('app_language');
            if (webLang) setLanguage(webLang);
          }
        } else {
          const storedLang = await SecureStore.getItemAsync('app_language');
          if (storedLang) setLanguage(storedLang);
        }
      } catch (err) {}
    };
    loadLanguage();
  }, []);

  const toggleLanguage = useCallback(() => {
    const langs = ['en', 'fr', 'pt', 'ar', 'am'];
    handleSetLanguage(prev => {
      const idx = langs.indexOf(prev);
      return langs[(idx + 1) % langs.length];
    });
  }, [handleSetLanguage]);

  const t = useCallback((key, fallbackOrParams = '', maybeParams = null) => {
    let fallback = typeof fallbackOrParams === 'string' 
      ? fallbackOrParams 
      : (fallbackOrParams && typeof fallbackOrParams === 'object' && fallbackOrParams.defaultValue) 
        ? fallbackOrParams.defaultValue 
        : '';
    let params = (typeof fallbackOrParams === 'object' && fallbackOrParams !== null) ? fallbackOrParams : maybeParams;

    const langDict = TRANSLATIONS[language] || TRANSLATIONS.en;
    // Helper to traverse flat keys OR nested object paths (e.g. 'common.buttons.save')
    const getNestedValue = (obj, path) => {
      if (!obj || typeof obj !== 'object' || !path || typeof path !== 'string') return undefined;
      let target;
      if (obj[path] !== undefined && obj[path] !== null) {
        target = obj[path];
      } else {
        target = path.split('.').reduce((acc, part) => (acc && typeof acc === 'object') ? acc[part] : undefined, obj);
      }
      if (typeof target === 'string') return target;
      if (typeof target === 'object' && target !== null && typeof target.title === 'string') {
        return target.title;
      }
      return undefined;
    };
    
    let val = getNestedValue(langDict, key);
    
    // Check if the value is completely missing OR if it was a placeholder created by the extraction script
    const isMissing = val === undefined || val === null || val === '' || (typeof val === 'string' && val.startsWith('[MISSING:'));
    
    if (isMissing) {
      // Fallback to English if key missing in current language
      val = getNestedValue(TRANSLATIONS.en, key);
    }
    
    let result = val || fallback || key;

    if (params && typeof params === 'object' && typeof result === 'string') {
      result = result.replace(/\{\{(\w+)\}\}/g, (_, k) => {
        return params[k] !== undefined && params[k] !== null ? String(params[k]) : `{{${k}}}`;
      });
    }

    return result;
  }, [language]);

  const toggleFavorite = (id) => {
    setFavorites(prev => {
      const updated = prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id];
      AsyncStorage.setItem('@dizzitup_favorites', JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  };

  const updateUserProfile = async (payload) => {
    if (!user?.id) return { success: false, error: "Not logged in" };
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(payload)
        .eq('id', user.id)
        .select()
        .single();
        
      if (error) throw error;
      
      // Update local state smoothly
      setUser(prev => {
        const newFirst = payload.first_name !== undefined ? payload.first_name : prev.firstName;
        const newLast = payload.last_name !== undefined ? payload.last_name : prev.lastName;
        let newName = prev.name;
        if (payload.first_name !== undefined || payload.last_name !== undefined) {
          newName = `${newFirst || ''} ${newLast || ''}`.trim();
        }

        return {
          ...prev,
          firstName: newFirst,
          lastName: newLast,
          name: newName,
          country: payload.country_of_residence !== undefined ? payload.country_of_residence : prev.country,
          city: payload.city_of_residence !== undefined ? payload.city_of_residence : prev.city,
          phone: payload.mobile_number !== undefined ? payload.mobile_number : prev.phone,
        };
      });
      return { success: true, data };
    } catch (e) {
      console.log("Update profile error:", e);
      return { success: false, error: e.message };
    }
  };

  const saveCartToStorage = async (newCart) => {
    setCart(newCart);
    try {
      await AsyncStorage.setItem('@dizzitup_cart', JSON.stringify(newCart));
    } catch (err) {
      console.log("Error saving cart to storage:", err);
    }
  };

  const addToCart = (product, quantity = 1, merchant = null, force = false) => {
    if (!product) return { success: false };

    // Extract numerical price
    let rawPrice = product.price;
    if (typeof rawPrice === 'string') {
      rawPrice = parseFloat(rawPrice.replace(/[^0-9.]/g, '')) || 0;
    } else if (product.variants?.[0]?.prices?.[0]?.amount) {
      rawPrice = parseFloat(product.variants[0].prices[0].amount) || 0;
    }
    const numPrice = Number(rawPrice) || 0;

    const mId = merchant?.id || product.merchant_id || product.merchant?.id || product.raw?.id || null;
    const mName = merchant?.shop_name || merchant?.name || product.merchant?.shop_name || product.merchant?.name || t('paymentSuccess.partnerMerchant', 'Commerçant Partenaire');
    const mCountry = merchant?.country || product.merchant?.country || '';
    const mCity = merchant?.city_village || product.merchant?.city_village || '';

    // Single-merchant constraint check
    if (cart.length > 0 && !force) {
      const existingMerchantId = cart[0].merchantId;
      if (mId && existingMerchantId && mId !== existingMerchantId) {
        return {
          success: false,
          conflict: true,
          currentMerchantName: cart[0].merchantName,
          newMerchantName: mName,
        };
      }
    }

    const itemImage = (product.product_images && product.product_images.length > 0)
      ? product.product_images[0]
      : (product.images && product.images.length > 0)
      ? product.images[0]
      : product.thumbnail || product.image || null;

    const newItem = {
      id: product.id || product._id || `item_${Date.now()}`,
      productId: product.id || product._id || `p_${Date.now()}`,
      name: product.title || product.name || t('product.notFound', 'Produit'),
      price: numPrice,
      currency: product.currency || 'XOF',
      quantity: Math.max(1, Number(quantity) || 1),
      image: itemImage,
      merchantId: mId,
      merchantName: mName,
      merchantCountry: mCountry,
      merchantCity: mCity,
      category: product.category || 'Marketplace',
    };

    let updated;
    if (force && cart.length > 0 && cart[0].merchantId !== mId) {
      updated = [newItem];
    } else {
      const existingIndex = cart.findIndex(i => (i.productId === newItem.productId || i.id === newItem.id));
      if (existingIndex > -1) {
        updated = [...cart];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + newItem.quantity,
        };
      } else {
        updated = [...cart, newItem];
      }
    }

    saveCartToStorage(updated);
    return { success: true, count: updated.reduce((acc, i) => acc + (i.quantity || 1), 0) };
  };

  const removeFromCart = (productId) => {
    const updated = cart.filter(i => i.productId !== productId && i.id !== productId);
    saveCartToStorage(updated);
  };

  const updateCartQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    const updated = cart.map(i => {
      if (i.productId === productId || i.id === productId) {
        return { ...i, quantity: newQuantity };
      }
      return i;
    });
    saveCartToStorage(updated);
  };

  const clearCart = () => {
    saveCartToStorage([]);
  };

  const cartCount = cart.reduce((acc, i) => acc + (Number(i.quantity) || 1), 0);
  const cartTotal = cart.reduce((acc, i) => acc + ((Number(i.price) || 0) * (Number(i.quantity) || 1)), 0);
  const cartMerchant = cart.length > 0 ? {
    id: cart[0].merchantId,
    name: cart[0].merchantName,
    country: cart[0].merchantCountry,
    city: cart[0].merchantCity,
  } : null;

  const updateBalance = (amountDZY) => {
    setUser(prev => ({
      ...prev,
      balanceDZY: prev.balanceDZY + amountDZY
    }));
  };

  const toggleHideBalance = () => setHideBalance(prev => !prev);

  const refreshTransactions = async () => {
    if (!session?.user?.id) return;
    try {
      setIsTransactionsLoading(true);
      const tokenToUse = user?.dizzyToken || session?.access_token;
      const txs = await transactionService.fetchUnifiedTransactions(session.user.id, tokenToUse);
      setTransactions(txs);
    } catch (e) {
      console.log("Manual transaction refresh failed:", e);
    } finally {
      setIsTransactionsLoading(false);
    }
  };

  return (
    <AppContext.Provider value={{
      user,
      setUser,
      isUserLoading,
      session,
      shops,
      contacts,
      transactions,
      isTransactionsLoading,
      refreshTransactions,
      favorites,
      toggleFavorite,
      cart,
      setCart,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      cartCount,
      cartTotal,
      cartMerchant,
      updateBalance,
      accountMode,
      setAccountMode,
      hideBalance,
      toggleHideBalance,
      language,
      setLanguage: handleSetLanguage,
      toggleLanguage,
      t,
      isAppLocked,
      setIsAppLocked,
      isCheckingLock,
      updateUserProfile,
      appSettings,
      userCountry,
      detectedCountry,
      getEffectiveWalletCountry,
      getEffectivePosCountry,
      setUserCountry: handleSetUserCountry,
      clearUserCountry: handleClearUserCountry,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
