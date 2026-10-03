import { useState, useCallback } from 'react';
import { buyGoodsApi } from '../services/buyGoodsApi';

export const useBuyGoods = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMerchants = useCallback(async (query = '') => {
    setLoading(true);
    setError(null);
    try {
      const data = await buyGoodsApi.getMerchants(query);
      setLoading(false);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to fetch merchants');
      setLoading(false);
      return [];
    }
  }, []);

  const fetchStoreDetails = useCallback(async (slug) => {
    setLoading(true);
    setError(null);
    try {
      const data = await buyGoodsApi.getStoreDetails(slug);
      setLoading(false);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to fetch store details');
      setLoading(false);
      return null;
    }
  }, []);

  const fetchAllProducts = useCallback(async (category = '') => {
    setLoading(true);
    setError(null);
    try {
      const data = await buyGoodsApi.getAllProducts(category);
      setLoading(false);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to fetch products');
      setLoading(false);
      return [];
    }
  }, []);

  const fetchProductById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const data = await buyGoodsApi.getProductById(id);
      setLoading(false);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to fetch product details');
      setLoading(false);
      return null;
    }
  }, []);

  const searchGlobal = useCallback(async (query, options = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await buyGoodsApi.searchGlobal(query, options);
      setLoading(false);
      return data;
    } catch (err) {
      setError(err.message || 'Search failed');
      setLoading(false);
      return { results: [], groupedResults: {} };
    }
  }, []);

  const searchSuggestions = useCallback(async (query) => {
    try {
      return await buyGoodsApi.searchSuggestions(query);
    } catch (err) {
      return { suggestions: [] };
    }
  }, []);

  return {
    loading,
    error,
    fetchMerchants,
    fetchStoreDetails,
    fetchAllProducts,
    fetchProductById,
    searchGlobal,
    searchSuggestions
  };
};
