import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getCountryCurrencyInfo } from '../utils/countryCurrencyUtils';
import { useApp } from '../context/AppContext';
import { supabase } from '../services/supabaseClient';

const FALLBACK_RATES = {
  USD: 1, USDT: 1, USDC: 1, WBTC: 0.000015, DZY: 0.1,
  EUR: 0.96, GBP: 0.79, NGN: 1600, GHS: 15.5, KES: 160,
  ZAR: 19, EGP: 48, XOF: 605, XAF: 605, TZS: 2550,
  UGX: 3800, RWF: 1280, ETB: 57, MAD: 10, DZD: 135, MGA: 4600
};

export default function PriceDisplay({ amount, baseCurrency = 'XOF', style, textStyle }) {
  const { user } = useApp();
  const [rates, setRates] = useState({});

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const { data, error } = await supabase
          .from('exchange_rates')
          .select('target_currency, rate')
          .eq('base_currency', 'USD')
          .eq('status', 'active');
          
        if (!error && data && data.length > 0) {
          const ratesMap = {};
          data.forEach(r => ratesMap[r.target_currency] = r.rate);
          ratesMap['USD'] = 1;
          setRates(ratesMap);
        } else {
          setRates(FALLBACK_RATES);
        }
      } catch (e) {
        console.warn('Failed to fetch rates from DB, using fallback', e);
        setRates(FALLBACK_RATES);
      }
    };
    fetchRates();
  }, []);

  // Determine user's local currency
  const userCountryKey = (user?.COI || user?.country || 'Senegal').toLowerCase().trim();
  const primaryCountry = getCountryCurrencyInfo(userCountryKey);
  const localCurrency = primaryCountry.currency;

  const currentRates = Object.keys(rates).length > 0 ? rates : FALLBACK_RATES;

  // Convert baseAmount to USD
  const baseRateToUsd = currentRates[baseCurrency] || FALLBACK_RATES[baseCurrency] || 1;
  const amountInUsd = amount / baseRateToUsd;

  // Calculate local amount and DZY amount
  const localRate = currentRates[localCurrency] || FALLBACK_RATES[localCurrency] || 1;
  const localAmount = amountInUsd * localRate;
  
  // 1 USD = 10 DZY
  const dzyAmount = amountInUsd * (currentRates['DZY'] || 10);
  const usdtAmount = amountInUsd * (currentRates['USDT'] || 1);

  const formatLocal = (num) => (num || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  const formatCompact = (num) => {
    if (!num) return "0";
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1).replace('.0', '') + 'k';
    return num.toFixed(2);
  };
  
  const displayCurrency = (localCurrency === 'XOF' || localCurrency === 'XAF') ? 'F CFA' : localCurrency;

  return (
    <View style={[styles.container, style]}>
      {/* PRIMARY: Local Currency - Large and Bold */}
      <View style={styles.primaryRow}>
        <Text style={[styles.localCurrencyText, textStyle]}>{displayCurrency}</Text>
        <Text style={[styles.localAmountText, textStyle]}>{formatLocal(localAmount)}</Text>
      </View>

      {/* SECONDARY: DZY (LEFT) and USDT (RIGHT) */}
      <View style={styles.secondaryRow}>
        <View style={styles.dzyBadge}>
          <Text style={styles.dzyBadgeText}>{formatCompact(dzyAmount)} DZY</Text>
        </View>
        <View style={styles.usdtBadge}>
          <Text style={styles.usdtBadgeText}>{usdtAmount.toFixed(2)} USDT</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 4,
    marginVertical: 4,
  },
  primaryRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  localCurrencyText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: 'rgba(32, 54, 91, 0.7)',
  },
  localAmountText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: '#20365B',
  },
  secondaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dzyBadge: {
    backgroundColor: 'rgba(255, 199, 89, 0.15)',
    borderColor: 'rgba(255, 199, 89, 0.4)',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dzyBadgeText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: '#AA843B',
  },
  usdtBadge: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  usdtBadgeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    color: '#15803D',
  },
});
