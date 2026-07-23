import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNavBar from '../components/BottomNavBar';

export default function DashboardEngScreen() {
  const navigation = useNavigation();
  const [activeTabMode, setActiveTabMode] = useState('business');

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Header Top Bar */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.storeIconBox}>
              <Ionicons name="storefront" size={22} color="#1A2840" />
            </View>
            <View style={{ marginLeft: 8 }}>
              <Text style={styles.helloText}>Hello,</Text>
              <View style={styles.nameBadgeRow}>
                <Text style={styles.nameText}>ABC Inc</Text>
                <View style={styles.businessBadge}>
                  <Text style={styles.businessBadgeText}>Business</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.headerRightActions}>
            <TouchableOpacity style={styles.iconSquareBtn}>
              <Ionicons name="notifications-outline" size={20} color="#1A2840" />
              <View style={styles.yellowBadgeDot} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconSquareBtn}>
              <Ionicons name="gift-outline" size={20} color="#1A2840" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconSquareBtn}>
              <Ionicons name="ellipsis-horizontal" size={20} color="#1A2840" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Top Perso / Business Mode Switcher */}
          <View style={styles.modeSwitchContainer}>
            <TouchableOpacity 
              style={[styles.modeTabBtn, activeTabMode === 'perso' && styles.modeTabBtnActive]}
              onPress={() => {
                setActiveTabMode('perso');
                navigation.navigate('DashboardScreen');
              }}
              activeOpacity={0.8}
            >
              <Text style={[styles.modeTabText, activeTabMode === 'perso' && styles.modeTabTextActive]}>Perso</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.modeTabBtn, activeTabMode === 'business' && styles.modeTabBtnActive]}
              onPress={() => setActiveTabMode('business')}
              activeOpacity={0.8}
            >
              <Text style={[styles.modeTabText, activeTabMode === 'business' && styles.modeTabTextActive]}>Business</Text>
            </TouchableOpacity>
          </View>

          {/* Main Dark Navy Card (DZYwallet Pro) */}
          <View style={styles.mainNavyCard}>
            
            {/* Header Row: DZYwallet Pro & Top-up CTA */}
            <View style={styles.walletHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.dzyWalletProTitle}>DZYwallet Pro</Text>
                <Ionicons name="eye-outline" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <TouchableOpacity style={styles.btnTopUp} onPress={() => navigation.navigate('TopUpScreen')}>
                  <Ionicons name="add" size={14} color="#1A2840" />
                  <Text style={styles.btnTopUpText}>Top-up</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.arrowCircleBtn}>
                  <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Main Balance Display */}
            <View style={styles.balanceRow}>
              <Image source={require('../../assets/brand/dizzitup_logo_cercle.png')} style={styles.dzyLogoIcon} resizeMode="contain" />
              <Text style={styles.balanceAmountText}>125,500.00</Text>
              <Text style={styles.dzyTagText}>DZY</Text>
            </View>

            {/* Conversions Row (2 Cols) */}
            <View style={styles.conversionsGridRow}>
              <View style={styles.conversionCol}>
                <Ionicons name="location-outline" size={14} color="#9CA3AF" style={{ marginRight: 4 }} />
                <Image source={{ uri: 'https://flagcdn.com/w40/gh.png' }} style={styles.flagIconCircle} />
                <View style={{ marginLeft: 6 }}>
                  <Text style={styles.conversionValText}>125,500.00 GHS</Text>
                  <Text style={styles.conversionLabelText}>Ghana Cedi</Text>
                </View>
              </View>

              <View style={styles.conversionDividerLine} />

              <View style={styles.conversionCol}>
                <Ionicons name="home-outline" size={14} color="#9CA3AF" style={{ marginRight: 4 }} />
                <Image source={{ uri: 'https://flagcdn.com/w40/tg.png' }} style={styles.flagIconCircle} />
                <View style={{ marginLeft: 6 }}>
                  <Text style={styles.conversionValText}>510,000.00 XOF</Text>
                  <Text style={styles.conversionLabelText}>CFA Franc (Togo)</Text>
                </View>
              </View>
            </View>

            {/* 4 Action Buttons Row */}
            <View style={styles.cardActionsRow}>
              <TouchableOpacity style={styles.cardActionItem} onPress={() => navigation.navigate('SendMoneyScreen')}>
                <Ionicons name="paper-plane-outline" size={20} color="#FFFFFF" />
                <Text style={styles.cardActionLabel}>Send</Text>
              </TouchableOpacity>

              <View style={styles.actionDividerVertical} />

              <TouchableOpacity style={styles.cardActionItem}>
                <Ionicons name="layers-outline" size={20} color="#FFFFFF" />
                <Text style={styles.cardActionLabel}>Mes fonds</Text>
              </TouchableOpacity>

              <View style={styles.actionDividerVertical} />

              <TouchableOpacity style={styles.cardActionItem}>
                <Ionicons name="time-outline" size={20} color="#FFFFFF" />
                <Text style={styles.cardActionLabel}>History</Text>
              </TouchableOpacity>

              <View style={styles.actionDividerVertical} />

              <TouchableOpacity style={styles.cardActionItem} onPress={() => navigation.navigate('WithdrawFundsScreen')}>
                <Ionicons name="exit-outline" size={20} color="#FFFFFF" />
                <Text style={styles.cardActionLabel}>Cash-out</Text>
              </TouchableOpacity>
            </View>

          </View>

          {/* Business Analytics Cards Grid (4 Cards) */}
          <View style={styles.analyticsGrid}>
            
            {/* Card 1: Today's sales */}
            <View style={styles.analyticsCard}>
              <View style={styles.analyticsCardHeader}>
                <View style={[styles.analyticsIconBox, { backgroundColor: '#DCFCE7' }]}>
                  <Ionicons name="trending-up" size={18} color="#10B981" />
                </View>
                <View style={[styles.badgePill, { backgroundColor: '#DCFCE7' }]}>
                  <Ionicons name="trending-up" size={10} color="#10B981" style={{ marginRight: 2 }} />
                  <Text style={[styles.badgePillText, { color: '#10B981' }]}>+12.5%</Text>
                </View>
              </View>
              <Text style={styles.analyticsCardLabel}>Today's sales</Text>
              <Text style={styles.analyticsCardMainVal}>0</Text>
              <Text style={styles.analyticsCardSubVal}>0 DZY • $0</Text>
            </View>

            {/* Card 2: Pending orders */}
            <View style={styles.analyticsCard}>
              <View style={styles.analyticsCardHeader}>
                <View style={[styles.analyticsIconBox, { backgroundColor: '#EFF6FF' }]}>
                  <Ionicons name="mail-outline" size={18} color="#0052FF" />
                </View>
                <View style={[styles.badgePill, { backgroundColor: '#DCFCE7' }]}>
                  <Ionicons name="trending-up" size={10} color="#10B981" style={{ marginRight: 2 }} />
                  <Text style={[styles.badgePillText, { color: '#10B981' }]}>+3</Text>
                </View>
              </View>
              <Text style={styles.analyticsCardLabel}>Pending orders</Text>
              <Text style={styles.analyticsCardMainVal}>0</Text>
            </View>

            {/* Card 3: Products */}
            <View style={styles.analyticsCard}>
              <View style={styles.analyticsCardHeader}>
                <View style={[styles.analyticsIconBox, { backgroundColor: '#F3E8FF' }]}>
                  <Ionicons name="cube-outline" size={18} color="#8B5CF6" />
                </View>
                <View style={[styles.badgePill, { backgroundColor: '#FEE2E2' }]}>
                  <Ionicons name="trending-down" size={10} color="#EF4444" style={{ marginRight: 2 }} />
                  <Text style={[styles.badgePillText, { color: '#EF4444' }]}>-2</Text>
                </View>
              </View>
              <Text style={styles.analyticsCardLabel}>Products</Text>
              <Text style={styles.analyticsCardMainVal}>0</Text>
            </View>

            {/* Card 4: Customer rating */}
            <View style={styles.analyticsCard}>
              <View style={styles.analyticsCardHeader}>
                <View style={[styles.analyticsIconBox, { backgroundColor: '#FEF3C7' }]}>
                  <Ionicons name="person-outline" size={18} color="#F59E0B" />
                </View>
                <View style={[styles.badgePill, { backgroundColor: '#DCFCE7' }]}>
                  <Ionicons name="trending-up" size={10} color="#10B981" style={{ marginRight: 2 }} />
                  <Text style={[styles.badgePillText, { color: '#10B981' }]}>+0.2</Text>
                </View>
              </View>
              <Text style={styles.analyticsCardLabel}>Customer rating</Text>
              <Text style={styles.analyticsCardMainVal}>4.5</Text>
            </View>

          </View>

          {/* Refer a Store or Business Banner Promo Card */}
          <View style={styles.referPromoCard}>
            <TouchableOpacity style={styles.closeBtnTopRight}>
              <Ionicons name="close" size={16} color="#9CA3AF" />
            </TouchableOpacity>

            <View style={styles.referCardContent}>
              <Text style={styles.referCardTitle}>
                Refer a Store or Business{'\n'}and earn <Text style={{ color: '#10B981' }}>$10 in DZY</Text>
              </Text>
              <Text style={styles.referCardSubtitle}>
                Refer a store or business{'\n'}and earn rewards.
              </Text>
              <TouchableOpacity style={styles.btnReferNow}>
                <Text style={styles.btnReferNowText}>Refer now</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.referCardGraphicBox}>
              <View style={styles.store3dRoof}>
                <Text style={styles.storeRoofText}>STORE</Text>
              </View>
              <View style={styles.storeBuildingBody}>
                <View style={styles.storeDoor} />
              </View>
              <View style={styles.goldCoin3d}>
                <Text style={styles.goldCoin3dText}>DZY</Text>
              </View>
            </View>

            {/* Pagination Dots */}
            <View style={styles.dotsRowContainer}>
              <View style={[styles.dotPill, { backgroundColor: '#10B981' }]} />
              <View style={[styles.dotPill, { backgroundColor: '#D1D5DB' }]} />
            </View>
          </View>

          {/* Quick Actions Header */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Quick actions</Text>
          </View>

          {/* Quick Actions 6-Card Grid */}
          <View style={styles.quickActionsGrid}>
            
            {/* 1: Invoice & Pay link */}
            <TouchableOpacity style={styles.qActionCard}>
              <View style={[styles.qActionIconCircle, { backgroundColor: '#EFF6FF' }]}>
                <Ionicons name="document-text-outline" size={22} color="#0052FF" />
              </View>
              <Text style={styles.qActionCardLabel}>Invoice &{'\n'}Pay link</Text>
            </TouchableOpacity>

            {/* 2: Cash-in (POS) */}
            <TouchableOpacity style={styles.qActionCard} onPress={() => navigation.navigate('CashRegisterScreen')}>
              <View style={[styles.qActionIconCircle, { backgroundColor: '#F3E8FF' }]}>
                <Ionicons name="hardware-chip-outline" size={22} color="#8B5CF6" />
              </View>
              <Text style={styles.qActionCardLabel}>Cash-in{'\n'}(POS)</Text>
            </TouchableOpacity>

            {/* 3: Send & Request */}
            <TouchableOpacity style={styles.qActionCard} onPress={() => navigation.navigate('SendMoneyScreen')}>
              <View style={[styles.qActionIconCircle, { backgroundColor: '#DCFCE7' }]}>
                <Ionicons name="people-outline" size={22} color="#10B981" />
              </View>
              <Text style={styles.qActionCardLabel}>Send &{'\n'}Request</Text>
            </TouchableOpacity>

            {/* 4: Top-up DZYwallet */}
            <TouchableOpacity style={styles.qActionCard} onPress={() => navigation.navigate('TopUpScreen')}>
              <View style={[styles.qActionIconCircle, { backgroundColor: '#DCFCE7' }]}>
                <Ionicons name="add-circle-outline" size={22} color="#10B981" />
              </View>
              <Text style={styles.qActionCardLabel}>Top-up{'\n'}DZYwallet</Text>
            </TouchableOpacity>

            {/* 5: Cash-out */}
            <TouchableOpacity style={styles.qActionCard} onPress={() => navigation.navigate('WithdrawFundsScreen')}>
              <View style={[styles.qActionIconCircle, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="wallet-outline" size={22} color="#F59E0B" />
              </View>
              <Text style={styles.qActionCardLabel}>Cash-out</Text>
            </TouchableOpacity>

            {/* 6: Source in Africa */}
            <TouchableOpacity style={styles.qActionCard}>
              <View style={[styles.qActionIconCircle, { backgroundColor: '#EFF6FF' }]}>
                <Ionicons name="earth-outline" size={22} color="#0052FF" />
              </View>
              <Text style={styles.qActionCardLabel}>Source in{'\n'}Africa</Text>
            </TouchableOpacity>

          </View>

          {/* Secure Your Business Card Banner */}
          <View style={styles.securityBoxBanner}>
            <View style={styles.securityIconBox}>
              <Ionicons name="shield-checkmark-outline" size={24} color="#1A2840" />
            </View>
            <View style={styles.securityContentGroup}>
              <Text style={styles.securityTitleText}>Secure your business</Text>
              <Text style={styles.securitySubText}>
                Your funds and transactions are protected{'\n'}by <Text style={{ color: '#F59E0B', fontWeight: 'bold' }}>enterprise-grade</Text> security.
              </Text>
            </View>
            <Ionicons name="lock-closed-outline" size={20} color="#1A2840" />
          </View>

          <View style={{ height: 20 }} />
        </ScrollView>

        <BottomNavBar activeTab="home" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: Platform.OS === 'android' ? 36 : 10, paddingBottom: 10 },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  storeIconBox: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  helloText: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#6B7280' },
  nameBadgeRow: { flexDirection: 'row', alignItems: 'center' },
  nameText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 16, color: '#1A2840', marginRight: 6 },
  businessBadge: { backgroundColor: '#EFF6FF', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  businessBadgeText: { fontFamily: 'Inter_600SemiBold', fontSize: 10, color: '#0052FF' },
  headerRightActions: { flexDirection: 'row', gap: 6 },
  iconSquareBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', position: 'relative' },
  yellowBadgeDot: { position: 'absolute', top: 8, right: 8, width: 7, height: 7, borderRadius: 4, backgroundColor: '#FFC759' },
  scrollView: { flex: 1 },
  scrollContent: { paddingTop: 6, paddingBottom: 30, paddingHorizontal: 16 },
  modeSwitchContainer: { flexDirection: 'row', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 16, padding: 3, marginBottom: 16 },
  modeTabBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 12 },
  modeTabBtnActive: { backgroundColor: '#071D54' },
  modeTabText: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#6B7280' },
  modeTabTextActive: { color: '#FFFFFF' },
  mainNavyCard: { backgroundColor: '#071D54', borderRadius: 20, padding: 16, marginBottom: 16 },
  walletHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  dzyWalletProTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 14, color: '#FFC759' },
  btnTopUp: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFC759', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  btnTopUpText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 11, color: '#1A2840', marginLeft: 2 },
  arrowCircleBtn: { width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  balanceRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  dzyLogoIcon: { width: 44, height: 44, marginRight: 8 },
  balanceAmountText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 28, color: '#FFFFFF', marginRight: 6 },
  dzyTagText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 14, color: '#FFC759' },
  conversionsGridRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: 10, marginBottom: 16 },
  conversionCol: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  flagIconCircle: { width: 18, height: 18, borderRadius: 9 },
  conversionValText: { fontFamily: 'Inter_600SemiBold', fontSize: 10, color: '#FFFFFF' },
  conversionLabelText: { fontFamily: 'Inter_400Regular', fontSize: 9, color: '#9CA3AF' },
  conversionDividerLine: { width: 1, height: 24, backgroundColor: 'rgba(255,255,255,0.15)', marginHorizontal: 8 },
  cardActionsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' },
  cardActionItem: { flex: 1, alignItems: 'center' },
  cardActionLabel: { fontFamily: 'Inter_500Medium', fontSize: 10, color: '#FFFFFF', marginTop: 4 },
  actionDividerVertical: { width: 1, height: 20, backgroundColor: 'rgba(255,255,255,0.1)' },
  analyticsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  analyticsCard: { width: '48%', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F0F2F5', borderRadius: 16, padding: 12 },
  analyticsCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  analyticsIconBox: { width: 34, height: 34, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  badgePill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 },
  badgePillText: { fontFamily: 'Inter_600SemiBold', fontSize: 9 },
  analyticsCardLabel: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#6B7280', marginBottom: 2 },
  analyticsCardMainVal: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 20, color: '#1A2840' },
  analyticsCardSubVal: { fontFamily: 'Inter_400Regular', fontSize: 10, color: '#9CA3AF', marginTop: 2 },
  referPromoCard: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#F1F5F9', borderRadius: 20, padding: 16, marginBottom: 16, position: 'relative' },
  closeBtnTopRight: { position: 'absolute', top: 12, right: 12, zIndex: 5 },
  referCardContent: { width: '60%' },
  referCardTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 14, color: '#1A2840', lineHeight: 18, marginBottom: 4 },
  referCardSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 10, color: '#6B7280', lineHeight: 14, marginBottom: 12 },
  btnReferNow: { backgroundColor: '#10B981', alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 10 },
  btnReferNowText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 11, color: '#FFFFFF' },
  referCardGraphicBox: { position: 'absolute', right: 16, top: 16, width: 100, height: 90, alignItems: 'center', justifyContent: 'center' },
  store3dRoof: { width: 70, height: 20, backgroundColor: '#10B981', borderRadius: 4, justifyContent: 'center', alignItems: 'center' },
  storeRoofText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 9, color: '#FFFFFF' },
  storeBuildingBody: { width: 60, height: 45, backgroundColor: '#E5E7EB', borderBottomLeftRadius: 6, borderBottomRightRadius: 6, justifyContent: 'flex-end', alignItems: 'center' },
  storeDoor: { width: 16, height: 24, backgroundColor: '#9CA3AF', borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  goldCoin3d: { position: 'absolute', left: 4, bottom: 4, width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFC759', borderWidth: 2, borderColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' },
  goldCoin3dText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 9, color: '#1A2840' },
  dotsRowContainer: { flexDirection: 'row', justifyContent: 'center', gap: 4, marginTop: 8 },
  dotPill: { width: 6, height: 6, borderRadius: 3 },
  sectionHeaderRow: { marginBottom: 10 },
  sectionTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 15, color: '#1A2840' },
  quickActionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  qActionCard: { width: '31%', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F0F2F5', borderRadius: 16, padding: 12, alignItems: 'center' },
  qActionIconCircle: { width: 38, height: 38, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  qActionCardLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#1A2840', textAlign: 'center', lineHeight: 14 },
  securityBoxBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#F1F5F9', borderRadius: 16, padding: 14 },
  securityIconBox: { marginRight: 10 },
  securityContentGroup: { flex: 1 },
  securityTitleText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 13, color: '#1A2840', marginBottom: 2 },
  securitySubText: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#6B7280', lineHeight: 15 }
});
