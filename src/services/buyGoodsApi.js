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
  }
};
