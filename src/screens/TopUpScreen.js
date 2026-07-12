import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNavBar from '../components/BottomNavBar';

export default function TopUpScreen() {
  const navigation = useNavigation();
  const [selectedMethod, setSelectedMethod] = useState('momo');

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#1A2840" />
          </TouchableOpacity>
          <Text style={styles.pageTitle}>Recharger</Text>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="help-circle-outline" size={24} color="#1A2840" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Progress Stepper */}
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
          </View>

          {/* Titles */}
          <Text style={styles.mainTitle}>Choisissez votre mode de paiement</Text>
          <Text style={styles.mainSubtitle}>
            Achetez de la crypto en toute sécurité{'\n'}avec Mobile Money ou Carte bancaire
          </Text>

          {/* Method 1: Mobile Money */}
          <TouchableOpacity 
            style={[styles.methodCard, selectedMethod === 'momo' && styles.methodCardActive]}
            onPress={() => setSelectedMethod('momo')}
            activeOpacity={0.8}
          >
            <View style={styles.methodHeader}>
              <View style={styles.methodIconContainer}>
                {/* Smartphone graphic mock */}
                <View style={styles.mockPhone}>
                  <View style={styles.mockPhoneScreen} />
                  <View style={styles.mockMomoCoin}>
                    <Ionicons name="phone-portrait-outline" size={12} color="#1A2840" />
                    <Text style={styles.mockMomoText}>MoMo</Text>
                  </View>
                </View>
              </View>
              <View style={styles.methodInfo}>
                <View style={styles.methodTitleRow}>
                  <Text style={styles.methodTitle}>Mobile Money</Text>
                  <View style={styles.radioContainer}>
                    {selectedMethod === 'momo' ? (
                      <View style={styles.radioActive}><View style={styles.radioInner} /></View>
                    ) : (
                      <View style={styles.radioInactive} />
                    )}
                  </View>
                </View>
                <Text style={styles.methodDesc}>Payez avec votre Mobile Money en toute simplicité.</Text>
                <View style={styles.badgeContainer}>
                  <Text style={styles.badgeText}>20 Pays</Text>
                </View>
              </View>
            </View>

            {selectedMethod === 'momo' && (
              <View style={styles.expandedContent}>
                <View style={styles.divider} />
                <Text style={styles.operatorsTitle}>Choisissez votre opérateur</Text>
                
                <View style={styles.operatorsRow}>
                  <View style={styles.operatorItem}>
                    <View style={[styles.operatorLogo, {backgroundColor: '#FF6B00'}]}>
                      <Text style={{color: '#FFF', fontSize: 10, fontWeight: 'bold'}}>Moov</Text>
                    </View>
                    <Text style={styles.operatorName}>Moov{'\n'}Money</Text>
                  </View>
                  <View style={styles.operatorItem}>
                    <View style={[styles.operatorLogo, {backgroundColor: '#FFCC00'}]}>
                      <Text style={{color: '#000', fontSize: 10, fontWeight: 'bold'}}>MTN</Text>
                    </View>
                    <Text style={styles.operatorName}>MTN{'\n'}Mobile Money</Text>
                  </View>
                  <View style={styles.operatorItem}>
                    <View style={[styles.operatorLogo, {backgroundColor: '#0033A0'}]}>
                      <Text style={{color: '#FFF', fontSize: 10, fontWeight: 'bold'}}>mixx</Text>
                    </View>
                    <Text style={styles.operatorName}>Mixx{'\n'}by Yas</Text>
                  </View>
                  <View style={styles.operatorItem}>
                    <View style={[styles.operatorLogo, {backgroundColor: '#FF0000'}]}>
                      <Text style={{color: '#FFF', fontSize: 10, fontWeight: 'bold'}}>airtel</Text>
                    </View>
                    <Text style={styles.operatorName}>Airtel{'\n'}Money</Text>
                  </View>
                  <View style={styles.operatorItem}>
                    <View style={[styles.operatorLogo, {backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0'}]}>
                      <Ionicons name="ellipsis-horizontal" size={20} color="#1A2840" />
                    </View>
                    <Text style={styles.operatorName}>Voir plus{'\n'}d'opérateurs</Text>
                  </View>
                </View>

                <View style={styles.featuresRow}>
                  <View style={styles.featureItem}>
                    <Ionicons name="shield-checkmark-outline" size={14} color="#1A2840" style={{marginRight: 4}} />
                    <Text style={styles.featureText}>Frais réduits</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Ionicons name="flash-outline" size={14} color="#1A2840" style={{marginRight: 4}} />
                    <Text style={styles.featureText}>Paiements rapides</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Ionicons name="lock-closed-outline" size={14} color="#1A2840" style={{marginRight: 4}} />
                    <Text style={styles.featureText}>Sécurisé</Text>
                  </View>
                </View>
              </View>
            )}
          </TouchableOpacity>

          {/* Method 2: Carte Bancaire */}
          <TouchableOpacity 
            style={[styles.methodCard, selectedMethod === 'card' && styles.methodCardActive]}
            onPress={() => setSelectedMethod('card')}
            activeOpacity={0.8}
          >
            <View style={styles.methodHeader}>
              <View style={styles.methodIconContainer}>
                {/* Card graphic mock */}
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
                      <View style={styles.radioActive}><View style={styles.radioInner} /></View>
                    ) : (
                      <View style={styles.radioInactive} />
                    )}
                  </View>
                </View>
                <Text style={styles.methodDesc}>Visa, Mastercard, AMEX</Text>
              </View>
            </View>

            {/* Inactive state features row - in the mockup it shows even when inactive but let's make it part of the content */}
            <View style={[styles.featuresRow, {marginTop: 16, justifyContent: 'flex-start', gap: 16}]}>
              <View style={styles.featureItem}>
                <Ionicons name="shield-checkmark-outline" size={14} color="#3B82F6" style={{marginRight: 4}} />
                <Text style={styles.featureText}>Sécurisé</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="globe-outline" size={14} color="#3B82F6" style={{marginRight: 4}} />
                <Text style={styles.featureText}>Disponible partout</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="lock-closed-outline" size={14} color="#3B82F6" style={{marginRight: 4}} />
                <Text style={styles.featureText}>Transactions fiables</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Info Banner */}
          <View style={styles.infoBanner}>
            <View style={styles.infoIconCircle}>
              <Ionicons name="information" size={16} color="#3B82F6" />
            </View>
            <Text style={styles.infoText}>
              DizzitUp prend en charge les meilleurs réseaux{'\n'}
              blockchain pour des transactions rapides et sûres.{'\n'}
              Les frais peuvent varier selon le mode de paiement.
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
    paddingTop: 12,
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
    fontSize: 18,
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
    paddingHorizontal: 10,
  },
  stepWrapper: {
    alignItems: 'center',
    width: 60,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepCircleActive: {
    borderColor: '#FFB800',
  },
  stepNumber: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#94A3B8',
  },
  stepNumberActive: {
    color: '#FFB800',
  },
  stepText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
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
    marginTop: 15,
    marginHorizontal: 4,
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
    fontSize: 15,
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
    backgroundColor: '#FFFDF5', // subtle yellow tint
  },
  methodHeader: {
    flexDirection: 'row',
  },
  methodIconContainer: {
    width: 72,
    height: 72,
    backgroundColor: '#F8FAFC', // light gray
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  mockPhone: {
    width: 36,
    height: 52,
    backgroundColor: '#0052FF',
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
    marginTop: -4,
  },
  mockMomoCoin: {
    position: 'absolute',
    bottom: -6,
    right: -16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFB800',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mockMomoText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#1A2840',
  },
  mockCreditCard: {
    width: 48,
    height: 32,
    backgroundColor: '#1E3A8A',
    borderRadius: 6,
    padding: 4,
    justifyContent: 'space-between',
  },
  mockCardChip: {
    width: 12,
    height: 8,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
  },
  mockCardCircles: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
  },
  mockCardCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
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
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  radioActive: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FFB800',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFB800',
  },
  methodDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 8,
  },
  badgeContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#FEF3C7', // light yellow
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#B45309', // dark orange/brown
  },
  expandedContent: {
    marginTop: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: 16,
  },
  operatorsTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#1A2840',
    marginBottom: 16,
  },
  operatorsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  operatorItem: {
    alignItems: 'center',
    width: 60,
  },
  operatorLogo: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  operatorName: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    color: '#1A2840',
    textAlign: 'center',
  },
  featuresRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FAFAFA',
    padding: 12,
    borderRadius: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: '#1A2840',
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EFF6FF', // light blue
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  infoIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#1A2840',
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
