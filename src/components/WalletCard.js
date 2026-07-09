import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function WalletCard({ balances }) {
  const [isVisible, setIsVisible] = useState(true);

  // Valeurs par défaut sécurisées
  const mainBalance = balances?.DZY || 0;
  const ghsBalance = balances?.GHS || 125000;
  const xofBalance = balances?.XOF || 510000;

  // Formatage des nombres
  const formatNum = (num) => num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

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
        <TouchableOpacity style={styles.topUpButton}>
          <Ionicons name="add" size={16} color="#1A2840" />
          <Text style={styles.topUpText}>Top-up</Text>
        </TouchableOpacity>
        <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
      </View>

      {/* Main Balance */}
      <View style={styles.balanceRow}>
        <Text style={styles.balanceText}>
          {isVisible ? formatNum(mainBalance) : "••••••"} <Text style={styles.currencyText}>DZY</Text>
        </Text>
      </View>

      {/* Conversions */}
      <View style={styles.conversionRow}>
        <View style={styles.conversionItem}>
          <Text style={styles.flag}>🇬🇭</Text>
          <View>
            <Text style={styles.conversionValue}>≈ {isVisible ? formatNum(ghsBalance) : "•••"} GHS</Text>
            <Text style={styles.conversionLabel}>Ghana Cedi</Text>
          </View>
        </View>
        <View style={styles.separator} />
        <View style={styles.conversionItem}>
          <Text style={styles.flag}>🇹🇬</Text>
          <View>
            <Text style={styles.conversionValue}>≈ {isVisible ? formatNum(xofBalance) : "•••"} XOF</Text>
            <Text style={styles.conversionLabel}>CFA Franc (Togo)</Text>
          </View>
        </View>
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
    justifyContent: 'space-between',
  },
  conversionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  flag: {
    fontSize: 20,
    marginRight: 8,
  },
  conversionValue: {
    color: '#FFFFFF',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
  },
  conversionLabel: {
    color: '#A0AABF',
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
  },
  separator: {
    width: 1,
    height: 32,
    backgroundColor: '#A0AABF',
    marginHorizontal: 16,
    opacity: 0.3,
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
