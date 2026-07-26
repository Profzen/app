import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Image, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNavBar from '../components/BottomNavBar';

export default function TopUpWalletScreen() {
  const navigation = useNavigation();
  const [selectedMethod, setSelectedMethod] = useState('card');

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#1A2840" />
          </TouchableOpacity>
          <Text style={styles.pageTitle}>Recharger le portefeuille</Text>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="help-circle-outline" size={24} color="#1A2840" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Progress Stepper (5 steps) */}
          <View style={styles.stepperContainer}>
            <View style={styles.stepWrapper}>
              <View style={[styles.stepCircle, styles.stepCircleActive]}>
                <Text style={[styles.stepNumber, styles.stepNumberActive]}>1</Text>
              </View>
              <Text style={[styles.stepText, styles.stepTextActive]}>Mode de paiement</Text>
            </View>
            <View style={[styles.stepLine, styles.stepLineActive]} />
            
            <View style={styles.stepWrapper}>
              <View style={styles.stepCircle}>
                <Text style={styles.stepNumber}>2</Text>
              </View>
              <Text style={styles.stepText}>Détails</Text>
            </View>
            <View style={styles.stepLine} />
            
            <View style={styles.stepWrapper}>
              <View style={styles.stepCircle}>
                <Text style={styles.stepNumber}>3</Text>
              </View>
              <Text style={styles.stepText}>Résumé</Text>
            </View>
            <View style={styles.stepLine} />
            
            <View style={styles.stepWrapper}>
              <View style={styles.stepCircle}>
                <Text style={styles.stepNumber}>4</Text>
              </View>
              <Text style={styles.stepText}>Paiement</Text>
            </View>
            <View style={styles.stepLine} />

            <View style={styles.stepWrapper}>
              <View style={styles.stepCircle}>
                <Text style={styles.stepNumber}>5</Text>
              </View>
              <Text style={styles.stepText}>Confirmation</Text>
            </View>
          </View>

          {/* Titles */}
          <Text style={styles.mainTitle}>Choisissez votre mode de paiement</Text>
          <Text style={styles.mainSubtitle}>
            Achetez des cryptomonnaies en toute sécurité{'\n'}avec le mode de paiement qui vous convient.
          </Text>

          {/* Method 1: Carte Bancaire */}
          <TouchableOpacity 
            style={[styles.methodCard, selectedMethod === 'card' && styles.methodCardActive]}
            onPress={() => setSelectedMethod('card')}
            activeOpacity={0.8}
          >
            <View style={styles.methodHeader}>
              <View style={styles.methodIconContainer}>
                <View style={styles.mockCreditCard}>
                  <View style={styles.mockCardChip} />
                  <View style={styles.mockCardCircles}>
                    <View style={[styles.mockCardCircle, {backgroundColor: '#EB001B', zIndex: 2}]} />
                    <View style={[styles.mockCardCircle, {backgroundColor: '#F79E1B', marginLeft: -8, zIndex: 1}]} />
                  </View>
                </View>
              </View>
              <View style={styles.methodInfo}>
                <View style={styles.methodTitleRow}>
                  <Text style={styles.methodTitle}>Carte bancaire</Text>
                  <View style={styles.radioContainer}>
                    {selectedMethod === 'card' ? (
                      <Ionicons name="checkmark-circle" size={24} color="#FFB800" />
                    ) : (
                      <View style={styles.radioInactive} />
                    )}
                  </View>
                </View>
                <Text style={styles.methodDesc}>Visa, Mastercard, AMEX</Text>
                <View style={styles.recommendedBadge}>
                  <Text style={styles.recommendedText}>Recommandé</Text>
                </View>
              </View>
            </View>

            <View style={styles.featuresRow}>
              <View style={styles.featureItem}>
                <Ionicons name="shield-checkmark-outline" size={16} color="#1A2840" style={{marginRight: 8}} />
                <Text style={styles.featureText}>Sécurisé</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="time-outline" size={16} color="#1A2840" style={{marginRight: 8}} />
                <Text style={styles.featureText}>Transactions{'\n'}instantanées</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="globe-outline" size={16} color="#1A2840" style={{marginRight: 8}} />
                <Text style={styles.featureText}>Disponible{'\n'}partout</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Method 2: Mobile Money */}
          <TouchableOpacity 
            style={[styles.methodCard, selectedMethod === 'momo' && styles.methodCardActive]}
            onPress={() => setSelectedMethod('momo')}
            activeOpacity={0.8}
          >
            <View style={styles.methodHeader}>
              <View style={styles.methodIconContainer}>
                <View style={styles.mockPhone}>
                  <View style={styles.mockPhoneScreen} />
                  <View style={styles.mockMomoCoin}>
                    <Text style={{color: '#FFB800', fontSize: 16, fontWeight: 'bold'}}>₿</Text>
                  </View>
                </View>
              </View>
              <View style={styles.methodInfo}>
                <View style={styles.methodTitleRow}>
                  <Text style={styles.methodTitle}>Mobile Money</Text>
                  <View style={styles.radioContainer}>
                    {selectedMethod === 'momo' ? (
                      <Ionicons name="checkmark-circle" size={24} color="#FFB800" />
                    ) : (
                      <View style={styles.radioInactive} />
                    )}
                  </View>
                </View>
                <Text style={styles.methodDesc}>PayGate (Togocom, Moov,{'\n'}Mixx by Yas...)</Text>
                <View style={styles.countryBadge}>
                  <Text style={styles.countryBadgeText}>20 pays</Text>
                </View>
              </View>
            </View>

            <View style={styles.featuresRow}>
              <View style={styles.featureItem}>
                <Ionicons name="flash-outline" size={16} color="#1A2840" style={{marginRight: 8}} />
                <Text style={styles.featureText}>Frais réduits</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="time-outline" size={16} color="#1A2840" style={{marginRight: 8}} />
                <Text style={styles.featureText}>Paiements rapides</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="lock-closed-outline" size={16} color="#1A2840" style={{marginRight: 8}} />
                <Text style={styles.featureText}>Sécurisé</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Info Banner */}
          <View style={styles.infoBanner}>
            <View style={styles.shieldIconCircle}>
              <Ionicons name="shield-checkmark" size={16} color="#FFFFFF" />
            </View>
            <Text style={styles.infoText}>
              Vos fonds sont protégés par un chiffrement{'\n'}
              de niveau bancaire et des partenaires de{'\n'}
              confiance.
            </Text>
          </View>

          {/* Continue Button */}
          <TouchableOpacity style={styles.btnContinue} onPress={() => navigation.navigate(selectedMethod === 'card' ? 'TopUpWalletDetailsScreen' : 'TopUpDetailsScreen')}>
            <Text style={styles.btnContinueText}>Continuer</Text>
            <Ionicons name="arrow-forward" size={20} color="#1A2840" />
          </TouchableOpacity>

        </ScrollView>

        <BottomNavBar />
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
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginBottom: 32,
  },
  stepWrapper: {
    alignItems: 'center',
    width: 50,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepCircleActive: {
    borderColor: '#FFB800',
    backgroundColor: '#FFB800',
  },
  stepNumber: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#94A3B8',
  },
  stepNumberActive: {
    color: '#FFFFFF',
  },
  stepText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    color: '#94A3B8',
    textAlign: 'center',
  },
  stepTextActive: {
    color: '#FFB800',
    fontFamily: 'Inter_600SemiBold',
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#E2E8F0',
    marginTop: 13,
    marginHorizontal: 2,
  },
  stepLineActive: {
    backgroundColor: '#FFB800',
  },
  mainTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 22,
    color: '#1A2840',
    textAlign: 'center',
    marginBottom: 8,
  },
  mainSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  methodCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  methodCardActive: {
    borderColor: '#FFB800',
  },
  methodHeader: {
    flexDirection: 'row',
  },
  methodIconContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#FFB800', // Yellow bg
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    position: 'relative',
  },
  mockCreditCard: {
    width: 56,
    height: 40,
    backgroundColor: '#1E3A8A',
    borderRadius: 6,
    padding: 6,
    justifyContent: 'space-between',
  },
  mockCardChip: {
    width: 14,
    height: 10,
    backgroundColor: '#FFB800',
    borderRadius: 2,
  },
  mockCardCircles: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
  },
  mockCardCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  mockPhone: {
    width: 36,
    height: 56,
    backgroundColor: '#1E3A8A',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#1A2840',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mockPhoneScreen: {
    width: '80%',
    height: '75%',
    backgroundColor: '#3B82F6',
    borderRadius: 4,
  },
  mockMomoCoin: {
    position: 'absolute',
    bottom: -4,
    right: -16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEF3C7',
    borderWidth: 2,
    borderColor: '#FFB800',
    justifyContent: 'center',
    alignItems: 'center',
  },
  methodInfo: {
    flex: 1,
  },
  methodTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  methodTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: '#1A2840',
  },
  radioContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInactive: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  methodDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 8,
  },
  recommendedBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  recommendedText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#10B981',
  },
  countryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  countryBadgeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#1A2840',
  },
  featuresRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  featureItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  featureText: {
    flex: 1,
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: '#1A2840',
    lineHeight: 16,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  shieldIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#1E3A8A',
    lineHeight: 18,
  },
  btnContinue: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFB800',
    paddingVertical: 18,
    borderRadius: 16,
  },
  btnContinueText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: '#1A2840',
    marginRight: 8,
  },
});
