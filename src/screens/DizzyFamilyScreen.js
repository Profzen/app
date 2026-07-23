import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import BottomNavBar from '../components/BottomNavBar';
import AppToast from '../components/AppToast';

export default function DizzyFamilyScreen() {
  const navigation = useNavigation();
  const [toast, setToast] = useState(null);

  const referralCode = 'DAVID5';

  const handleBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate('MoreSettingsScreen');
  };

  const handleCopyCode = () => {
    setToast({ title: 'Code copié', message: `Le code de parrainage ${referralCode} a été copié dans le presse-papier.` });
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
              <Text style={styles.pageTitle}>DizzyFamily Program</Text>
              <Text style={styles.pageSubtitle}>Programme de fidélité & avantages exclusifs</Text>
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
            <Text style={styles.pointsLabel}>Points de fidélité accumulés</Text>

            {/* Tier Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBarBackground}>
                <View style={[styles.progressBarFill, { width: '75%' }]} />
              </View>
              <View style={styles.progressLabels}>
                <Text style={styles.progressText}>Niveau Gold</Text>
                <Text style={styles.progressTextNext}>Platinum (5 000 DZY)</Text>
              </View>
            </View>
          </View>

          {/* Referral Code Box */}
          <Text style={styles.sectionHeader}>VOTRE CODE DE PARRAINAGE</Text>
          <View style={styles.referralCard}>
            <View style={styles.referralLeft}>
              <Text style={styles.referralLabel}>Code unique :</Text>
              <Text style={styles.referralCode}>{referralCode}</Text>
            </View>
            <TouchableOpacity style={styles.copyBtn} onPress={handleCopyCode}>
              <Ionicons name="copy-outline" size={18} color="#1A2840" style={{ marginRight: 4 }} />
              <Text style={styles.copyBtnText}>Copier</Text>
            </TouchableOpacity>
          </View>

          {/* Referral Stats */}
          <Text style={styles.sectionHeader}>VOS STATISTIQUES</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Ionicons name="people-outline" size={22} color="#3B82F6" />
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>Filleuls invités</Text>
            </View>
            <View style={styles.statBox}>
              <Ionicons name="cash-outline" size={22} color="#10B981" />
              <Text style={styles.statNumber}>$60</Text>
              <Text style={styles.statLabel}>Gagnés en DZY</Text>
            </View>
            <View style={styles.statBox}>
              <Ionicons name="flash-outline" size={22} color="#F59E0B" />
              <Text style={styles.statNumber}>5%</Text>
              <Text style={styles.statLabel}>Cashback Actif</Text>
            </View>
          </View>

          {/* Member Benefits */}
          <Text style={styles.sectionHeader}>AVANTAGES DIZZYFAMILY GOLD</Text>
          <View style={styles.card}>
            <View style={styles.benefitRow}>
              <View style={[styles.benefitIcon, { backgroundColor: '#EFF6FF' }]}>
                <Ionicons name="star-outline" size={20} color="#3B82F6" />
              </View>
              <View style={styles.benefitText}>
                <Text style={styles.benefitTitle}>Bonus de Cashback +2%</Text>
                <Text style={styles.benefitDesc}>Sur tous vos achats boutiques et paiements</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.benefitRow}>
              <View style={[styles.benefitIcon, { backgroundColor: '#ECFDF5' }]}>
                <Ionicons name="swap-horizontal-outline" size={20} color="#10B981" />
              </View>
              <View style={styles.benefitText}>
                <Text style={styles.benefitTitle}>Swaps sans frais réseau</Text>
                <Text style={styles.benefitDesc}>Échanges DZY / Stablecoins illimités</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.benefitRow}>
              <View style={[styles.benefitIcon, { backgroundColor: '#FFFBEB' }]}>
                <Ionicons name="headset-outline" size={20} color="#F59E0B" />
              </View>
              <View style={styles.benefitText}>
                <Text style={styles.benefitTitle}>Support VIP Prioritaire</Text>
                <Text style={styles.benefitDesc}>Assistance dédiée via Aminata AI & conseillers</Text>
              </View>
            </View>
          </View>

          {/* Action Link to Rewards */}
          <TouchableOpacity style={styles.rewardsLinkBtn} onPress={() => navigation.navigate('RewardsScreen')}>
            <Ionicons name="gift-outline" size={20} color="#1A2840" style={{ marginRight: 8 }} />
            <Text style={styles.rewardsLinkBtnText}>Voir le tableau de bord Rewards (Donut Charts)</Text>
          </TouchableOpacity>

          <View style={{ height: 30 }} />
        </ScrollView>

        <BottomNavBar activeTab="More" language="fr" />
        <AppToast visible={!!toast} title={toast?.title} message={toast?.message} onClose={() => setToast(null)} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAFAFC' },
  container: { flex: 1, backgroundColor: '#FAFAFC' },
  content: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
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
