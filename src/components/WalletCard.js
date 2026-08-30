import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import CryptoIcon from './CryptoIcon';
import { getCountryCurrencyInfo } from '../utils/countryCurrencyUtils';
import { useApp } from '../context/AppContext';
import { isSmallScreen } from '../utils/responsive';
import { supabase } from '../services/supabaseClient';

export default function WalletCard({ balances }) {
  const navigation = useNavigation();
  const { hideBalance, toggleHideBalance, t, user } = useApp();

  const isVisible = !hideBalance;
  
  const mainBalance = balances?.DZY || 0;
  
  const userCountryKey = (user?.country || '').toLowerCase().trim();
  const primaryCountry = getCountryCurrencyInfo(userCountryKey);

  let secondaryCountry = getCountryCurrencyInfo('united states');
  if (primaryCountry.currency === 'USD') {
    secondaryCountry = getCountryCurrencyInfo('france');
  }

  const [exchangeRates, setExchangeRates] = useState({});

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
          setExchangeRates(ratesMap);
        }
      } catch (e) {
        console.warn('Failed to fetch rates from DB', e);
      }
    };
    fetchRates();
  }, []);

  // 10 DZY = $1.00 USD -> 1 DZY = $0.10 USD
  const dzyInUsd = mainBalance * 0.10;
  
  // Convert USD equivalent to Local Fiat
  const localRate = exchangeRates[primaryCountry.currency] || 1;
  const primaryBalance = dzyInUsd * localRate;
  
  // Convert USD equivalent to Secondary Fiat (usually USD, so rate is 1, or EUR)
  const secondaryRate = exchangeRates[secondaryCountry.currency] || (secondaryCountry.currency === 'EUR' ? 0.92 : 1);
  const secondaryBalance = dzyInUsd * secondaryRate;
  
  const formatNum = (num, min=2, max=2) => (num || 0).toLocaleString('en-US', { minimumFractionDigits: min, maximumFractionDigits: max });

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#20365B', '#111D33']} start={{x: 0, y: 0}} end={{x: 1, y: 1}} style={styles.mainCard}>
        
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.titleWrapper}>
            <View style={styles.iconCircle}>
              <Image source={require('../../assets/brand/finalLogo.png')} style={{ width: 36, height: 36 }} resizeMode="contain" />
            </View>
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.badgeText}>
                  {user?.role === 'merchant' ? t('wallet.business_wallet', 'BUSINESS WALLET') : 'TOTAL DZY INDEX'}
                </Text>
                {user?.role === 'merchant' && (
                  <View style={{ backgroundColor: '#8B5CF6', borderRadius: 4, paddingHorizontal: 4, paddingVertical: 1, marginLeft: 6 }}>
                    <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 7, color: '#FFF' }}>PRO</Text>
                  </View>
                )}
              </View>
              <Text style={styles.titleText}>10 DZY = $1.00 USD</Text>
            </View>
          </View>
          <TouchableOpacity onPress={toggleHideBalance} style={styles.eyeIcon}>
            <Ionicons name={isVisible ? "eye-outline" : "eye-off-outline"} size={20} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
        </View>

        {/* Main Balance */}
        <View style={styles.balanceArea}>
          <Text style={[styles.bigBalanceText, !isVisible && styles.blurredText]} numberOfLines={1} adjustsFontSizeToFit>
            {formatNum(mainBalance, 2, 4)} <Text style={[styles.currencyText, !isVisible && styles.blurredText]}>DZY</Text>
          </Text>
        </View>

        {/* Unified Internal Fiat Row */}
        <View style={styles.internalFiatRow}>
          {/* Local */}
          <View style={[styles.internalFiatBox, { borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,0.1)' }]}>
            <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 4}}>
              <Image source={{ uri: `https://flagcdn.com/w40/${primaryCountry.code}.png` }} style={styles.tinyFlag} />
              <Text style={styles.fiatCurrencyLabel}>{primaryCountry.currency}</Text>
            </View>
            <Text style={[styles.fiatAmount, !isVisible && styles.blurredText]} numberOfLines={1} adjustsFontSizeToFit>
              {formatNum(primaryBalance, 2, 2)}
            </Text>
          </View>
          
          {/* Reference */}
          <View style={[styles.internalFiatBox, { paddingLeft: 12 }]}>
            <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 4}}>
               <Image source={{ uri: `https://flagcdn.com/w40/${secondaryCountry.code}.png` }} style={styles.tinyFlag} />
               <Text style={styles.fiatCurrencyLabel}>{secondaryCountry.currency}</Text>
            </View>
            <Text style={[styles.fiatAmount, !isVisible && styles.blurredText]} numberOfLines={1} adjustsFontSizeToFit>
              {formatNum(secondaryBalance, 2, 2)}
            </Text>
          </View>
        </View>

        {/* Action Buttons Row */}
        <View style={styles.actionsContainer}>
          <ActionItem icon="paper-plane-outline" label={t('wallet.actions.send', 'Send')} onPress={() => navigation.navigate('SendMoneyScreen')} divider />
          <ActionItem icon="server-outline" label={t('wallet.actions.my_assets', 'Assets')} onPress={() => navigation.navigate('AssetListScreen')} divider />
          <ActionItem icon="time-outline" label={t('wallet.actions.history', 'History')} onPress={() => navigation.navigate('TransactionHistoryScreen')} divider />
          <ActionItem icon="card-outline" label={t('wallet.actions.cash_out', 'Cash-out')} onPress={() => navigation.navigate('WithdrawFundsScreen')} />
        </View>

      </LinearGradient>
    </View>
  );
}

function ActionItem({ icon, label, onPress, divider }) {
  return (
    <TouchableOpacity style={[styles.actionItem, divider && styles.actionDivider]} onPress={onPress}>
      <Ionicons name={icon} size={20} color="#FFC759" />
      <Text style={styles.actionLabel} numberOfLines={1}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: isSmallScreen ? 14 : 20,
    marginTop: 8,
    marginBottom: 8,
  },
  mainCard: {
    borderRadius: 20,
    padding: isSmallScreen ? 14 : 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 199, 89, 0.15)',
    boxShadow: '0px 8px 12px #0A1737',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  titleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 199, 89, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 199, 89, 0.3)',
    boxShadow: '0px 4px 8px #FFC759',
  },
  badgeText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 9,
    color: '#FFC759',
    letterSpacing: 0.5,
  },
  titleText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 1,
  },
  eyeIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceArea: {
    marginBottom: 12,
  },
  bigBalanceText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: isSmallScreen ? 28 : 34,
    color: '#FFFFFF',
    lineHeight: isSmallScreen ? 34 : 40,
  },
  currencyText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: isSmallScreen ? 16 : 18,
    color: '#FFC759',
  },
  internalFiatRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
  },
  internalFiatBox: {
    flex: 1,
    justifyContent: 'center',
  },
  tinyFlag: {
    width: 15,
    height: 10,
    borderRadius: 2,
    marginRight: 5,
  },
  fiatCurrencyLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10.5,
    color: 'rgba(255,255,255,0.6)',
  },
  fiatAmount: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#FFFFFF',
    marginTop: 2,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 12,
  },
  actionItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionDivider: {
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.1)',
  },
  actionLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10.5,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  blurredText: {
    color: 'rgba(255,255,255,0)',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 8,
  }
});


