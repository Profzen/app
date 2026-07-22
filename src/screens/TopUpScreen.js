import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNavBar from '../components/BottomNavBar';
import AppToast from '../components/AppToast';

export default function TopUpScreen() {
  const navigation = useNavigation();
  const [selectedMethod, setSelectedMethod] = useState('momo');
  const [toast, setToast] = useState(null);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Header Top Bar */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={22} color="#1A2840" />
          </TouchableOpacity>
          <Text style={styles.pageTitle}>Recharger</Text>
          <TouchableOpacity style={styles.helpButton}>
            <Ionicons name="help-circle-outline" size={22} color="#1A2840" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* 4-Step Horizontal Stepper (Step 1 Active) */}
          <View style={styles.stepperContainer}>
            <View style={styles.stepWrapper}>
              <View style={[styles.stepCircle, styles.stepCircleActive]}>
                <Text style={styles.stepNumberActive}>1</Text>
              </View>
              <Text style={styles.stepTextActive}>Mode de paiement</Text>
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

          {/* Headline & Subtitle */}
          <Text style={styles.mainTitle}>Choisissez votre mode de paiement</Text>
          <Text style={styles.mainSubtitle}>
            Achetez de la crypto en toute sécurité{'\n'}avec Mobile Money ou Carte bancaire
          </Text>

          {/* Option 1: Mobile Money (Selected per Mockup) */}
          <TouchableOpacity 
            style={[styles.methodCard, selectedMethod === 'momo' && styles.methodCardActive]}
            onPress={() => setSelectedMethod('momo')}
            activeOpacity={0.85}
          >
            <View style={styles.methodTopRow}>
              {/* Graphic box */}
              <View style={styles.methodIconBox}>
                <View style={styles.phoneIllustration}>
                  <View style={styles.phoneScreen} />
                  <View style={styles.phoneCoin}>
                    <Text style={styles.phoneCoinText}>MoMo</Text>
                  </View>
                </View>
              </View>

              <View style={styles.methodInfo}>
                <Text style={styles.methodTitle}>Mobile Money</Text>
                <Text style={styles.methodSubtitle}>Payez avec votre Mobile Money{'\n'}en toute simplicité.</Text>
                <View style={styles.paysBadge}>
                  <Text style={styles.paysBadgeText}>20 Pays</Text>
                </View>
              </View>

              <View style={styles.radioWrap}>
                {selectedMethod === 'momo' ? (
                  <View style={styles.radioOuterActive}>
                    <View style={styles.radioInnerActive} />
                  </View>
                ) : (
                  <View style={styles.radioInactive} />
                )}
              </View>
            </View>

            {/* Detected Operator Row (Visible when Mobile Money selected) */}
            {selectedMethod === 'momo' && (
              <View style={styles.detectedOperatorRow}>
                <Ionicons name="information-circle-outline" size={16} color="#1A2840" style={{ marginRight: 6 }} />
                <Text style={styles.detectedOperatorText}>Opérateur détecté : TMoney</Text>
              </View>
            )}

            {/* Bottom 3-Column Features */}
            <View style={styles.featuresRow}>
              <View style={styles.featureCol}>
                <Ionicons name="shield-checkmark-outline" size={15} color="#1A2840" style={{ marginRight: 4 }} />
                <Text style={styles.featureText}>Frais réduits</Text>
              </View>

              <View style={styles.featureCol}>
                <Ionicons name="flash-outline" size={15} color="#1A2840" style={{ marginRight: 4 }} />
                <Text style={styles.featureText}>Paiements rapides</Text>
              </View>

              <View style={styles.featureCol}>
                <Ionicons name="lock-closed-outline" size={15} color="#1A2840" style={{ marginRight: 4 }} />
                <Text style={styles.featureText}>Sécurisé</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Option 2: Carte bancaire */}
          <TouchableOpacity 
            style={[styles.methodCard, selectedMethod === 'card' && styles.methodCardActive]}
            onPress={() => setSelectedMethod('card')}
            activeOpacity={0.85}
          >
            <View style={styles.methodTopRow}>
              {/* Graphic box */}
              <View style={[styles.methodIconBox, { backgroundColor: '#F4F8FF' }]}>
                <View style={styles.cardIllustration}>
                  <View style={styles.cardChip} />
                  <View style={styles.cardCircles}>
                    <View style={[styles.cardCircle, { backgroundColor: '#EB001B', zIndex: 2 }]} />
                    <View style={[styles.cardCircle, { backgroundColor: '#F79E1B', marginLeft: -6, zIndex: 1 }]} />
                  </View>
                </View>
              </View>

              <View style={styles.methodInfo}>
                <Text style={styles.methodTitle}>Carte bancaire</Text>
                <Text style={styles.methodSubtitle}>Visa, Mastercard, AMEX</Text>
              </View>

              <View style={styles.radioWrap}>
                {selectedMethod === 'card' ? (
                  <View style={styles.radioOuterActive}>
                    <View style={styles.radioInnerActive} />
                  </View>
                ) : (
                  <View style={styles.radioInactive} />
                )}
              </View>
            </View>

            {/* Bottom 3-Column Features */}
            <View style={styles.featuresRow}>
              <View style={styles.featureCol}>
                <Ionicons name="shield-checkmark-outline" size={15} color="#0052FF" style={{ marginRight: 4 }} />
                <Text style={styles.featureText}>Sécurisé</Text>
              </View>

              <View style={styles.featureCol}>
                <Ionicons name="globe-outline" size={15} color="#0052FF" style={{ marginRight: 4 }} />
                <Text style={styles.featureText}>Disponible partout</Text>
              </View>

              <View style={styles.featureCol}>
                <Ionicons name="lock-closed-outline" size={15} color="#0052FF" style={{ marginRight: 4 }} />
                <Text style={styles.featureText}>Transactions fiables</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Blockchain Info Banner Card */}
          <View style={styles.infoBannerCard}>
            <Ionicons name="information-circle-outline" size={20} color="#0052FF" style={styles.infoBannerIcon} />
            <Text style={styles.infoBannerText}>
              DizzitUp prend en charge les meilleurs réseaux blockchain pour des transactions rapides et sûres. Les frais peuvent varier selon le mode de paiement.
            </Text>
          </View>

          {/* Continue Button */}
          <TouchableOpacity 
            style={styles.btnContinue} 
            onPress={() => navigation.navigate(selectedMethod === 'momo' ? 'TopUpDetailsScreen' : 'TopUpWalletDetailsScreen')}
            activeOpacity={0.8}
          >
            <Text style={styles.btnContinueText}>Continuer</Text>
            <Ionicons name="arrow-forward" size={18} color="#1A2840" />
          </TouchableOpacity>

          <View style={{ height: 20 }} />
        </ScrollView>

        <BottomNavBar activeTab="home" />
        {!!toast && <View style={styles.toastWrap}><AppToast title={toast.title} message={toast.message} onClose={() => setToast(null)} /></View>}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  toastWrap: { position: 'absolute', left: 14, right: 14, top: 64, zIndex: 50 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: Platform.OS === 'android' ? 36 : 10, paddingBottom: 12 },
  backButton: { padding: 4 },
  pageTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 18, color: '#1A2840' },
  helpButton: { padding: 4 },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 30 },
  stepperContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, paddingHorizontal: 4 },
  stepWrapper: { alignItems: 'center', flex: 1 },
  stepCircle: { width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  stepCircleActive: { backgroundColor: '#FFFFFF', borderColor: '#FFC759', borderWidth: 2 },
  stepNumber: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#9CA3AF' },
  stepNumberActive: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 12, color: '#F59E0B' },
  stepText: { fontFamily: 'Inter_400Regular', fontSize: 9, color: '#9CA3AF', textAlign: 'center' },
  stepTextActive: { fontFamily: 'Inter_600SemiBold', fontSize: 9, color: '#F59E0B', textAlign: 'center' },
  stepLine: { height: 2, backgroundColor: '#E5E7EB', flex: 1, marginTop: -14 },
  stepLineActive: { backgroundColor: '#FFC759' },
  mainTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 20, color: '#1A2840', textAlign: 'center', marginBottom: 6 },
  mainSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#6B7280', textAlign: 'center', lineHeight: 17, marginBottom: 20, paddingHorizontal: 16 },
  methodCard: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 18, padding: 14, marginBottom: 14 },
  methodCardActive: { backgroundColor: '#FFFDF0', borderColor: '#FFC759', borderWidth: 1.5 },
  methodTopRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  methodIconBox: { width: 64, height: 64, borderRadius: 16, backgroundColor: '#FFC759', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  phoneIllustration: { width: 34, height: 46, backgroundColor: '#0052FF', borderRadius: 8, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  phoneScreen: { width: 24, height: 32, backgroundColor: '#3B82F6', borderRadius: 4 },
  phoneCoin: { position: 'absolute', right: -8, bottom: 4, width: 24, height: 24, borderRadius: 12, backgroundColor: '#FFC759', borderWidth: 1.5, borderColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' },
  phoneCoinText: { fontSize: 7, color: '#1A2840', fontWeight: 'bold' },
  cardIllustration: { width: 44, height: 30, backgroundColor: '#071D54', borderRadius: 6, padding: 4, justifyContent: 'space-between' },
  cardChip: { width: 8, height: 6, backgroundColor: '#FFC759', borderRadius: 2 },
  cardCircles: { flexDirection: 'row', alignSelf: 'flex-end' },
  cardCircle: { width: 10, height: 10, borderRadius: 5 },
  methodInfo: { flex: 1 },
  methodTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 16, color: '#1A2840', marginBottom: 2 },
  methodSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#6B7280', marginBottom: 6, lineHeight: 15 },
  paysBadge: { alignSelf: 'flex-start', backgroundColor: '#FEF3C7', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  paysBadgeText: { fontFamily: 'Inter_600SemiBold', fontSize: 10, color: '#D97706' },
  radioWrap: { marginLeft: 8 },
  radioOuterActive: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#FFC759', justifyContent: 'center', alignItems: 'center' },
  radioInnerActive: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#FFC759' },
  radioInactive: { width: 22, height: 22, borderRadius: 11, borderWidth: 1, borderColor: '#E5E7EB' },
  detectedOperatorRow: { flexDirection: 'row', alignItems: 'center', paddingTop: 10, paddingBottom: 10, borderTopWidth: 1, borderTopColor: '#FDE68A', borderStyle: 'dotted', marginBottom: 6 },
  detectedOperatorText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#1A2840' },
  featuresRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  featureCol: { flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'center' },
  featureText: { fontFamily: 'Inter_500Medium', fontSize: 11, color: '#1A2840' },
  infoBannerCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#EFF6FF', borderRadius: 16, padding: 14, marginBottom: 16 },
  infoBannerIcon: { marginRight: 10, marginTop: 2 },
  infoBannerText: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 11, color: '#1A2840', lineHeight: 16 },
  btnContinue: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFC759', height: 48, borderRadius: 12, marginBottom: 10 },
  btnContinueText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 15, color: '#1A2840', marginRight: 8 }
});
