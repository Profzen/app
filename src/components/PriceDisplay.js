import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getCountryCurrencyInfo, convertCurrencyAmount } from '../utils/countryCurrencyUtils';
import { currencyRateService } from '../services/currencyRateService';
import { useApp } from '../context/AppContext';

export default function PriceDisplay({ 
  amount = 0, 
  baseCurrency = 'USD', 
  quantity = 1,
  size = 'medium',
  targetCountry,
  style, 
  textStyle 
}) {
  const { user, userCountry: contextCountry } = useApp();
  const [, setRateVersion] = useState(0);

  useEffect(() => {
    // Re-render when live exchange rates update from Supabase
    const unsubscribe = currencyRateService.subscribe(() => {
      setRateVersion((v) => v + 1);
    });
    return unsubscribe;
  }, []);

  // Determine user's local currency based on geolocalization / profile / merchant region
  const userCountryKey = (
    targetCountry ||
    contextCountry ||
    user?.COI ||
    user?.country ||
    user?.country_name ||
    'Algeria' // active marketplace geolocated context
  ).toLowerCase().trim();

  const primaryCountry = getCountryCurrencyInfo(userCountryKey);
  const localCurrency = primaryCountry?.currency || 'DZD';

  const totalBaseAmount = (Number(amount) || 0) * (Number(quantity) || 1);

  // Derive amounts using unified conversion utility
  const localAmount = convertCurrencyAmount(totalBaseAmount, baseCurrency, localCurrency);
  const dzyAmount = convertCurrencyAmount(totalBaseAmount, baseCurrency, 'DZY');
  const usdtAmount = convertCurrencyAmount(totalBaseAmount, baseCurrency, 'USDT');

  const formatLocal = (num) => (num || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  const formatCompact = (num) => {
    if (!num) return "0";
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1).replace('.0', '') + 'k';
    return num.toFixed(1);
  };
  
  const displayCurrency = (localCurrency === 'XOF' || localCurrency === 'XAF') ? 'F CFA' : localCurrency;
  const isLarge = size === 'large';
  const isCompact = size === 'compact';

  const rtlCurrencies = ['DZD', 'د.ج', 'MAD', 'د.م.', 'EGP', 'ج.م', 'TND', 'د.ت', 'LYD', 'د.ل'];
  const isRtl = rtlCurrencies.includes(localCurrency);

  return (
    <View style={[styles.container, isLarge && styles.containerLarge, style]}>
      {/* PRIMARY: Local Currency - Large and Bold */}
      <View style={[styles.primaryRow, isLarge && styles.primaryRowLarge]}>
        {isRtl ? (
          <>
            <Text style={[styles.localAmountText, isLarge && styles.localAmountLarge, isCompact && styles.localAmountCompact, textStyle]}>
              {formatLocal(localAmount)}
            </Text>
            <Text style={[styles.localCurrencyText, isLarge && styles.localCurrencyLarge, isCompact && styles.localCurrencyCompact, textStyle]}>
              {displayCurrency}
            </Text>
          </>
        ) : (
          <>
            <Text style={[styles.localCurrencyText, isLarge && styles.localCurrencyLarge, isCompact && styles.localCurrencyCompact, textStyle]}>
              {displayCurrency}
            </Text>
            <Text style={[styles.localAmountText, isLarge && styles.localAmountLarge, isCompact && styles.localAmountCompact, textStyle]}>
              {formatLocal(localAmount)}
            </Text>
          </>
        )}
      </View>

      {/* SECONDARY: DZY (LEFT) and USDT (RIGHT) Badges */}
      <View style={[styles.secondaryRow, isLarge && styles.secondaryRowLarge]}>
        <View style={[styles.dzyBadge, isLarge && styles.dzyBadgeLarge]}>
          <Text style={[styles.dzyBadgeText, isLarge && styles.dzyBadgeTextLarge]}>
            {formatCompact(dzyAmount)} DZY
          </Text>
        </View>
        <View style={[styles.usdtBadge, isLarge && styles.usdtBadgeLarge]}>
          <Text style={[styles.usdtBadgeText, isLarge && styles.usdtBadgeTextLarge]}>
            {usdtAmount.toFixed(2)} USDT
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 3,
    marginVertical: 2,
  },
  containerLarge: {
    gap: 6,
    marginVertical: 6,
  },
  primaryRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  primaryRowLarge: {
    gap: 6,
  },
  localCurrencyText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#64748B',
  },
  localCurrencyLarge: {
    fontSize: 16,
    color: '#475569',
    fontFamily: 'Inter_700Bold',
  },
  localCurrencyCompact: {
    fontSize: 10.5,
  },
  localAmountText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 15,
    color: '#1A2840',
  },
  localAmountLarge: {
    fontSize: 24,
    color: '#1A2840',
    lineHeight: 28,
  },
  localAmountCompact: {
    fontSize: 13,
  },
  secondaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 5,
  },
  secondaryRowLarge: {
    gap: 8,
  },
  dzyBadge: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dzyBadgeLarge: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  dzyBadgeText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10.5,
    color: '#B45309',
  },
  dzyBadgeTextLarge: {
    fontSize: 12,
  },
  usdtBadge: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  usdtBadgeLarge: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  usdtBadgeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    color: '#047857',
  },
  usdtBadgeTextLarge: {
    fontSize: 11.5,
  },
});
