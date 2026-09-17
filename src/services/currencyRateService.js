import { supabase } from './supabaseClient';

// Emergency offline rates (identical to buy-goods-frontend/src/services/currencyService.js)
export const EMERGENCY_RATES = {
  USD: 1,
  USDT: 1,
  USDC: 1,
  EUR: 0.92,
  EURC: 0.92,
  GBP: 0.79,
  DZY: 10,       // 1 USD = 10 DZY (1 DZY = $0.10)
  XOF: 605,
  XAF: 605,
  FCFA: 605,
  DZD: 135,
  NGN: 1500,
  KES: 135,
  GHS: 13,
  MAD: 10,
  MGA: 4500,
  EGP: 48,
  ZAR: 19,
  RWF: 1280,
  TZS: 2550,
  UGX: 3800,
  ETB: 57,
};

class CurrencyRateService {
  constructor() {
    this.rates = { ...EMERGENCY_RATES };
    this.lastFetched = 0;
    this.CACHE_DURATION = 30 * 60 * 1000; // 30 minutes cache
    this.listeners = new Set();
    this.isFetching = false;
    
    // Auto-fetch on initialization
    this.fetchLiveRates();
  }

  subscribe(listener) {
    if (typeof listener === 'function') {
      this.listeners.add(listener);
      // Immediately notify listener with current rates
      listener(this.rates);
    }
    return () => this.listeners.delete(listener);
  }

  notifyListeners() {
    this.listeners.forEach((listener) => {
      try {
        listener(this.rates);
      } catch (e) {
        console.warn('[CurrencyRateService] Listener error:', e);
      }
    });
  }

  async fetchLiveRates(force = false) {
    const now = Date.now();
    if (!force && this.lastFetched && now - this.lastFetched < this.CACHE_DURATION) {
      return this.rates;
    }
    if (this.isFetching) return this.rates;

    this.isFetching = true;
    try {
      const { data, error } = await supabase
        .from('exchange_rates')
        .select('target_currency, rate, date')
        .eq('base_currency', 'USD')
        .eq('status', 'active')
        .order('date', { ascending: false });

      if (error) {
        console.warn('[CurrencyRateService] Supabase rate fetch warning:', error.message);
        return this.rates;
      }

      if (Array.isArray(data) && data.length > 0) {
        const newRates = { ...EMERGENCY_RATES, USD: 1 };
        data.forEach((r) => {
          if (r.target_currency && r.rate && !newRates[r.target_currency]) {
            newRates[r.target_currency] = Number(r.rate);
          }
        });

        // Ensure FCFA mirrors XOF
        if (newRates.XOF) newRates.FCFA = newRates.XOF;
        // Ensure USDT and USDC default to 1:1 if not explicitly in table
        if (!newRates.USDT) newRates.USDT = 1;
        if (!newRates.USDC) newRates.USDC = 1;
        if (!newRates.DZY) newRates.DZY = 10;

        this.rates = newRates;
        this.lastFetched = now;
        this.notifyListeners();
      }
    } catch (err) {
      console.warn('[CurrencyRateService] Error fetching exchange rates:', err);
    } finally {
      this.isFetching = false;
    }
    return this.rates;
  }

  getRates() {
    return this.rates;
  }

  normalizeCurrency(curr) {
    if (!curr) return 'USD';
    const c = String(curr).trim().toUpperCase();
    if (c === 'FCFA') return 'XOF';
    return c;
  }

  convert(amount, fromCurrency = 'USD', toCurrency = 'USD') {
    const num = Number(amount);
    if (amount === undefined || amount === null || isNaN(num)) return 0;

    const from = this.normalizeCurrency(fromCurrency);
    const to = this.normalizeCurrency(toCurrency);

    if (from === to) return num;

    const fromRate = this.rates[from] || EMERGENCY_RATES[from] || 1;
    const toRate = this.rates[to] || EMERGENCY_RATES[to] || 1;

    // amount in USD = amount / fromRate
    // amount in target = amountInUsd * toRate
    const amountInUsd = num / fromRate;
    return amountInUsd * toRate;
  }
}

export const currencyRateService = new CurrencyRateService();
