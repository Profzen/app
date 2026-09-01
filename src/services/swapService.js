import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

let BASE_URL = process.env.EXPO_PUBLIC_DIZZY_WALLET_API_URL || 'http://localhost:5000/api';

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
  BASE_URL = BASE_URL.replace('localhost', '10.0.2.2');
}

export const swapService = {
  getQuote: async (fromToken, toToken, amount, chain, toChain, overrideToken) => {
    try {
      const token = overrideToken || await AsyncStorage.getItem('dizzyToken');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch(
        `${BASE_URL}/swap/quote?fromToken=${fromToken}&toToken=${toToken}&amount=${amount}&chain=${chain}&toChain=${toChain}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to get quote');
      return await response.json();
    } catch (error) {
      console.error('swapService.getQuote Error:', error);
      throw error;
    }
  },

  checkApproval: async (fromToken, chain, spender, amount, overrideToken) => {
    try {
      const token = overrideToken || await AsyncStorage.getItem('dizzyToken');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch(`${BASE_URL}/swap/check-approval`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: fromToken,
          chain,
          spender,
          amount,
        }),
      });

      if (!response.ok) throw new Error('Failed to check approval');
      return await response.json();
    } catch (error) {
      console.error('swapService.checkApproval Error:', error);
      throw error;
    }
  },

  approve: async (fromToken, chain, spender, overrideToken) => {
    try {
      const token = overrideToken || await AsyncStorage.getItem('dizzyToken');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch(`${BASE_URL}/swap/approve`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: fromToken,
          chain,
          spender,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        return { error: true, status: response.status, data };
      }
      return { error: false, data };
    } catch (error) {
      console.error('swapService.approve Error:', error);
      throw error;
    }
  },

  executeSwap: async (fromToken, toToken, amount, chain, toChain, overrideToken) => {
    try {
      const token = overrideToken || await AsyncStorage.getItem('dizzyToken');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch(`${BASE_URL}/swap/execute-and-sign`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fromToken,
          toToken,
          amount,
          chain,
          toChain,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        return { error: true, status: response.status, data };
      }
      return { error: false, data };
    } catch (error) {
      console.error('swapService.executeSwap Error:', error);
      throw error;
    }
  },

  checkTransactionStatus: async (txId, overrideToken) => {
    try {
      const token = overrideToken || await AsyncStorage.getItem('dizzyToken');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch(`${BASE_URL}/swap/check-crossmint-status/${txId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to check transaction status');
      return await response.json();
    } catch (error) {
      console.error('swapService.checkTransactionStatus Error:', error);
      throw error;
    }
  }
};
