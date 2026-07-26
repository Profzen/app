import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, Image, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import BottomNavBar from '../components/BottomNavBar';
import AppToast from '../components/AppToast';
import { useApp } from '../context/AppContext';

export default function DizzyFamilyScreen() {
  const navigation = useNavigation();
  const { language, t } = useApp();
  const [toast, setToast] = useState(null);

  const referralCode = 'DAVID5';

  const handleBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate('MoreSettingsScreen');
  };

  const handleCopyCode = () => {
    setToast({ 
      title: language === 'fr' ? 'Code copié' : 'Code Copied', 
      message: language === 'fr' ? `Le code de parrainage ${referralCode} a été copié.` : `Referral code ${referralCode} copied to clipboard.` 
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack} accessibilityLabel="Retour">
              <Ionicons name="arrow-back" size={22} color="#1A2840" />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.pageTitle}>{t('dizzyFamily', 'DizzyFamily Program')}</Text>
              <Text style={styles.pageSubtitle}>{language === 'fr' ? 'Programme de fidélité & avantages exclusifs' : 'Loyalty program & exclusive perks'}</Text>
            </View>
          </View>

          {/* Hero Loyalty Card */}
          <View style={styles.heroCard}>
            <View style={styles.heroHeader}>
              <View style={styles.goldBadge}>
                <Ionicons name="trophy" size={14} color="#1A2840" />
                <Text style={styles.goldBadgeText}>GOLD MEMBER</Text>
              </View>
              <Image source={require('../../assets/brand/dizzitup_logo_cercle.png')} style={{ width: 34, height: 34 }} resizeMode="contain" />
            </View>

            <Text style={styles.pointsNumber}>4,850 <Text style={{ fontSize: 16 }}>DZY</Text></Text>
            <Text style={styles.pointsLabel}>{language === 'fr' ? 'Points de fidélité accumulés' : 'Accumulated loyalty points'}</Text>

            {/* Tier Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBarBackground}>
                <View style={[styles.progressBarFill, { width: '75%' }]} />
              </View>
              <View style={styles.progressLabels}>
                <Text style={styles.progressText}>{language === 'fr' ? 'Niveau Gold' : 'Gold Level'}</Text>
                <Text style={styles.progressTextNext}>Platinum (5 000 DZY)</Text>
              </View>
            </View>
          </View>

          {/* Referral Code Box */}
          <Text style={styles.sectionHeader}>{language === 'fr' ? 'VOTRE CODE DE PARRAINAGE' : 'YOUR REFERRAL CODE'}</Text>
          <View style={styles.referralCard}>
            <View style={styles.referralLeft}>
              <Text style={styles.referralLabel}>{language === 'fr' ? 'Code unique :' : 'Unique Code:'}</Text>
              <Text style={styles.referralCode}>{referralCode}</Text>
            </View>
            <TouchableOpacity style={styles.copyBtn} onPress={handleCopyCode}>
              <Ionicons name="copy-outline" size={18} color="#1A2840" style={{ marginRight: 4 }} />
              <Text style={styles.copyBtnText}>{language === 'fr' ? 'Copier' : 'Copy'}</Text>
            </TouchableOpacity>
          </View>

          {/* Referral Stats */}
          <Text style={styles.sectionHeader}>{language === 'fr' ? 'VOS STATISTIQUES' : 'YOUR STATISTICS'}</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Ionicons name="people-outline" size={22} color="#3B82F6" />
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>{language === 'fr' ? 'Filleuls invités' : 'Invited Referrals'}</Text>
            </View>
            <View style={styles.statBox}>
              <Ionicons name="cash-outline" size={22} color="#10B981" />
              <Text style={styles.statNumber}>$60</Text>
              <Text style={styles.statLabel}>{language === 'fr' ? 'Gagnés en DZY' : 'Earned in DZY'}</Text>
            </View>
            <View style={styles.statBox}>
              <Ionicons name="flash-outline" size={22} color="#F59E0B" />
              <Text style={styles.statNumber}>5%</Text>
              <Text style={styles.statLabel}>{language === 'fr' ? 'Cashback Actif' : 'Active Cashback'}</Text>
            </View>
          </View>

          {/* Member Benefits */}
          <Text style={styles.sectionHeader}>{language === 'fr' ? 'AVANTAGES DIZZYFAMILY GOLD' : 'DIZZYFAMILY GOLD PERKS'}</Text>
          <View style={styles.card}>
            <View style={styles.benefitRow}>
              <View style={[styles.benefitIcon, { backgroundColor: '#EFF6FF' }]}>
                <Ionicons name="star-outline" size={20} color="#3B82F6" />
              </View>
              <View style={styles.benefitText}>
                <Text style={styles.benefitTitle}>{language === 'fr' ? 'Bonus de Cashback +2%' : '+2% Cashback Bonus'}</Text>
                <Text style={styles.benefitDesc}>{language === 'fr' ? 'Sur tous vos achats boutiques et paiements' : 'On all shop purchases and payments'}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.benefitRow}>
              <View style={[styles.benefitIcon, { backgroundColor: '#ECFDF5' }]}>
                <Ionicons name="swap-horizontal-outline" size={20} color="#10B981" />
              </View>
              <View style={styles.benefitText}>
                <Text style={styles.benefitTitle}>{language === 'fr' ? 'Swaps sans frais réseau' : 'Zero network fee Swaps'}</Text>
                <Text style={styles.benefitDesc}>{language === 'fr' ? 'Échanges DZY / Stablecoins illimités' : 'Unlimited DZY / Stablecoins exchanges'}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.benefitRow}>
              <View style={[styles.benefitIcon, { backgroundColor: '#FFFBEB' }]}>
                <Ionicons name="headset-outline" size={20} color="#F59E0B" />
              </View>
              <View style={styles.benefitText}>
                <Text style={styles.benefitTitle}>{language === 'fr' ? 'Support VIP Prioritaire' : 'Priority VIP Support'}</Text>
                <Text style={styles.benefitDesc}>{language === 'fr' ? 'Assistance dédiée via Aminata AI & conseillers' : 'Dedicated assistance via Aminata AI & agents'}</Text>
              </View>
            </View>
          </View>

          {/* Action Link to Rewards */}
          <TouchableOpacity style={styles.rewardsLinkBtn} onPress={() => navigation.navigate('RewardsScreen')}>
            <Ionicons name="gift-outline" size={20} color="#1A2840" style={{ marginRight: 8 }} />
            <Text style={styles.rewardsLinkBtnText}>{language === 'fr' ? 'Voir le tableau de bord Rewards' : 'View Rewards Dashboard'}</Text>
          </TouchableOpacity>

          <View style={{ height: 30 }} />
        </ScrollView>

        <BottomNavBar activeTab="More" />
        <AppToast visible={!!toast} title={toast?.title} message={toast?.message} onClose={() => setToast(null)} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAFAFC',
    paddingTop: Platform.OS === 'android' ? Math.max(StatusBar.currentHeight || 0, 44) + 6 : 14,
  },
  container: { flex: 1, backgroundColor: '#FAFAFC' },
  content: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, },
  backButton: { paddingRight: 14, paddingVertical: 4 },
  headerTitleContainer: { flex: 1 },
  pageTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 22, color: '#1A2840' },
  pageSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 13, color: '#6B7280', marginTop: 2 },
  heroCard: { backgroundColor: '#1A2840', borderRadius: 20, padding: 20, marginBottom: 16 },
  heroHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  goldBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFC759', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  goldBadgeText: { fontFamily: 'Inter_700Bold', fontSize: 11, color: '#1A2840', marginLeft: 4 },
  pointsNumber: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 32, color: '#FFFFFF' },
  pointsLabel: { fontFamily: 'Inter_400Regular', fontSize: 13, color: '#9CA3AF', marginTop: 2, marginBottom: 16 },
  progressContainer: { marginTop: 4 },
  progressBarBackground: { height: 8, backgroundColor: '#374151', borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: 8, backgroundColor: '#FFC759', borderRadius: 4 },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  progressText: { fontFamily: 'Inter_500Medium', fontSize: 11, color: '#FFC759' },
  progressTextNext: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#9CA3AF' },
  sectionHeader: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 11, color: '#9CA3AF', letterSpacing: 0.8, marginTop: 10, marginBottom: 8, marginLeft: 4 },
  referralCard: { backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#F0F2F5', padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  referralLeft: { flex: 1 },
  referralLabel: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#6B7280' },
  referralCode: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 20, color: '#1A2840', letterSpacing: 2, marginTop: 2 },
  copyBtn: { backgroundColor: '#FFC759', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, flexDirection: 'row', alignItems: 'center' },
  copyBtnText: { fontFamily: 'Inter_700Bold', fontSize: 13, color: '#1A2840' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  statBox: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#F0F2F5', padding: 12, alignItems: 'center', marginHorizontal: 4 },
  statNumber: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 18, color: '#1A2840', marginTop: 6 },
  statLabel: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#6B7280', marginTop: 2, textAlign: 'center' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#F0F2F5', paddingHorizontal: 16, paddingVertical: 6, marginBottom: 16 },
  benefitRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  divider: { height: 1, backgroundColor: '#F3F4F6' },
  benefitIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  benefitText: { flex: 1 },
  benefitTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#1A2840' },
  benefitDesc: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#6B7280', marginTop: 2 },
  rewardsLinkBtn: { height: 50, borderRadius: 14, backgroundColor: '#FFC759', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', shadowColor: '#FFC759', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 2 },
  rewardsLinkBtnText: { fontFamily: 'Inter_700Bold', fontSize: 14, color: '#1A2840' },
});
