import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import CryptoIcon from './CryptoIcon';

import { useApp } from '../context/AppContext';

export default function WalletCard({ balances }) {
  const navigation = useNavigation();
  const { hideBalance, toggleHideBalance, language, t } = useApp();

  const isVisible = !hideBalance;

  const mainBalance = balances?.DZY || 125500;
  const ghsBalance = balances?.GHS || 125500;
  const xofBalance = balances?.XOF || 510000;

  const formatNum = (num) => num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <LinearGradient colors={['#071D54', '#002B70']} start={{x: 0, y: 0}} end={{x: 1, y: 1}} style={styles.cardContainer}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <Text style={styles.titleText}>
            <Text style={{ color: '#FFC759', fontFamily: 'SpaceGrotesk_700Bold' }}>DZY</Text>
            <Text style={{ color: '#FFC759', fontFamily: 'Inter_600SemiBold' }}>wallet</Text>
          </Text>
          <TouchableOpacity onPress={toggleHideBalance} style={styles.eyeIcon}>
            <Ionicons name={isVisible ? "eye-outline" : "eye-off-outline"} size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <View style={styles.topRightActions}>
          <TouchableOpacity style={styles.topUpButton} onPress={() => navigation.navigate('TopUpScreen')}>
            <Ionicons name="add" size={16} color="#1A2840" />
            <Text style={styles.topUpText}>{language === 'fr' ? 'Recharger' : 'Top-up'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.arrowButton} onPress={() => navigation.navigate('AssetListScreen')} accessibilityLabel="Voir mes actifs">
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Balance Row */}
      <View style={styles.balanceRow}>
        <CryptoIcon symbol="DZY" size={32} style={{ marginRight: 10 }} />
        <Text style={styles.balanceText}>
          {isVisible ? formatNum(mainBalance) : "••••••"}
        </Text>
        <Text style={styles.currencyText}>DZY</Text>
      </View>

      {/* Conversions */}
      <View style={styles.conversionRow}>
        <View style={styles.conversionItem}>
          <Ionicons name="location-outline" size={18} color="#FFFFFF" style={styles.conversionIcon} />
          <CountryFlag country="ghana" />
          <View>
            <Text style={styles.conversionValue}>≈ {isVisible ? formatNum(ghsBalance) : "•••"} GHS</Text>
            <Text style={styles.conversionLabel}>Ghana Cedi</Text>
          </View>
        </View>
        <View style={styles.separator} />
        <View style={styles.conversionItem}>
          <Ionicons name="home-outline" size={18} color="#FFFFFF" style={styles.conversionIcon} />
          <CountryFlag country="togo" />
          <View>
            <Text style={styles.conversionValue}>≈ {isVisible ? formatNum(xofBalance) : "•••"} XOF</Text>
            <Text style={styles.conversionLabel}>CFA Franc (Togo)</Text>
          </View>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actionsRow}>
        <ActionItem icon="paper-plane-outline" label={language === 'fr' ? 'Envoyer' : 'Send'} divider onPress={() => navigation.navigate('SendMoneyScreen')} />
        <ActionItem icon="server-outline" label={language === 'fr' ? 'Mes fonds' : 'My Assets'} divider onPress={() => navigation.navigate('AssetListScreen')} />
        <ActionItem icon="time-outline" label={language === 'fr' ? 'Historique' : 'History'} divider onPress={() => navigation.navigate('TransactionHistoryScreen')} />
        <ActionItem icon="card-outline" label={language === 'fr' ? 'Retirer' : 'Cash-out'} onPress={() => navigation.navigate('WithdrawFundsScreen')} />
      </View>
    </LinearGradient>
  );
}

function ActionItem({ icon, label, onPress, divider }) {
  return (
    <TouchableOpacity style={[styles.actionItem, divider && styles.actionItemDivider]} onPress={onPress}>
      <Ionicons name={icon} size={24} color="#FFFFFF" />
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function CountryFlag({ country }) {
  if (country === 'ghana') {
    return (
      <View style={styles.flagImage}>
        <View style={[styles.flagStripe, { backgroundColor: '#CE1126' }]} />
        <View style={[styles.flagStripe, { backgroundColor: '#FCD116' }]} />
        <View style={[styles.flagStripe, { backgroundColor: '#006B3F' }]} />
        <Text style={styles.ghanaStar}>★</Text>
      </View>
    );
  }
  return (
    <View style={styles.flagImage}>
      {[0, 1, 2, 3, 4].map((stripe) => <View key={stripe} style={[styles.flagStripe, { backgroundColor: stripe % 2 ? '#FFCE00' : '#006A4E' }]} />)}
      <View style={styles.togoCanton}><Text style={styles.togoStar}>★</Text></View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 8,
    marginHorizontal: 20,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleText: {
    fontSize: 16,
  },
  eyeIcon: {
    marginLeft: 8,
  },
  topRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topUpButton: {
    backgroundColor: '#FFC759',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  topUpText: {
    color: '#1A2840',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    marginLeft: 4,
  },
  arrowButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginLeft: 12,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 4,
  },
  balanceText: {
    color: '#FFFFFF',
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 30,
    lineHeight: 36,
  },
  currencyText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 14,
    color: '#FFC759',
    marginLeft: 8,
  },
  conversionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    justifyContent: 'space-between',
  },
  conversionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  conversionIcon: { marginRight: 7 },
  flagImage: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 9,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  flagStripe: { flex: 1, alignSelf: 'stretch' },
  ghanaStar: { position: 'absolute', color: '#111827', fontSize: 10, lineHeight: 11, top: 8, left: 8 },
  togoCanton: { position: 'absolute', top: 0, left: 0, width: 13, height: 17, backgroundColor: '#D21034', alignItems: 'center', justifyContent: 'center' },
  togoStar: { color: '#FFFFFF', fontSize: 7, lineHeight: 8 },
  conversionValue: {
    color: '#FFFFFF',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
  },
  conversionLabel: {
    color: '#FFFFFF',
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
  },
  separator: {
    width: 1,
    height: 28,
    backgroundColor: '#A0AABF',
    marginHorizontal: 12,
    opacity: 0.3,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 46,
  },
  actionItemDivider: { borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,0.32)' },
  actionLabel: {
    color: '#FFFFFF',
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    marginTop: 6,
  },
});
