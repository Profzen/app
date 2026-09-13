import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

export default function FiltersScreen() {
  const navigation = useNavigation();
  const { t } = useApp();
  const [selectedType, setSelectedType] = useState('all');
  const [selectedDirection, setSelectedDirection] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('all');

  const transactionTypes = [
    { id: 'all', title: t('filters.allTransactions', 'All transactions') },
    { id: 'bills', title: t('filters.billPayment', 'Bill payment'), subtitle: t('filters.billPaymentSub', 'Education, Health, Electricity, Consulting...'), icon: 'receipt-outline', iconColor: '#3B82F6', iconBg: '#EFF6FF' },
    { id: 'phone', title: t('filters.phoneRecharge', 'Mobile recharge'), icon: 'phone-portrait-outline', iconColor: '#10B981', iconBg: '#ECFDF5' },
    { id: 'vouchers', title: t('filters.vouchers', "Vouchers purchase"), subtitle: t('filters.vouchersSub', 'Gift Cards, Vouchers'), icon: 'card-outline', iconColor: '#F59E0B', iconBg: '#FFFBEB' },
    { id: 'products', title: t('filters.physicalProducts', 'Physical goods purchase'), icon: 'bag-handle-outline', iconColor: '#8B5CF6', iconBg: '#F5F3FF' },
    { id: 'topup', title: t('filters.walletTopup', 'DZYWallet top-up'), icon: 'wallet-outline', iconColor: '#3B82F6', iconBg: '#EFF6FF' },
    { id: 'send', title: t('filters.sendFunds', 'Send funds'), icon: 'arrow-up-outline', iconColor: '#10B981', iconBg: '#ECFDF5', rotateIcon: '45deg' },
    { id: 'receive', title: t('filters.receiveFunds', 'Receive funds'), icon: 'arrow-down-outline', iconColor: '#10B981', iconBg: '#ECFDF5' },
    { id: 'swap', title: t('filters.swapTokens', 'Token swap / bridge'), icon: 'swap-horizontal-outline', iconColor: '#8B5CF6', iconBg: '#F5F3FF' },
    { id: 'cashout', title: t('filters.cashout', 'Cash-out (local currency withdrawal)'), icon: 'business-outline', iconColor: '#EF4444', iconBg: '#FEF2F2' },
    { id: 'stake', title: t('filters.stake', 'Stake (Savings)'), icon: 'server-outline', iconColor: '#F59E0B', iconBg: '#FFFBEB' },
    { id: 'invite', title: t('filters.invite', 'Invite & referral'), icon: 'person-add-outline', iconColor: '#8B5CF6', iconBg: '#F5F3FF' },
  ];

  const transactionDirections = [
    { id: 'all', title: t('filters.all', 'All') },
    { id: 'out', title: t('filters.outgoing', 'Outgoing (sent)'), icon: 'arrow-up-outline', iconColor: '#EF4444', iconBg: '#FEF2F2' },
    { id: 'in', title: t('filters.incoming', 'Incoming (received)'), icon: 'arrow-down-outline', iconColor: '#10B981', iconBg: '#ECFDF5' },
    { id: 'internal', title: t('filters.internal', 'Internal DZYWallet'), icon: 'swap-horizontal-outline', iconColor: '#8B5CF6', iconBg: '#F5F3FF' },
  ];

  const periods = [
    { id: 'all', title: t('filters.allTime', 'All time') },
    { id: '7d', title: t('filters.last7Days', 'Last 7 days') },
    { id: '30d', title: t('filters.last30Days', 'Last 30 days') },
    { id: '3m', title: t('filters.last3Months', 'Last 3 months') },
    { id: '6m', title: t('filters.last6Months', 'Last 6 months') },
    { id: 'custom', title: t('filters.customPeriod', 'Choose a period'), hasCalendarIcon: true },
  ];

  const renderRadioOption = (isSelected) => (
    <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
      {isSelected && <View style={styles.radioInner} />}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={24} color="#1A2840" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.pageTitle}>{t('filters.title', 'Filters')}</Text>
            <Text style={styles.pageSubtitle}>{t('filters.subtitle', 'Refine your transaction list')}</Text>
          </View>
          <View style={{width: 44}} /> {/* Placeholder for balance */}
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Section 1: Type de transaction */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconBg}>
              <Ionicons name="receipt-outline" size={20} color="#1A2840" />
            </View>
            <Text style={styles.sectionTitle}>{t('filters.transactionType', 'Transaction type')}</Text>
          </View>

          <View style={styles.optionsCard}>
            {transactionTypes.map((type, index) => (
              <View key={type.id}>
                <TouchableOpacity 
                  style={styles.optionRow} 
                  onPress={() => setSelectedType(type.id)}
                >
                  <View style={styles.optionLeft}>
                    {type.icon ? (
                      <View style={[styles.optionIconWrapper, {backgroundColor: type.iconBg}]}>
                        <Ionicons 
                          name={type.icon} 
                          size={18} 
                          color={type.iconColor} 
                          style={type.rotateIcon ? {transform: [{rotate: type.rotateIcon}]} : {}} 
                        />
                      </View>
                    ) : (
                      <View style={{width: 32}} /> // spacing when no icon
                    )}
                    <View style={styles.optionTextContent}>
                      <Text style={[styles.optionTitle, !type.icon && {marginLeft: -32}]}>{type.title}</Text>
                      {type.subtitle && <Text style={styles.optionSubtitle}>{type.subtitle}</Text>}
                    </View>
                  </View>
                  {renderRadioOption(selectedType === type.id)}
                </TouchableOpacity>
                {index < transactionTypes.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>

          {/* Section 2: Sens de la transaction */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconBg}>
              <Ionicons name="swap-horizontal-outline" size={20} color="#1A2840" />
            </View>
            <Text style={styles.sectionTitle}>{t('filters.direction', 'Transaction direction')}</Text>
          </View>

          <View style={styles.optionsCard}>
            {transactionDirections.map((dir, index) => (
              <View key={dir.id}>
                <TouchableOpacity 
                  style={styles.optionRow} 
                  onPress={() => setSelectedDirection(dir.id)}
                >
                  <View style={styles.optionLeft}>
                    {dir.icon ? (
                      <View style={[styles.optionIconWrapper, {backgroundColor: dir.iconBg}]}>
                        <Ionicons name={dir.icon} size={18} color={dir.iconColor} />
                      </View>
                    ) : (
                      <View style={{width: 32}} />
                    )}
                    <Text style={[styles.optionTitle, !dir.icon && {marginLeft: -32}]}>{dir.title}</Text>
                  </View>
                  {renderRadioOption(selectedDirection === dir.id)}
                </TouchableOpacity>
                {index < transactionDirections.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>

          {/* Section 3: Période */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconBg}>
              <Ionicons name="calendar-outline" size={20} color="#1A2840" />
            </View>
            <Text style={styles.sectionTitle}>{t('filters.period', 'Time period')}</Text>
          </View>

          <View style={styles.optionsCard}>
            {periods.map((period, index) => (
              <View key={period.id}>
                <TouchableOpacity 
                  style={styles.optionRow} 
                  onPress={() => setSelectedPeriod(period.id)}
                >
                  <View style={styles.optionLeft}>
                    <Text style={styles.optionTitle}>{period.title}</Text>
                  </View>
                  <View style={styles.optionRight}>
                    {period.hasCalendarIcon && (
                      <Ionicons name="calendar-outline" size={18} color="#1A2840" style={{marginRight: 12}} />
                    )}
                    {renderRadioOption(selectedPeriod === period.id)}
                  </View>
                </TouchableOpacity>
                {index < periods.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>

        </ScrollView>

        {/* Bottom Actions */}
        <View style={styles.bottomActions}>
          <TouchableOpacity style={styles.applyBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="funnel-outline" size={20} color="#FFFFFF" style={{marginRight: 8}} />
            <Text style={styles.applyBtnText}>{t('filters.apply', 'Apply filters')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.resetBtn} onPress={() => {
            setSelectedType('all');
            setSelectedDirection('all');
            setSelectedPeriod('all');
          }}>
            <Ionicons name="refresh" size={20} color="#1A2840" style={{marginRight: 8}} />
            <Text style={styles.resetBtnText}>{t('filters.reset', 'Reset')}</Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    paddingTop: Platform.OS === 'android' ? Math.max(StatusBar.currentHeight || 0, 44) + 6 : 14,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  iconBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  pageTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    color: '#1A2840',
    marginBottom: 4,
  },
  pageSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#64748B',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionIconBg: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: '#1A2840',
  },
  optionsCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 16,
    marginBottom: 32,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionTextContent: {
    flex: 1,
  },
  optionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#1A2840',
  },
  optionSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
    marginRight: 8,
  },
  optionRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: '#FFB800',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFB800',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  bottomActions: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  applyBtn: {
    flexDirection: 'row',
    backgroundColor: '#FFB800',
    paddingVertical: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  applyBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#FFFFFF', // text is white according to standard buttons on yellow? Wait, mockup says text is white. Usually it's dark blue on yellow. The text is white in the mockup for the yellow button? Ah, the mockup has white icon and white text on the yellow button. Actually, DizzitUp usually uses dark blue text on yellow. Let me use white as it appears in this specific mockup, wait, looking closely at M66_: button is yellow with white text.
  },
  resetBtn: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#1A2840',
    paddingVertical: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#1A2840',
  },
});
