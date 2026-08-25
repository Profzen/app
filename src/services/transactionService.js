import { Platform } from 'react-native';
import { supabase } from './supabaseClient';
import { normalizeTransaction } from '../utils/transactionMapper';

let WALLET_API = process.env.EXPO_PUBLIC_DIZZY_WALLET_API_URL || 'http://localhost:5000/api';
let PAY_BILLS_API = process.env.EXPO_PUBLIC_PAY_BILLS_API_URL || 'http://localhost:4000/api';

// Dynamically swap localhost for the actual LAN IP when testing on mobile browsers
if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
  try {
    const swapHost = (url) => {
      const urlObj = new URL(url);
      if (urlObj.hostname === 'localhost') {
        urlObj.hostname = window.location.hostname;
        return urlObj.toString();
      }
      return url;
    };
    WALLET_API = swapHost(WALLET_API);
    PAY_BILLS_API = swapHost(PAY_BILLS_API);
  } catch (e) {
    console.warn('Failed to parse API URL for dynamic host swapping', e);
  }
} else if (Platform.OS === 'android') {
  WALLET_API = WALLET_API.replace('localhost', '10.0.2.2');
  PAY_BILLS_API = PAY_BILLS_API.replace('localhost', '10.0.2.2');
}

export const transactionService = {
  fetchUnifiedTransactions: async (userId, dizzyToken) => {
    if (!userId || !dizzyToken) return [];

    const headers = {
      Authorization: `Bearer ${dizzyToken}`,
      "Content-Type": "application/json",
    };

    try {
      const results = await Promise.allSettled([
        // 1. Wallet history (Crypto/Swap/Stake)
        fetch(`${WALLET_API}/wallet/history?chain=all`, { headers })
          .then(res => res.ok ? res.json() : { transactions: [] }),

        // 2. Remittance history (Supabase)
        supabase.from('remittance_transactions')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(50)
          .then(res => res.data || []),

        // 3. Marketplace history (Supabase)
        supabase.from('transactions')
          .select(`
            *,
            sponsor:sponsor_user_id(id, first_name, last_name, country_of_residence),
            beneficiary:beneficiary_user_id(id, first_name, last_name, country_of_residence),
            merchant:merchant_id(id, shop_name, shop_unique_id, city_village, country)
          `)
          .or(`sponsor_user_id.eq.${userId},beneficiary_user_id.eq.${userId},merchant_id.eq.${userId}`)
          .order('transaction_date', { ascending: false })
          .limit(50)
          .then(res => res.data || []),

        // 4. Pay Bills history
        fetch(`${WALLET_API}/auth/paybills-token`, { headers })
          .then(res => res.ok ? res.json() : null)
          .then(async (tokenData) => {
            if (!tokenData?.token) return { data: [] };
            const pbRes = await fetch(`${PAY_BILLS_API}/orderSummary/getAll?pageSize=50`, {
              headers: { "x-cross-domain-token": tokenData.token }
            });
            return pbRes.ok ? pbRes.json() : { data: [] };
          })
      ]);

      const [walletRes, remitRes, marketRes, pbRes] = results;

      let allTransactions = [];

      if (walletRes.status === 'fulfilled' && walletRes.value) {
        const txs = walletRes.value.transactions || [];
        allTransactions.push(...txs.map(tx => normalizeTransaction(tx, 'wallet', userId)));
      }

      if (remitRes.status === 'fulfilled' && remitRes.value) {
        const txs = remitRes.value || [];
        allTransactions.push(...txs.map(tx => normalizeTransaction(tx, 'remittance', userId)));
      }

      if (marketRes.status === 'fulfilled' && marketRes.value) {
        const txs = marketRes.value || [];
        allTransactions.push(...txs.map(tx => normalizeTransaction(tx, 'marketplace', userId)));
      }

      if (pbRes.status === 'fulfilled' && pbRes.value) {
        const txs = pbRes.value.data || [];
        allTransactions.push(...txs.map(tx => normalizeTransaction(tx, 'pay-bills', userId)));
      }

      // Deduplicate
      const uniqueMap = new Map();
      allTransactions.forEach(tx => {
        const ts = tx.timestamp instanceof Date && !isNaN(tx.timestamp.getTime()) 
          ? tx.timestamp.getTime() 
          : (tx.timestamp || tx.createdAt || Date.now());
        const key = (tx.id || tx.txHash || ts).toString().toLowerCase();
        if (!uniqueMap.has(key)) {
          uniqueMap.set(key, tx);
        }
      });

      const combined = Array.from(uniqueMap.values());
      combined.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      return combined;
    } catch (error) {
      console.error("Unified transaction fetch error:", error);
      return [];
    }
  },

  createMoMoOnrampOrder: async (dizzyToken, payload) => {
    if (!dizzyToken) throw new Error('Authentication required');
    const response = await fetch(`${WALLET_API}/momo/wallet/topup`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${dizzyToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.error || data.message || 'MoMo Top-Up Failed');
    }
    return data;
  },

  createCrossmintOnrampOrder: async (dizzyToken, payload) => {
    if (!dizzyToken) throw new Error('Authentication required');
    const response = await fetch(`${WALLET_API}/onramp/public/create-order`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${dizzyToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Crossmint Top-Up Failed');
    }
    return data;
  }
};
