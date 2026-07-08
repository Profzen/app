import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function WalletCard({ balances }) {
  const [isVisible, setIsVisible] = useState(true);

  // Valeurs par défaut sécurisées
  const mainBalance = balances?.DZY || 0;
  const eurBalance = balances?.EUR || 0;
  const xafBalance = balances?.XAF || 0;

  // Formatage des nombres
  const formatNum = (num) => num.toLocaleString('fr-FR');

  return (
    <View style={styles.cardContainer}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <Text style={styles.titleText}>My DZYwallet</Text>
          <TouchableOpacity onPress={() => setIsVisible(!isVisible)} style={styles.eyeIcon}>
            <Ionicons name={isVisible ? "eye-outline" : "eye-off-outline"} size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Balance and Top Up */}
      <View style={styles.balanceRow}>
        <Text style={styles.balanceText}>
          {isVisible ? formatNum(mainBalance) : "••••••"} <Text style={styles.currencyText}>DZY</Text>
        </Text>
        <TouchableOpacity style={styles.topUpButton}>
          <Ionicons name="add" size={18} color="#1A2840" />
          <Text style={styles.topUpText}>Top up</Text>
        </TouchableOpacity>
      </View>

      {/* Conversions */}
      <View style={styles.conversionRow}>
        <Text style={styles.conversionText}>≈ {isVisible ? formatNum(eurBalance) : "•••"} EUR</Text>
        <View style={styles.separator} />
        <Text style={styles.conversionText}>≈ {isVisible ? formatNum(xafBalance) : "•••"} XAF</Text>
      </View>

      {/* Actions */}
      <View style={styles.actionsRow}>
        <ActionItem icon="paper-plane-outline" label="Send" />
        <ActionItem icon="arrow-down-outline" label="Receive" />
        <ActionItem icon="time-outline" label="History" />
        <ActionItem icon="card-outline" label="Cash-out" />
      </View>
    </View>
  );
}

function ActionItem({ icon, label }) {
  return (
    <TouchableOpacity style={styles.actionItem}>
      <Ionicons name={icon} size={24} color="#FFFFFF" />
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#1A2840',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 20,
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
    color: '#FFFFFF',
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
  },
  eyeIcon: {
    marginLeft: 8,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  balanceText: {
    color: '#FFFFFF',
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 32,
  },
  currencyText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
  },
  topUpButton: {
    backgroundColor: '#FFC759',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  topUpText: {
    color: '#1A2840',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    marginLeft: 4,
  },
  conversionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  conversionText: {
    color: '#A0AABF',
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
  },
  separator: {
    width: 1,
    height: 12,
    backgroundColor: '#A0AABF',
    marginHorizontal: 16,
    opacity: 0.5,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionItem: {
    alignItems: 'center',
  },
  actionLabel: {
    color: '#FFFFFF',
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    marginTop: 8,
  },
});
