import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import { Platform } from 'react-native';
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

  useEffect(() => {
    const syncUser = async (sessionObj) => {
      setSession(sessionObj);
      if (sessionObj?.user) {
        let fetchedName = sessionObj.user.user_metadata?.full_name || sessionObj.user.email.split('@')[0];
        let fetchedRole = 'user';
        let fetchedCountry = '';
        let fetchedAvatar = null;
        let newBalances = { DZY: 0 };
        
        try {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', sessionObj.user.id)
            .single();

          if (profile) {
            if (profile.role) fetchedRole = profile.role;
            if (profile.full_name) fetchedName = profile.full_name;
            if (profile.country_of_residence) fetchedCountry = profile.country_of_residence;
            if (profile.avatar_url) fetchedAvatar = profile.avatar_url;
            
            // If they are a merchant, see if they have a shop logo
            if (fetchedRole === 'merchant') {
              const { data: merchant } = await supabase
                .from('merchants')
                .select('shop_logo_url')
                .eq('user_id', profile.id)
                .maybeSingle();
                
              if (merchant?.shop_logo_url) {
                fetchedAvatar = merchant.shop_logo_url;
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

        setUser(prev => ({
          ...prev,
          name: fetchedName,
          email: sessionObj.user.email,
          role: fetchedRole,
          country: fetchedCountry,
          balanceDZY: newBalances.DZY || 0,
          allBalances: newBalances,
          ...(fetchedAvatar && { avatar: { uri: fetchedAvatar } }) // Dynamically override if exists
        }));
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
      t
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
