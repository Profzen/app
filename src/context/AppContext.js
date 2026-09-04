import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import { Platform, Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SHOPS_MOCK } from '../mocks/shopsMock';
import { CONTACTS_MOCK } from '../mocks/contactsMock';
import enDict from '../i18n/locales/en.json';
import frDict from '../i18n/locales/fr.json';
import ptDict from '../i18n/locales/pt.json';
import amDict from '../i18n/locales/am.json';
import arDict from '../i18n/locales/ar.json';

const TRANSLATIONS = { en: enDict, fr: frDict, pt: ptDict, am: amDict, ar: arDict };
import { supabase } from '../services/supabaseClient';
import { transactionService } from '../services/transactionService';

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
  const [transactions, setTransactions] = useState([]);
  const [isTransactionsLoading, setIsTransactionsLoading] = useState(false);
  const [isAppLocked, setIsAppLocked] = useState(false);
  const [isCheckingLock, setIsCheckingLock] = useState(true);
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
              fetchedEvmAddress = syncData.user.evmAddress || syncData.user.walletAddress || fetchedEvmAddress;
              fetchedSolanaAddress = syncData.user.solanaAddress || fetchedSolanaAddress;
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
              if (bData.balances) {
                rawBalancesArray = bData.balances;
                bData.balances.forEach(b => {
                  const cur = (b.currency || b.token || b.symbol || '').toUpperCase();
                  if (cur) newBalances[cur] = parseFloat(b.balance || 0);
                });
              }
              if (bData.totalUsdValue !== undefined) {
                const usdVal = parseFloat(bData.totalUsdValue || 0);
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
          }
          // Fetch business balance if merchant
          if (fetchedBusinessDizzyToken) {
            const bData = await fetchBalance(fetchedBusinessDizzyToken);
            if (bData) {
              if (bData.balances) {
                businessRawBalancesArray = bData.balances;
                bData.balances.forEach(b => {
                  const cur = (b.currency || b.token || b.symbol || '').toUpperCase();
                  if (cur) businessBalances[cur] = parseFloat(b.balance || 0);
                });
              }
              if (bData.totalUsdValue !== undefined) {
                const usdVal = parseFloat(bData.totalUsdValue || 0);
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
          balanceDZY: newBalances.DZY,
          balanceUSDT: newBalances.USDT,
          balanceCFA: newBalances.XOF || newBalances.CFA,
          totalUsdValue: totalUsdValue,
          allBalances: newBalances,
          rawBalances: rawBalancesArray,
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
      }
      setIsUserLoading(false);
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      syncUser(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      syncUser(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const [shops, setShops] = useState(SHOPS_MOCK);
  const [contacts, setContacts] = useState(CONTACTS_MOCK);
  const [favorites, setFavorites] = useState(['jumia-sn', '1']);
  const [cart, setCart] = useState([]);

  const [accountMode, setAccountMode] = useState('personal');
  const [hideBalance, setHideBalance] = useState(false);
  const [language, setLanguage] = useState('fr'); // 'en' | 'fr' | 'pt' | 'am' | 'ar'

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

  const t = useCallback((key, fallback = '') => {
    const langDict = TRANSLATIONS[language] || TRANSLATIONS.en;
    // Helper to traverse flat keys OR nested object paths (e.g. 'common.buttons.save')
    const getNestedValue = (obj, path) => {
      if (!obj || typeof obj !== 'object') return undefined;
      if (obj[path] !== undefined && obj[path] !== null) return obj[path];
      return path.split('.').reduce((acc, part) => acc && acc[part], obj);
    };
    
    let val = getNestedValue(langDict, key);
    
    // Check if the value is completely missing OR if it was a placeholder created by the extraction script
    const isMissing = val === undefined || val === null || val === '' || (typeof val === 'string' && val.startsWith('[MISSING:'));
    
    if (isMissing) {
      // Fallback to English if key missing in current language
      val = getNestedValue(TRANSLATIONS.en, key);
    }
    
    return val || fallback || key;
  }, [language]);

  const toggleFavorite = (id) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
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

  const addToCart = (product) => {
    setCart(prev => [...prev, product]);
  };

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
      addToCart,
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
      appSettings
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
