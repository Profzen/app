import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function WithdrawFundsMethodScreen() {
  const navigation = useNavigation();
  const [selectedMethod, setSelectedMethod] = useState('bank'); // 'bank' or 'mobile'

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#1A2840" />
          </TouchableOpacity>
          <Text style={styles.pageTitle}>Retirer des fonds</Text>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="headset-outline" size={24} color="#1A2840" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Simple Stepper (1 to 5) */}
          <View style={styles.stepperContainer}>
            <View style={[styles.stepCircle, styles.stepCircleActive]}>
              <Text style={styles.stepNumberActive}>1</Text>
            </View>
            <View style={[styles.stepLine, styles.stepLineActive]} />
            
            <View style={[styles.stepCircle, styles.stepCircleActive]}>
              <Text style={styles.stepNumberActive}>2</Text>
            </View>
            <View style={styles.stepLine} />
            
            <View style={styles.stepCircle}>
              <Text style={styles.stepNumber}>3</Text>
            </View>
            <View style={styles.stepLine} />
            
            <View style={styles.stepCircle}>
              <Text style={styles.stepNumber}>4</Text>
            </View>
            <View style={styles.stepLine} />

            <View style={styles.stepCircle}>
              <Text style={styles.stepNumber}>5</Text>
            </View>
          </View>

          {/* Titles */}
          <Text style={styles.stepOverTitle}>Étape 2/5</Text>
          <Text style={styles.mainTitle}>Choisissez votre mode de réception</Text>
          <Text style={styles.mainSubtitle}>Sélectionnez le moyen par lequel vous souhaitez recevoir vos fonds.</Text>

          {/* Methods Cards */}
          
          {/* Card 1: Virement bancaire */}
          <TouchableOpacity 
            style={[styles.methodCard, selectedMethod === 'bank' && styles.methodCardSelectedBank]}
            onPress={() => setSelectedMethod('bank')}
            activeOpacity={0.8}
          >
            <View style={styles.cardTop}>
              <View style={styles.cardTopLeft}>
                <View style={[styles.cardIconCircle, {backgroundColor: selectedMethod === 'bank' ? '#DCFCE7' : '#F1F5F9'}]}>
                  <Ionicons name="business" size={28} color={selectedMethod === 'bank' ? '#10B981' : '#64748B'} />
                </View>
                <View style={styles.cardHeaderInfo}>
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Text style={styles.cardTitle}>Virement bancaire</Text>
                    <View style={styles.badgeRecommended}>
                      <Text style={styles.badgeRecommendedText}>Recommandé</Text>
                    </View>
                  </View>
                  
                  <View style={styles.featuresList}>
                    <View style={styles.featureItem}>
                      <Ionicons name="checkmark-circle" size={14} color={selectedMethod === 'bank' ? '#10B981' : '#64748B'} />
                      <Text style={styles.featureText}>Idéal pour les montants élevés</Text>
                    </View>
                    <View style={styles.featureItem}>
                      <Ionicons name="checkmark-circle" size={14} color={selectedMethod === 'bank' ? '#10B981' : '#64748B'} />
                      <Text style={styles.featureText}>Sécurisé et fiable</Text>
                    </View>
                    <View style={styles.featureItem}>
                      <Ionicons name="checkmark-circle" size={14} color={selectedMethod === 'bank' ? '#10B981' : '#64748B'} />
                      <Text style={styles.featureText}>Compatible avec toutes les banques</Text>
                    </View>
                  </View>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#1A2840" style={styles.chevronIcon} />
            </View>

            <View style={styles.cardDivider} />

            <View style={styles.cardStatsRow}>
              <View style={styles.statItem}>
                <View style={[styles.statIconCircle, {backgroundColor: selectedMethod === 'bank' ? '#10B981' : '#64748B'}]}>
                  <Ionicons name="time-outline" size={12} color="#FFF" />
                </View>
                <View>
                  <Text style={styles.statLabel}>Délai</Text>
                  <Text style={styles.statValue}>24h à 72h</Text>
                </View>
              </View>
              <View style={styles.statItem}>
                <View style={[styles.statIconCircle, {backgroundColor: selectedMethod === 'bank' ? '#10B981' : '#64748B'}]}>
                  <Text style={{color: '#FFF', fontSize: 10, fontWeight: 'bold'}}>%</Text>
                </View>
                <View>
                  <Text style={styles.statLabel}>Frais DizzitUp</Text>
                  <Text style={styles.statValue}>1,5%</Text>
                </View>
              </View>
              <View style={styles.statItem}>
                <View style={[styles.statIconCircle, {backgroundColor: selectedMethod === 'bank' ? '#10B981' : '#64748B'}]}>
                  <Ionicons name="git-network-outline" size={12} color="#FFF" />
                </View>
                <View>
                  <Text style={styles.statLabel}>Frais réseau</Text>
                  <Text style={styles.statValue}>Variables</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>

          {/* Card 2: Mobile Money */}
          <TouchableOpacity 
            style={[styles.methodCard, selectedMethod === 'mobile' && styles.methodCardSelectedMobile]}
            onPress={() => setSelectedMethod('mobile')}
            activeOpacity={0.8}
          >
            <View style={styles.cardTop}>
              <View style={styles.cardTopLeft}>
                <View style={[styles.cardIconCircle, {backgroundColor: selectedMethod === 'mobile' ? '#DBEAFE' : '#F1F5F9'}]}>
                  <Ionicons name="phone-portrait-outline" size={28} color={selectedMethod === 'mobile' ? '#3B82F6' : '#64748B'} />
                </View>
                <View style={styles.cardHeaderInfo}>
                  <Text style={styles.cardTitle}>Mobile Money</Text>
                  
                  <View style={styles.featuresList}>
                    <View style={styles.featureItem}>
                      <Ionicons name="checkmark-circle" size={14} color={selectedMethod === 'mobile' ? '#3B82F6' : '#64748B'} />
                      <Text style={styles.featureText}>Réception instantanée</Text>
                    </View>
                    <View style={styles.featureItem}>
                      <Ionicons name="checkmark-circle" size={14} color={selectedMethod === 'mobile' ? '#3B82F6' : '#64748B'} />
                      <Text style={styles.featureText}>Disponible 24/7</Text>
                    </View>
                    <View style={styles.featureItem}>
                      <Ionicons name="checkmark-circle" size={14} color={selectedMethod === 'mobile' ? '#3B82F6' : '#64748B'} />
                      <Text style={styles.featureText}>Idéal pour un usage quotidien</Text>
                    </View>
                  </View>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#1A2840" style={styles.chevronIcon} />
            </View>

            <View style={styles.cardDivider} />

            <View style={styles.cardStatsRow}>
              <View style={styles.statItem}>
                <View style={[styles.statIconCircle, {backgroundColor: selectedMethod === 'mobile' ? '#3B82F6' : '#64748B'}]}>
                  <Ionicons name="time-outline" size={12} color="#FFF" />
                </View>
                <View>
                  <Text style={styles.statLabel}>Délai</Text>
                  <Text style={styles.statValue}>Instantané</Text>
                </View>
              </View>
              <View style={styles.statItem}>
                <View style={[styles.statIconCircle, {backgroundColor: selectedMethod === 'mobile' ? '#3B82F6' : '#64748B'}]}>
                  <Text style={{color: '#FFF', fontSize: 10, fontWeight: 'bold'}}>%</Text>
                </View>
                <View>
                  <Text style={styles.statLabel}>Frais DizzitUp</Text>
                  <Text style={styles.statValue}>2,0%</Text>
                </View>
              </View>
              <View style={styles.statItem}>
                <View style={[styles.statIconCircle, {backgroundColor: selectedMethod === 'mobile' ? '#3B82F6' : '#64748B'}]}>
                  <Ionicons name="git-network-outline" size={12} color="#FFF" />
                </View>
                <View>
                  <Text style={styles.statLabel}>Frais réseau</Text>
                  <Text style={styles.statValue}>Variables</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>

          {/* Card 3: Carte bancaire (Disabled) */}
          <View style={[styles.methodCard, styles.methodCardDisabled]}>
            <View style={styles.cardTop}>
              <View style={styles.cardTopLeft}>
                <View style={[styles.cardIconCircle, {backgroundColor: '#E2E8F0'}]}>
                  <Ionicons name="card-outline" size={28} color="#94A3B8" />
                </View>
                <View style={styles.cardHeaderInfo}>
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Text style={[styles.cardTitle, {color: '#94A3B8'}]}>Carte bancaire</Text>
                    <View style={styles.badgeComingSoon}>
                      <Text style={styles.badgeComingSoonText}>Bientôt disponible</Text>
                    </View>
                  </View>
                  
                  <View style={styles.featuresList}>
                    <View style={styles.featureItem}>
                      <Ionicons name="checkmark-circle" size={14} color="#94A3B8" />
                      <Text style={[styles.featureText, {color: '#94A3B8'}]}>Retrait sur votre carte</Text>
                    </View>
                    <View style={styles.featureItem}>
                      <Ionicons name="checkmark-circle" size={14} color="#94A3B8" />
                      <Text style={[styles.featureText, {color: '#94A3B8'}]}>Utilisable partout</Text>
                    </View>
                    <View style={styles.featureItem}>
                      <Ionicons name="checkmark-circle" size={14} color="#94A3B8" />
                      <Text style={[styles.featureText, {color: '#94A3B8'}]}>Arrive bientôt</Text>
                    </View>
                  </View>
                </View>
              </View>
              <View style={styles.lockIconContainer}>
                <Ionicons name="lock-closed" size={20} color="#94A3B8" />
              </View>
            </View>

            <View style={styles.cardDivider} />

            <View style={styles.cardStatsRow}>
              <View style={styles.statItem}>
                <View style={[styles.statIconCircle, {backgroundColor: '#94A3B8'}]}>
                  <Ionicons name="time-outline" size={12} color="#FFF" />
                </View>
                <View>
                  <Text style={styles.statLabel}>Délai</Text>
                  <Text style={[styles.statValue, {color: '#94A3B8'}]}>24h à 48h</Text>
                </View>
              </View>
              <View style={styles.statItem}>
                <View style={[styles.statIconCircle, {backgroundColor: '#94A3B8'}]}>
                  <Text style={{color: '#FFF', fontSize: 10, fontWeight: 'bold'}}>%</Text>
                </View>
                <View>
                  <Text style={styles.statLabel}>Frais DizzitUp</Text>
                  <Text style={[styles.statValue, {color: '#94A3B8'}]}>2,5%</Text>
                </View>
              </View>
              <View style={styles.statItem}>
                <View style={[styles.statIconCircle, {backgroundColor: '#94A3B8'}]}>
                  <Ionicons name="git-network-outline" size={12} color="#FFF" />
                </View>
                <View>
                  <Text style={styles.statLabel}>Frais réseau</Text>
                  <Text style={[styles.statValue, {color: '#94A3B8'}]}>Variables</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Info Banner */}
          <View style={styles.infoBanner}>
            <View style={styles.infoIconCircle}>
              <Ionicons name="information" size={16} color="#FFFFFF" />
            </View>
            <Text style={styles.infoBannerText}>
              Vous pourrez revoir les détails avant de confirmer votre retrait.
            </Text>
          </View>

          {/* Continue Button */}
          <TouchableOpacity style={styles.btnContinue} onPress={() => navigation.navigate('WithdrawFundsMobileMoneySummaryScreen')}>
            <Text style={styles.btnContinueText}>Continuer</Text>
          </TouchableOpacity>

        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 36 : 10,
    paddingBottom: 12,
  },
  iconBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  pageTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: '#1A2840',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCircleActive: {
    backgroundColor: '#FFB800',
  },
  stepNumber: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#64748B',
  },
  stepNumberActive: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    color: '#1A2840',
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#F1F5F9',
    marginHorizontal: 8,
  },
  stepLineActive: {
    backgroundColor: '#FFB800',
  },
  stepOverTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    color: '#FFB800',
    marginBottom: 4,
  },
  mainTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    color: '#1A2840',
    marginBottom: 8,
  },
  mainSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#64748B',
    marginBottom: 24,
  },
  methodCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  methodCardSelectedBank: {
    backgroundColor: '#F0FDF4', // Very light green bg
    borderColor: '#10B981',
  },
  methodCardSelectedMobile: {
    backgroundColor: '#EFF6FF', // Very light blue bg
    borderColor: '#3B82F6',
  },
  methodCardDisabled: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  cardTopLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  cardIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardHeaderInfo: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: '#1A2840',
    marginBottom: 8,
  },
  badgeRecommended: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
    marginBottom: 8,
  },
  badgeRecommendedText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    color: '#059669',
  },
  badgeComingSoon: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
    marginBottom: 8,
  },
  badgeComingSoonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    color: '#64748B',
  },
  featuresList: {
    marginBottom: 4,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  featureText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#475569',
    marginLeft: 6,
  },
  chevronIcon: {
    marginTop: 16,
  },
  lockIconContainer: {
    marginTop: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 16,
  },
  cardStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statIconCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  statLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: '#64748B',
  },
  statValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: '#1A2840',
  },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginVertical: 8,
  },
  infoIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#64748B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoBannerText: {
    flex: 1,
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
  },
  btnContinue: {
    backgroundColor: '#FFB800',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  btnContinueText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: '#1A2840',
  },
});
