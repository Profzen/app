import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import BottomNavBar from '../components/BottomNavBar';

const ACQUIRED_DATA = [
  { id: '1', label: 'Cashback Rewards', amount: '940.00 DZY', percentage: '40%', color: '#10B981', value: 40 },
  { id: '2', label: 'Referral Rewards', amount: '470.00 DZY', percentage: '20%', color: '#8B5CF6', value: 20 },
  { id: '3', label: 'Action Rewards', amount: '235.60 DZY', percentage: '10%', color: '#0052FF', value: 10 },
  { id: '4', label: 'Received', amount: '352.50 DZY', percentage: '15%', color: '#F97316', value: 15 },
  { id: '5', label: 'Bought', amount: '188.60 DZY', percentage: '8%', color: '#EAB308', value: 8 },
  { id: '6', label: 'Earned (Staking)', amount: '164.82 DZY', percentage: '7%', color: '#06B6D4', value: 7 },
];

const USAGE_DATA = [
  { id: '1', label: 'Acheter des produits\net services', amount: '823.19 DZY', percentage: '35%', color: '#0052FF', value: 35 },
  { id: '2', label: 'Payer des factures', amount: '588.71 DZY', percentage: '25%', color: '#10B981', value: 25 },
  { id: '3', label: 'Recharger des mobiles', amount: '352.50 DZY', percentage: '15%', color: '#F97316', value: 15 },
  { id: '4', label: 'Envoyer / Partager', amount: '352.50 DZY', percentage: '15%', color: '#8B5CF6', value: 15 },
  { id: '5', label: 'Épargner', amount: '235.92 DZY', percentage: '10%', color: '#EAB308', value: 10 },
];

export default function RewardsScreen() {
  const navigation = useNavigation();
  const [currentViewMode, setCurrentViewMode] = useState('usages'); // 'usages' or 'acquis'

  const activeData = currentViewMode === 'usages' ? USAGE_DATA : ACQUIRED_DATA;

  // Donut Chart Calculations
  const size = 160;
  const strokeWidth = 26;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  let currentAngle = 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Header Top Bar */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconSquareBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={20} color="#1A2840" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>DZY Rewards</Text>
          <View style={styles.headerRightActions}>
            <TouchableOpacity style={styles.iconSquareBtn}>
              <Ionicons name="help-circle-outline" size={20} color="#1A2840" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconSquareBtn}>
              <Ionicons name="ellipsis-horizontal" size={20} color="#1A2840" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Main Dark Blue Card (3 Columns) */}
          <View style={styles.mainNavyCard}>
            <View style={styles.cardColumnsRow}>
              
              {/* Left Column: Total DZY */}
              <View style={styles.cardCol}>
                <View style={styles.colHeaderRow}>
                  <Text style={styles.colTitleLabel}>Total DZY</Text>
                  <Ionicons name="information-circle-outline" size={12} color="#9CA3AF" style={{ marginLeft: 2 }} />
                </View>
                <Text style={styles.colSubtext}>(Since Day 1)</Text>

                <Text style={styles.colAmountMain}>2,354.82</Text>
                <Text style={styles.dzyTagText}>DZY</Text>

                <Text style={styles.equivText}>≈ 158,500 FCFA</Text>
                <Text style={styles.equivText}>≈ 42.28 USD</Text>
              </View>

              <View style={styles.verticalDivider} />

              {/* Middle Column: + Buy DZY Logo & Cashback Note */}
              <View style={styles.cardCenterCol}>
                <TouchableOpacity style={styles.btnBuyDzy} onPress={() => navigation.navigate('SwapTokensScreen')}>
                  <Text style={styles.btnBuyDzyText}>+ Buy DZY</Text>
                </TouchableOpacity>

                <View style={styles.circleLogoBox}>
                  <Image source={require('../../assets/brand/dizzitup_logo_cercle.png')} style={styles.dzyCircleLogo} resizeMode="contain" />
                </View>

                <Text style={styles.cashbackNoteText}>
                  Buy DZY pour bénéficier{'\n'}du meilleur taux de{'\n'}Cashback à <Text style={{ color: '#FFC759', fontWeight: 'bold' }}>5%</Text>
                </Text>
              </View>

              <View style={styles.verticalDivider} />

              {/* Right Column: Balance */}
              <View style={styles.cardCol}>
                <View style={styles.colHeaderRow}>
                  <Text style={styles.colTitleLabel}>Balance</Text>
                  <Ionicons name="information-circle-outline" size={12} color="#9CA3AF" style={{ marginLeft: 2 }} />
                </View>
                <Text style={styles.colSubtext}> </Text>

                <Text style={styles.colAmountMain}>845.62</Text>
                <Text style={styles.dzyTagText}>DZY</Text>

                <Text style={styles.equivText}>≈ 56,900 FCFA</Text>
                <Text style={styles.equivText}>≈ 15.96 USD</Text>
              </View>

            </View>
          </View>

          {/* Vos récompenses Section */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Vos récompenses</Text>
            <Text style={styles.sectionSubtitle}>Total gagné depuis le Day 1</Text>
          </View>

          <View style={styles.rewardsCardsGrid}>
            {/* Card 1: Parrainage */}
            <View style={styles.rewardCard}>
              <View style={[styles.rewardIconCircle, { backgroundColor: '#DCFCE7' }]}>
                <Ionicons name="people-outline" size={20} color="#10B981" />
              </View>
              <Text style={styles.rewardCardTitle}>Parrainage</Text>
              <Text style={[styles.rewardCardAmount, { color: '#10B981' }]}>860.25 DZY</Text>
              <Text style={styles.rewardCardEquiv}>≈ 57,900 FCFA</Text>
              <Text style={styles.rewardCardEquiv}>≈ 43.01 USD</Text>
            </View>

            {/* Card 2: Cashback */}
            <View style={styles.rewardCard}>
              <View style={[styles.rewardIconCircle, { backgroundColor: '#DCFCE7' }]}>
                <Ionicons name="cash-outline" size={20} color="#10B981" />
              </View>
              <Text style={styles.rewardCardTitle}>Cashback</Text>
              <Text style={[styles.rewardCardAmount, { color: '#10B981' }]}>245.75 DZY</Text>
              <Text style={styles.rewardCardEquiv}>≈ 16,500 FCFA</Text>
              <Text style={styles.rewardCardEquiv}>≈ 12.29 USD</Text>
            </View>

            {/* Card 3: Actions */}
            <View style={styles.rewardCard}>
              <View style={[styles.rewardIconCircle, { backgroundColor: '#EFF6FF' }]}>
                <Ionicons name="flash-outline" size={20} color="#0052FF" />
              </View>
              <Text style={styles.rewardCardTitle}>Actions</Text>
              <Text style={[styles.rewardCardAmount, { color: '#0052FF' }]}>120.50 DZY</Text>
              <Text style={styles.rewardCardEquiv}>≈ 8,100 FCFA</Text>
              <Text style={styles.rewardCardEquiv}>≈ 6.03 USD</Text>
            </View>
          </View>

          {/* Section Header: Vos usages de DZY / Tous les DZY que vous avez acquis */}
          <View style={styles.acquiredHeaderRow}>
            <View>
              <Text style={styles.sectionTitle}>
                {currentViewMode === 'usages' ? 'Vos usages de DZY' : 'Tous les DZY que vous avez acquis'}
              </Text>
              <Text style={styles.sectionSubtitle}>
                {currentViewMode === 'usages' ? 'Total dépensé depuis le Day 1' : 'Total gagné depuis le Day 1'}
              </Text>
            </View>
            <TouchableOpacity style={styles.filterPillBtn}>
              <Text style={styles.filterPillText}>All DZY Types</Text>
              <Ionicons name="chevron-down" size={12} color="#1A2840" />
            </TouchableOpacity>
          </View>

          {/* Donut Chart & Breakdown Legend Container */}
          <View style={styles.chartLegendContainer}>
            {/* Donut Chart Wrapper */}
            <View style={styles.chartWrapper}>
              <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                {activeData.map((item) => {
                  const strokeDashoffset = circumference - (circumference * item.value) / 100;
                  const angle = (item.value / 100) * 360;
                  const rotation = currentAngle;
                  currentAngle += angle;

                  return (
                    <Circle
                      key={item.id}
                      cx={size / 2}
                      cy={size / 2}
                      r={radius}
                      stroke={item.color}
                      strokeWidth={strokeWidth}
                      fill="transparent"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      transform={`rotate(${rotation - 90} ${size / 2} ${size / 2})`}
                      strokeLinecap="butt"
                    />
                  );
                })}
              </Svg>

              {/* Donut Chart Center Text */}
              <View style={styles.chartCenterTextWrapper}>
                <Text style={styles.chartCenterValText}>2,354.82</Text>
                <Text style={styles.chartCenterDzyText}>DZY</Text>
                <Text style={styles.chartCenterSubText}>Total</Text>
              </View>
            </View>

            {/* Breakdown Legend List */}
            <View style={styles.legendWrapper}>
              {activeData.map((item) => (
                <View key={item.id} style={styles.legendRowItem}>
                  <View style={[styles.legendColorDot, { backgroundColor: item.color }]} />
                  <View style={styles.legendLabelGroup}>
                    <Text style={styles.legendItemName}>{item.label}</Text>
                    <Text style={styles.legendItemAmount}>{item.amount}</Text>
                  </View>
                  <Text style={styles.legendItemPercent}>{item.percentage}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Card Flip Toggle Banner */}
          <TouchableOpacity 
            style={styles.flipCardBanner} 
            onPress={() => setCurrentViewMode(prev => prev === 'usages' ? 'acquis' : 'usages')}
            activeOpacity={0.8}
          >
            <Ionicons name="refresh-outline" size={16} color="#6B7280" />
            <Text style={styles.flipBannerText}>
              Retournez la carte pour voir{' '}
              <Text style={{ color: '#FFC759', fontWeight: 'bold' }}>
                {currentViewMode === 'usages' ? 'tous les DZY que vous avez acquis' : 'vos usages de DZY'}
              </Text>
            </Text>
            <Ionicons name="swap-horizontal" size={16} color="#6B7280" />
          </TouchableOpacity>

          {/* Info Card Banner */}
          <View style={styles.infoBoxBanner}>
            <Ionicons name="information-circle-outline" size={22} color="#1A2840" style={{ marginRight: 10 }} />
            <Text style={styles.infoBoxText}>
              DZY est un "utility token" au standard ERC20{'\n'}sur le réseau Polygon.
            </Text>
          </View>

          {/* Footer Expiration Note */}
          <View style={styles.expirationFooterRow}>
            <Ionicons name="time-outline" size={14} color="#6B7280" style={{ marginRight: 4 }} />
            <Text style={styles.expirationFooterText}>Les Rewards expirent après 12 mois. </Text>
            <Ionicons name="information-circle-outline" size={14} color="#6B7280" />
          </View>

          <View style={{ height: 20 }} />
        </ScrollView>

        <BottomNavBar activeTab="home" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? Math.max(StatusBar.currentHeight || 0, 44) + 6 : 14,
  },
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 10 },
  iconSquareBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 17, color: '#1A2840' },
  headerRightActions: { flexDirection: 'row', gap: 6 },
  scrollView: { flex: 1 },
  scrollContent: { paddingTop: 6, paddingBottom: 30, paddingHorizontal: 16 },
  mainNavyCard: { backgroundColor: '#071D54', borderRadius: 20, padding: 14, marginBottom: 20 },
  cardColumnsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardCol: { flex: 1 },
  colHeaderRow: { flexDirection: 'row', alignItems: 'center' },
  colTitleLabel: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#9CA3AF' },
  colSubtext: { fontFamily: 'Inter_400Regular', fontSize: 9, color: '#6B7280', marginBottom: 6 },
  colAmountMain: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 20, color: '#FFFFFF' },
  dzyTagText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 13, color: '#FFC759', marginBottom: 8 },
  equivText: { fontFamily: 'Inter_400Regular', fontSize: 10, color: '#9CA3AF', lineHeight: 14 },
  verticalDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.1)', height: '100%', marginHorizontal: 8 },
  cardCenterCol: { flex: 1.1, alignItems: 'center', justifyContent: 'center' },
  btnBuyDzy: { backgroundColor: '#FFC759', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, marginBottom: 8 },
  btnBuyDzyText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 11, color: '#1A2840' },
  circleLogoBox: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  dzyCircleLogo: { width: 44, height: 44 },
  cashbackNoteText: { fontFamily: 'Inter_400Regular', fontSize: 9, color: '#FFFFFF', textAlign: 'center', lineHeight: 12 },
  sectionHeaderRow: { marginBottom: 12 },
  sectionTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 15, color: '#1A2840' },
  sectionSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#6B7280', marginTop: 1 },
  rewardsCardsGrid: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  rewardCard: { flex: 1, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F0F2F5', borderRadius: 16, padding: 10, alignItems: 'center' },
  rewardIconCircle: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  rewardCardTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#1A2840', marginBottom: 4 },
  rewardCardAmount: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 13, marginBottom: 6 },
  rewardCardEquiv: { fontFamily: 'Inter_400Regular', fontSize: 10, color: '#9CA3AF', lineHeight: 13 },
  acquiredHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  filterPillBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5 },
  filterPillText: { fontFamily: 'Inter_500Medium', fontSize: 11, color: '#1A2840', marginRight: 4 },
  chartLegendContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  chartWrapper: { width: 160, height: 160, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  chartCenterTextWrapper: { position: 'absolute', justifyContent: 'center', alignItems: 'center' },
  chartCenterValText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 15, color: '#1A2840' },
  chartCenterDzyText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 11, color: '#1A2840' },
  chartCenterSubText: { fontFamily: 'Inter_400Regular', fontSize: 10, color: '#9CA3AF' },
  legendWrapper: { flex: 1, marginLeft: 14, gap: 8 },
  legendRowItem: { flexDirection: 'row', alignItems: 'center' },
  legendColorDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8, marginTop: 3, alignSelf: 'flex-start' },
  legendLabelGroup: { flex: 1 },
  legendItemName: { fontFamily: 'Inter_500Medium', fontSize: 11, color: '#1A2840', lineHeight: 14 },
  legendItemAmount: { fontFamily: 'Inter_400Regular', fontSize: 10, color: '#9CA3AF' },
  legendItemPercent: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 11, color: '#1A2840' },
  flipCardBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#F1F5F9', borderRadius: 14, padding: 12, marginBottom: 16 },
  flipBannerText: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#6B7280' },
  infoBoxBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#F1F5F9', borderRadius: 16, padding: 14, marginBottom: 16 },
  infoBoxText: { fontFamily: 'Inter_500Medium', fontSize: 12, color: '#1A2840', lineHeight: 17 },
  expirationFooterRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  expirationFooterText: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#6B7280' }
});
