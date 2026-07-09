import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, G, Text as SvgText } from 'react-native-svg';
import BottomNavBar from '../components/BottomNavBar';

const USAGE_DATA = [
  { id: '1', label: 'Acheter des produits\net services', amount: '823.19 DZY', percentage: '35%', color: '#0D6EFD', value: 35 },
  { id: '2', label: 'Payer des factures', amount: '588.71 DZY', percentage: '25%', color: '#198754', value: 25 },
  { id: '3', label: 'Recharger des mobiles', amount: '352.50 DZY', percentage: '15%', color: '#FD7E14', value: 15 },
  { id: '4', label: 'Envoyer / Partager', amount: '352.50 DZY', percentage: '15%', color: '#6F42C1', value: 15 },
  { id: '5', label: 'Épargner', amount: '235.92 DZY', percentage: '10%', color: '#FFC107', value: 10 },
];

export default function RewardsScreen() {
  // Simple Donut Chart Calculation
  const size = 180;
  const strokeWidth = 35;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  let currentAngle = 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#1A2840" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>DZY Rewards</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="help-circle-outline" size={20} color="#1A2840" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="ellipsis-horizontal" size={20} color="#1A2840" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          
          {/* Main Top Card */}
          <View style={styles.mainCard}>
            <View style={styles.mainCardContent}>
              {/* Left Column */}
              <View style={styles.cardCol}>
                <View style={styles.colHeader}>
                  <Text style={styles.colTitle}>Total DZY</Text>
                  <Ionicons name="information-circle-outline" size={12} color="#94A3B8" style={styles.infoIcon} />
                </View>
                <Text style={styles.colSub}>(Since Day 1)</Text>
                
                <Text style={styles.mainValue}>2,354.82</Text>
                <Text style={styles.dzyLabel}>DZY</Text>
                
                <Text style={styles.conversionText}>≈ 158,500 FCFA</Text>
                <Text style={styles.conversionText}>≈ 42.28 USD</Text>
              </View>

              {/* Center Column (Logo & Button) */}
              <View style={styles.centerCol}>
                <TouchableOpacity style={styles.topUpBtn}>
                  <Ionicons name="add" size={14} color="#1A2840" />
                  <Text style={styles.topUpText}>Top up</Text>
                </TouchableOpacity>
                <View style={styles.dzyLogoWrapper}>
                  <Image source={require('../../dizzitup logo cercle.png')} style={styles.dzyLogoImg} resizeMode="contain" />
                </View>
              </View>

              {/* Right Column */}
              <View style={styles.cardCol}>
                <View style={styles.colHeader}>
                  <Text style={styles.colTitle}>Balance</Text>
                  <Ionicons name="information-circle-outline" size={12} color="#94A3B8" style={styles.infoIcon} />
                </View>
                <Text style={styles.colSub}> </Text>
                
                <Text style={styles.mainValue}>845.62</Text>
                <Text style={styles.dzyLabel}>DZY</Text>
                
                <Text style={styles.conversionText}>≈ 56,900 FCFA</Text>
                <Text style={styles.conversionText}>≈ 15.96 USD</Text>
              </View>
            </View>
            
            {/* Grid Pattern Simulation */}
            <View style={styles.gridOverlay} pointerEvents="none">
              <View style={styles.gridLineV1} />
              <View style={styles.gridLineV2} />
              <View style={styles.gridLineH1} />
            </View>
          </View>

          {/* Vos récompenses section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Vos récompenses</Text>
            <Text style={styles.sectionSubTitle}>Total gagné depuis le Day 1</Text>
          </View>

          <View style={styles.rewardsRow}>
            {/* Parrainage Card */}
            <View style={styles.rewardCard}>
              <View style={[styles.rewardIconBox, {borderColor: '#10B981'}]}>
                <Ionicons name="people-outline" size={24} color="#10B981" />
              </View>
              <Text style={styles.rewardCardTitle}>Parrainage</Text>
              <Text style={[styles.rewardCardAmount, {color: '#10B981'}]}>860.25 DZY</Text>
              <Text style={styles.rewardCardConv}>≈ 57,900 FCFA</Text>
              <Text style={styles.rewardCardConv}>≈ 43.01 USD</Text>
            </View>

            {/* Cashback Card */}
            <View style={styles.rewardCard}>
              <View style={[styles.rewardIconBox, {borderColor: '#10B981'}]}>
                <Ionicons name="ticket-outline" size={24} color="#10B981" />
              </View>
              <Text style={styles.rewardCardTitle}>Cashback</Text>
              <Text style={[styles.rewardCardAmount, {color: '#10B981'}]}>245.75 DZY</Text>
              <Text style={styles.rewardCardConv}>≈ 16,500 FCFA</Text>
              <Text style={styles.rewardCardConv}>≈ 12.29 USD</Text>
            </View>

            {/* Actions Card */}
            <View style={styles.rewardCard}>
              <View style={[styles.rewardIconBox, {borderColor: '#3B82F6'}]}>
                <Ionicons name="flash-outline" size={24} color="#3B82F6" />
              </View>
              <Text style={styles.rewardCardTitle}>Actions</Text>
              <Text style={[styles.rewardCardAmount, {color: '#3B82F6'}]}>120.50 DZY</Text>
              <Text style={styles.rewardCardConv}>≈ 8,100 FCFA</Text>
              <Text style={styles.rewardCardConv}>≈ 6.03 USD</Text>
            </View>
          </View>

          {/* Vos usages de DZY section */}
          <View style={styles.sectionHeaderUsage}>
            <View>
              <Text style={styles.sectionTitle}>Vos usages de DZY</Text>
              <Text style={styles.sectionSubTitle}>Total dépensé depuis le Day 1</Text>
            </View>
            <TouchableOpacity style={styles.dropdownBtn}>
              <Text style={styles.dropdownText}>All DZY Types</Text>
              <Ionicons name="chevron-down" size={14} color="#1A2840" />
            </TouchableOpacity>
          </View>

          {/* Chart & Legend Area */}
          <View style={styles.usageContainer}>
            {/* Chart */}
            <View style={styles.chartWrapper}>
              <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <G rotation="-90" origin={`${size/2}, ${size/2}`}>
                  {USAGE_DATA.map((item, index) => {
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
                        rotation={rotation}
                        origin={`${size/2}, ${size/2}`}
                        strokeLinecap="butt"
                      />
                    );
                  })}
                </G>
              </Svg>
              
              {/* Center Labels */}
              <View style={styles.chartCenterLabels}>
                <Text style={styles.chartCenterVal}>2,354.82</Text>
                <Text style={styles.chartCenterDzy}>DZY</Text>
                <Text style={styles.chartCenterTotal}>Total</Text>
              </View>
              
              {/* Percentage Labels on Chart */}
              {USAGE_DATA.map((item, index) => {
                // Calculate position for text
                const previousVals = USAGE_DATA.slice(0, index).reduce((acc, curr) => acc + curr.value, 0);
                const angleInDegrees = (previousVals + item.value / 2) * 3.6 - 90;
                const angleInRadians = (angleInDegrees * Math.PI) / 180;
                const textRadius = radius;
                const x = size / 2 + textRadius * Math.cos(angleInRadians);
                const y = size / 2 + textRadius * Math.sin(angleInRadians);

                return (
                  <View key={`text-${item.id}`} style={[styles.chartPercentLabel, { left: x - 12, top: y - 10 }]}>
                    <Text style={styles.chartPercentText}>{item.percentage}</Text>
                  </View>
                );
              })}
            </View>

            {/* Legend */}
            <View style={styles.legendContainer}>
              {USAGE_DATA.map((item) => (
                <View key={item.id} style={styles.legendRow}>
                  <View style={[styles.legendDot, {backgroundColor: item.color}]} />
                  <View style={styles.legendInfo}>
                    <Text style={styles.legendLabel}>{item.label}</Text>
                    <Text style={styles.legendAmount}>{item.amount}</Text>
                  </View>
                  <Text style={styles.legendPercent}>{item.percentage}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Return Card Banner */}
          <View style={styles.returnBanner}>
            <Ionicons name="sync-outline" size={20} color="#64748B" />
            <Text style={styles.returnBannerText}>Retournez la carte pour voir <Text style={styles.returnBannerHighlight}>tous les DZY que vous avez acquis</Text></Text>
            <Ionicons name="swap-horizontal" size={20} color="#64748B" />
          </View>

          {/* Info & Expiration */}
          <View style={styles.infoBanner}>
            <Ionicons name="information-circle-outline" size={24} color="#1A2840" />
            <Text style={styles.infoBannerText}>
              DZY est un "utility token" au standard ERC20{'\n'}sur le réseau Polygon.
            </Text>
          </View>
          
          <View style={styles.expirationInfo}>
            <Ionicons name="time-outline" size={16} color="#64748B" />
            <Text style={styles.expirationText}>Les Rewards expirent après 12 mois.</Text>
            <Ionicons name="information-circle-outline" size={14} color="#64748B" />
          </View>

          <View style={{height: 30}} />
        </ScrollView>

        <BottomNavBar activeTab="Accueil" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    color: '#0F172A',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  mainCard: {
    backgroundColor: '#05112F',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 20,
    padding: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  mainCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 2,
  },
  cardCol: {
    flex: 1,
  },
  colHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  colTitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#F8FAFC',
  },
  infoIcon: {
    marginLeft: 4,
  },
  colSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: '#94A3B8',
    marginBottom: 12,
  },
  mainValue: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 22,
    color: '#FFFFFF',
  },
  dzyLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#FFC759',
    marginBottom: 12,
  },
  conversionText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: '#E2E8F0',
    marginTop: 4,
  },
  centerCol: {
    width: 90,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  topUpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFC759',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 16,
  },
  topUpText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    color: '#1A2840',
    marginLeft: 2,
  },
  dzyLogoWrapper: {
    width: 60,
    height: 60,
  },
  dzyLogoImg: {
    width: '100%',
    height: '100%',
  },
  gridOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 1,
  },
  gridLineV1: {
    position: 'absolute', left: '38%', top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(255,255,255,0.05)'
  },
  gridLineV2: {
    position: 'absolute', right: '38%', top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(255,255,255,0.05)'
  },
  sectionHeader: {
    marginHorizontal: 16,
    marginTop: 32,
    marginBottom: 16,
  },
  sectionHeaderUsage: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 32,
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: '#0F172A',
  },
  sectionSubTitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  rewardsRow: {
    flexDirection: 'row',
    paddingHorizontal: 12, // slightly less than 16 to fit 3 cards better
    gap: 8,
  },
  rewardCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  rewardIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#F8FAFC',
  },
  rewardCardTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#1A2840',
    marginBottom: 8,
  },
  rewardCardAmount: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    marginBottom: 12,
  },
  rewardCardConv: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  dropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  dropdownText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#1A2840',
    marginRight: 6,
  },
  usageContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    alignItems: 'center',
  },
  chartWrapper: {
    width: 180,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  chartCenterLabels: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartCenterVal: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 16,
    color: '#1A2840',
  },
  chartCenterDzy: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#1A2840',
  },
  chartCenterTotal: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  chartPercentLabel: {
    position: 'absolute',
    width: 30,
    alignItems: 'center',
  },
  chartPercentText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 2,
  },
  legendContainer: {
    flex: 1,
    marginLeft: 16,
    gap: 12,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  legendInfo: {
    flex: 1,
  },
  legendLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    color: '#1A2840',
    lineHeight: 14,
  },
  legendAmount: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  legendPercent: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: '#1A2840',
    alignSelf: 'flex-end',
    marginBottom: 14,
  },
  returnBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    marginHorizontal: 16,
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
  },
  returnBannerText: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    marginHorizontal: 12,
  },
  returnBannerHighlight: {
    fontFamily: 'Inter_600SemiBold',
    color: '#F59E0B', // Yellow
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    marginHorizontal: 16,
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
  },
  infoBannerText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: '#1A2840',
    marginLeft: 12,
    lineHeight: 20,
  },
  expirationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 6,
  },
  expirationText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#1A2840',
  },
});
