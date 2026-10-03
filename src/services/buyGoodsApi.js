import { Platform } from 'react-native';

let BASE_URL = process.env.EXPO_PUBLIC_BUY_GOODS_API_URL || 'http://localhost:3001/api';

// Dynamically swap localhost for the actual LAN IP when testing on mobile browsers or other devices on the same network
if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
  try {
    const urlObj = new URL(BASE_URL);
    if (urlObj.hostname === 'localhost') {
      urlObj.hostname = window.location.hostname;
      BASE_URL = urlObj.toString();
    }
  } catch (e) {
    console.warn('Failed to parse API URL for dynamic host swapping', e);
  }
} else if (Platform.OS === 'android' && BASE_URL.includes('localhost')) {
  // Android emulator maps 10.0.2.2 to the host machine's localhost
  BASE_URL = BASE_URL.replace('localhost', '10.0.2.2');
}

export const buyGoodsApi = {
  searchGlobal: async (query = '', { type = 'all', country = '' } = {}) => {
    try {
      if (!query || query.trim().length < 2) return [];
      const params = new URLSearchParams();
      params.append('q', query.trim());
      if (type && type !== 'all') params.append('type', type);
      if (country) params.append('country', country);
      const response = await fetch(`${BASE_URL}/search?${params.toString()}`);
      if (!response.ok) return [];
      const data = await response.json();
      const rawList = Array.isArray(data) ? data : data?.results;
      if (!Array.isArray(rawList)) return [];
      const seen = new Set();
      return rawList.filter(item => {
        const key = `${item.entity_type || 'item'}_${item.entity_id || item.id || item.title}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    } catch (error) {
      console.warn('buyGoodsApi.searchGlobal Error:', error);
      return [];
    }
  },

  searchSuggestions: async (query = '') => {
    try {
      if (!query || !query.trim()) return { suggestions: [] };
      const response = await fetch(`${BASE_URL}/search/suggest?q=${encodeURIComponent(query.trim())}`);
      if (!response.ok) return { suggestions: [] };
      const data = await response.json();
      return { suggestions: Array.isArray(data?.suggestions) ? data.suggestions : [] };
    } catch (error) {
      console.warn('buyGoodsApi.searchSuggestions Error:', error);
      return { suggestions: [] };
    }
  },

  getMerchants: async (query = '') => {
    try {
      if (query && query.length >= 2) {
        const response = await fetch(`${BASE_URL}/public/merchants/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        return data.merchants || [];
      } else {
        const response = await fetch(`${BASE_URL}/public/products`);
        const data = await response.json();
        if (data.products) {
          const merchantsMap = new Map();
          data.products.forEach(p => {
            if (p.merchant && !merchantsMap.has(p.merchant.id)) {
              merchantsMap.set(p.merchant.id, p.merchant);
            }
          });
          return Array.from(merchantsMap.values());
        }
        return [];
      }
    } catch (error) {
      console.error('buyGoodsApi.getMerchants Error:', error);
      throw error;
    }
  },

  getStoreDetails: async (slug) => {
    try {
      const response = await fetch(`${BASE_URL}/public/stores/${slug}`);
      if (!response.ok) throw new Error('Failed to fetch store details');
      return await response.json();
    } catch (error) {
      console.error('buyGoodsApi.getStoreDetails Error:', error);
      throw error;
    }
  },

  getMerchantProducts: async (merchantId) => {
    try {
      const all = await buyGoodsApi.getAllProducts();
      return all.filter(p => (p.merchant_id === merchantId || p.merchant?.id === merchantId));
    } catch (error) {
      console.error('buyGoodsApi.getMerchantProducts Error:', error);
      return [];
    }
  },

  getAllProducts: async (category = '') => {
    try {
      let url = `${BASE_URL}/public/products`;
      if (category) url += `?category=${encodeURIComponent(category)}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      return data.products || [];
    } catch (error) {
      console.error('buyGoodsApi.getAllProducts Error:', error);
      throw error;
    }
  },
  
  getProductById: async (id) => {
    try {
      const response = await fetch(`${BASE_URL}/public/products/${id}`);
      if (!response.ok) throw new Error('Failed to fetch product');
      const data = await response.json();
      return data.product || null;
    } catch (error) {
      console.error('buyGoodsApi.getProductById Error:', error);
      throw error;
    }
  },

  getUserNotifications: async (userId) => {
    try {
      const response = await fetch(`${BASE_URL}/user-notifications/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch user notifications');
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('buyGoodsApi.getUserNotifications Error:', error);
      throw error;
    }
  },

  markUserNotificationAsRead: async (notificationId) => {
    try {
      const response = await fetch(`${BASE_URL}/user-notifications/${notificationId}/read`, { method: 'PATCH' });
      return response.ok;
    } catch (error) {
      console.error('buyGoodsApi.markUserNotificationAsRead Error:', error);
      return false;
    }
  },

  markAllUserNotificationsAsRead: async (userId) => {
    try {
      const response = await fetch(`${BASE_URL}/user-notifications/user/${userId}/read-all`, { method: 'PATCH' });
      return response.ok;
    } catch (error) {
      console.error('buyGoodsApi.markAllUserNotificationsAsRead Error:', error);
      return false;
    }
  },

  getMerchantNotifications: async (merchantId, token) => {
    try {
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const response = await fetch(`${BASE_URL}/merchant/notifications?merchantId=${merchantId}`, { headers });
      if (!response.ok) throw new Error('Failed to fetch merchant notifications');
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('buyGoodsApi.getMerchantNotifications Error:', error);
      throw error;
    }
  },

  markMerchantNotificationAsRead: async (notificationId, token) => {
    try {
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const response = await fetch(`${BASE_URL}/merchant/notifications/${notificationId}/read`, { 
        method: 'PATCH',
        headers
      });
      return response.ok;
    } catch (error) {
      console.error('buyGoodsApi.markMerchantNotificationAsRead Error:', error);
      return false;
    }
  },

  markAllMerchantNotificationsAsRead: async (merchantId, token) => {
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      
      const response = await fetch(`${BASE_URL}/merchant/notifications/read-all`, { 
        method: 'PATCH',
        headers,
        body: JSON.stringify({ merchantId })
      });
      return response.ok;
    } catch (error) {
      console.error('buyGoodsApi.markAllMerchantNotificationsAsRead Error:', error);
      return false;
    }
  },

  orchestratePayment: async (paymentDto) => {
    try {
      const response = await fetch(`${BASE_URL}/payments/orchestrate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentDto),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Payment orchestration failed');
      }
      return data;
    } catch (error) {
      console.error('buyGoodsApi.orchestratePayment Error:', error);
      throw error;
    }
  },

  getPaymentStatus: async (orderId) => {
    try {
      const response = await fetch(`${BASE_URL}/payments/status/${orderId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch payment status');
      }
      return await response.json();
    } catch (error) {
      console.error('buyGoodsApi.getPaymentStatus Error:', error);
      throw error;
    }
  },

  createMarketplaceTransaction: async (transactionData) => {
    try {
      const response = await fetch(`${BASE_URL}/marketplace/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transactionData),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || data.message || 'Transaction creation failed');
      }
      return data;
    } catch (error) {
      console.error('buyGoodsApi.createMarketplaceTransaction Error:', error);
      throw error;
    }
  }
};

