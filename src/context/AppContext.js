import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import { Platform, Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { SHOPS_MOCK } from '../mocks/shopsMock';
import { CONTACTS_MOCK } from '../mocks/contactsMock';
import enDict from '../i18n/locales/en.json';
import frDict from '../i18n/locales/fr.json';
import ptDict from '../i18n/locales/pt.json';
import amDict from '../i18n/locales/am.json';
import arDict from '../i18n/locales/ar.json';

const TRANSLATIONS = { en: enDict, fr: frDict, pt: ptDict, am: amDict, ar: arDict };
import { supabase } from '../services/supabaseClient';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [user, setUser] = useState({
    name: 'Utilisateur',
    email: '',
    avatar: require('../../assets/avatars/david.jpg'),
    balanceDZY: 0,
    allBalances: {},
    currency: 'DZY',
    role: 'user',
    country: '', // Dynamic via backend profile
  });
  
  const [session, setSession] = useState(null);
  const [isAppLocked, setIsAppLocked] = useState(false);
  const [isCheckingLock, setIsCheckingLock] = useState(true);

  useEffect(() => {
    const checkLockState = async () => {
      try {
        if (Platform.OS !== 'web') {
          const storedPin = await SecureStore.getItemAsync('user_pin');
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
        let newBalances = { DZY: 0 };
        let totalUsdValue = 0;
        
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
          const balanceRes = await fetch(`${DIZZY_URL}/wallet/balance`, {
            headers: { 'Authorization': `Bearer ${sessionObj.access_token}` }
          });
          
          if (balanceRes.ok) {
            const bData = await balanceRes.json();
            if (bData.balances) {
              bData.balances.forEach(b => {
                const cur = (b.currency || b.token || b.symbol || '').toUpperCase();
                if (cur) newBalances[cur] = parseFloat(b.balance || 0);
              });
            }
            if (bData.totalUsdValue !== undefined) {
              const usdVal = parseFloat(bData.totalUsdValue || 0);
              totalUsdValue = usdVal;
              // Special conversion: 10 DZY = 1 USD
              newBalances['DZY'] = usdVal * 10;
              newBalances['USD'] = usdVal;
              
              // Fetch live exchange rates to populate local fiat balances
              try {
                const rateRes = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
                if (rateRes.ok) {
                  const rateData = await rateRes.json();
                  const rates = rateData.rates || {};
                  
                  // Pre-calculate ALL global currencies for the wallet card
                  Object.keys(rates).forEach(fiat => {
                    newBalances[fiat] = usdVal * rates[fiat];
                  });
                }
              } catch (rateErr) {
                console.log("Exchange rate fetch failed, using fallbacks");
                newBalances['UGX'] = usdVal * 3750;
                newBalances['EUR'] = usdVal * 0.92;
                newBalances['XOF'] = usdVal * 605;
              }
            }
          }
        } catch (e) {
          console.log("Balance fetch failed:", e);
        }

        setUser({
          name: fetchedName,
          firstName: fetchedFirstName,
          lastName: fetchedLastName,
          role: fetchedRole,
          id: sessionObj.user.id,
          email: sessionObj.user.email,
          country: fetchedCountry,
          city: fetchedCity,
          phone: fetchedPhone,
          avatar: fetchedAvatar ? { uri: fetchedAvatar } : require('../../assets/avatars/david.jpg'),
          balanceDZY: newBalances.DZY,
          balanceUSDT: newBalances.USDT,
          balanceCFA: newBalances.XOF || newBalances.CFA,
          totalUsdValue: totalUsdValue,
          allBalances: newBalances,
          merchantProfile: fetchedMerchantProfile
        });
      }
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

  const toggleLanguage = useCallback(() => {
    const langs = ['en', 'fr', 'pt', 'ar', 'am'];
    setLanguage(prev => {
      const idx = langs.indexOf(prev);
      return langs[(idx + 1) % langs.length];
    });
  }, []);

  const t = useCallback((key, fallback = '') => {
    const langDict = TRANSLATIONS[language] || TRANSLATIONS.en;
    // Helper to traverse nested object paths (e.g. 'common.buttons.save')
    const getNestedValue = (obj, path) => {
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

  return (
    <AppContext.Provider value={{
      user,
      setUser,
      session,
      shops,
      contacts,
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
      setLanguage,
      toggleLanguage,
      t,
      isAppLocked,
      setIsAppLocked,
      isCheckingLock,
      updateUserProfile
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
