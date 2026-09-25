import { supabase } from './supabaseClient.js';

// Emergency offline rates (identical to buy-goods-frontend/src/services/currencyService.js)
export const EMERGENCY_RATES = {
  USD: 1,
  USDT: 1,
  USDC: 1,
  EUR: 0.92,
  EURC: 0.92,  // EURC is a euro-pegged stablecoin — mirrors EUR exactly
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
  BTN: 85,     // Bhutanese Ngultrum
  AMD: 388,    // Armenian Dram
  RON: 4.6,    // Romanian Leu
  CHF: 0.88,   // Swiss Franc
  SEK: 10.4,   // Swedish Krona
  NOK: 10.6,   // Norwegian Krone
  DKK: 6.9,    // Danish Krone
  CAD: 1.35,
  AUD: 1.5,
  INR: 83,
  JPY: 149,
  BRL: 5.0,
  MXN: 17,
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
        const dbRatesObj = {};
        data.forEach((r) => {
          if (r.target_currency && r.rate) {
            newRates[r.target_currency] = Number(r.rate);
            dbRatesObj[r.target_currency] = Number(r.rate);
          }
        });
        this.dbRates = dbRatesObj; // track strictly DB rates

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

  /**
   * 🌐 Fetch ALL world currency rates from exchangerate-api.com (free, no key needed).
   * Returns a map of { currencyCode: rate } relative to USD.
   * Used as a live fallback for any currency not in our Supabase DB.
   */
  async fetchAllLiveRates() {
    if (this._liveRatesFetching) return this._liveRates;
    if (this._liveRates && this._liveRatesFetchedAt && Date.now() - this._liveRatesFetchedAt < this.CACHE_DURATION) {
      return this._liveRates;
    }
    this._liveRatesFetching = true;
    try {
      const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      this._liveRates = data?.rates || {};
      this._liveRatesFetchedAt = Date.now();
      console.log('[CurrencyRateService] ✅ Live world rates fetched:', Object.keys(this._liveRates).length, 'currencies');
      return this._liveRates;
    } catch (e) {
      console.warn('[CurrencyRateService] Live rate fetch failed:', e.message);
      return {};
    } finally {
      this._liveRatesFetching = false;
    }
  }

  /**
   * Get the exchange rate for a currency relative to USD.
   * Priority: Supabase DB → Live API → Emergency offline fallback.
   */
  async getRate(currencyCode) {
    const code = this.normalizeCurrency(currencyCode);
    if (code === 'USD') return 1;

    // 1. Supabase DB (already fetched)
    if (this.dbRates && this.dbRates[code]) return this.dbRates[code];

    // 2. Live API fallback
    const liveRates = await this.fetchAllLiveRates();
    if (liveRates[code]) {
      // Inject into local rates so future calls are instant
      this.rates[code] = liveRates[code];
      if (!this.dbRates) this.dbRates = {};
      this.dbRates[code] = liveRates[code]; // Treat live rates similarly to DB rates to prevent re-fetching
      this.notifyListeners();
      console.log(`[CurrencyRateService] ✅ Live rate injected: 1 USD = ${liveRates[code]} ${code}`);
      return liveRates[code];
    }

    // 3. Emergency offline fallback
    if (EMERGENCY_RATES[code]) {
      console.warn(`[CurrencyRateService] ⚠️ Using emergency rate for ${code}`);
      return EMERGENCY_RATES[code];
    }
    
    console.error(`[CurrencyRateService] ❌ Rate unavailable for ${code}`);
    return null;
  }

  getRates() {
    return this.rates;
  }

  normalizeCurrency(curr) {
    if (!curr) return 'USD';
    const c = String(curr).trim().toUpperCase();
    if (c === 'FCFA') return 'XOF';
    if (c === 'EURC') return 'EUR'; // EURC is euro-pegged stablecoin — use EUR rate
    return c;
  }


  convert(amount, fromCurrency = 'USD', toCurrency = 'USD') {
    const num = Number(amount);
    if (amount === undefined || amount === null || isNaN(num)) return 0;

    const from = this.normalizeCurrency(fromCurrency);
    const to = this.normalizeCurrency(toCurrency);

    if (from === to) return num;

    const fromRate = from === 'USD' ? 1 : this.rates[from];
    const toRate = to === 'USD' ? 1 : this.rates[to];
    
    if (!fromRate || !toRate) {
      console.error(`[CurrencyRateService] ❌ Synchronous rate missing for ${!fromRate ? from : to}`);
      return null;
    }

    // amount in USD = amount / fromRate
    // amount in target = amountInUsd * toRate
    const amountInUsd = num / fromRate;
    return amountInUsd * toRate;
  }

  /**
   * Async version of convert() — uses the 3-tier rate lookup (DB → live API → emergency fallback).
   * Use this wherever you display local currency amounts to the user.
   */
  async convertAsync(amount, fromCurrency = 'USD', toCurrency = 'USD') {
    const num = Number(amount);
    if (amount === undefined || amount === null || isNaN(num)) return 0;

    const from = this.normalizeCurrency(fromCurrency);
    const to = this.normalizeCurrency(toCurrency);

    if (from === to) return num;

    const fromRate = await this.getRate(from);
    const toRate = await this.getRate(to);

    if (!fromRate || !toRate) {
      console.error(`[CurrencyRateService] ❌ Async rate missing for ${!fromRate ? from : to}`);
      return null;
    }

    const amountInUsd = num / fromRate;
    return amountInUsd * toRate;
  }
}

export const currencyRateService = new CurrencyRateService();
