import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNavBar from '../components/BottomNavBar';
import AppToast from '../components/AppToast';
import { useApp } from '../context/AppContext';
import { getPaymentRailEligibility, COUNTRY_METADATA } from '../services/paymentCorridorService';
import PaymentRegionModal from '../components/PaymentRegionModal';

export default function TopUpScreen() {
  const navigation = useNavigation();
  const { user, t, language, userCountry, setUserCountry } = useApp();

  const [topupCountry, setTopupCountry] = useState(() => {
    const raw = (userCountry || user?.country_code || user?.country || 'DZ').toUpperCase().trim();
    return raw.length === 2 ? raw : (raw === 'FRANCE' ? 'FR' : raw === 'MAROC' ? 'MA' : 'DZ');
  });
  const [regionModalVisible, setRegionModalVisible] = useState(false);

  // Sync with userCountry when geolocation resolves asynchronously
  useEffect(() => {
    if (userCountry && typeof userCountry === 'string' && userCountry.length === 2) {
      setTopupCountry(userCountry.toUpperCase());
    }
  }, [userCountry]);

  const railEligibility = useMemo(() => {
    return getPaymentRailEligibility(topupCountry, 'onramp', language);
  }, [topupCountry, language]);

  // Set default method: if momo enabled, 'momo'; if momo disabled (e.g. Algeria, France, Morocco), 'card'
  const [selectedMethod, setSelectedMethod] = useState(() => {
    const initialCountry = (userCountry || user?.country_code || user?.country || 'DZ').toUpperCase().trim();
    const initEligibility = getPaymentRailEligibility(initialCountry.length === 2 ? initialCountry : 'DZ', 'onramp', language);
    return initEligibility.momo.enabled ? 'momo' : 'card';
  });

  useEffect(() => {
    if (selectedMethod === 'momo' && !railEligibility.momo.enabled) {
      setSelectedMethod('card');
    }
  }, [topupCountry, railEligibility.momo.enabled]);

  const [toast, setToast] = useState(null);

  const handleContinue = () => {
    navigation.navigate(
      selectedMethod === 'momo' ? 'TopUpDetailsScreen' : 'TopUpWalletDetailsScreen',
      { paymentMethod: selectedMethod, country: topupCountry }
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Header Top Bar */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={22} color="#1A2840" />
          </TouchableOpacity>
          <Text style={styles.pageTitle}>{t('topup.title')}</Text>
          <TouchableOpacity style={styles.helpButton} onPress={() => navigation.navigate('AskAminataScreen')}>
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
              <Text style={styles.stepTextActive}>{t('topup.payment_method')}</Text>
            </View>
            <View style={[styles.stepLine, styles.stepLineActive]} />
            
            <View style={styles.stepWrapper}>
              <View style={styles.stepCircle}>
                <Text style={styles.stepNumber}>2</Text>
              </View>
              <Text style={styles.stepText}>{t('topup.details')}</Text>
            </View>
            <View style={styles.stepLine} />
            
            <View style={styles.stepWrapper}>
              <View style={styles.stepCircle}>
                <Text style={styles.stepNumber}>3</Text>
              </View>
              <Text style={styles.stepText}>{t('topup.summary')}</Text>
            </View>
            <View style={styles.stepLine} />

            <View style={styles.stepWrapper}>
              <View style={styles.stepCircle}>
                <Text style={styles.stepNumber}>4</Text>
              </View>
              <Text style={styles.stepText}>{t('topup.payment')}</Text>
            </View>
          </View>

          {/* Headline & Subtitle */}
          <Text style={styles.mainTitle}>{t('topup.choose_payment_method', 'Choose Your Payment Method')}</Text>
          <Text style={styles.mainSubtitle}>
            {t('topup.buy_crypto_securely', 'Buy crypto securely with Mobile Money or Credit Card')}
          </Text>

          {/* Destination Country Indicator & Switcher */}
          <View style={styles.topupCountryRow}>
            <Text style={styles.topupCountryLabel}>
              {t('paymentRails.topupRegionLabel', 'Région de paiement :')}
            </Text>
            <TouchableOpacity
              style={styles.topupCountryPill}
              onPress={() => setRegionModalVisible(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.topupCountryFlag}>{railEligibility.countryFlag}</Text>
              <Text style={styles.topupCountryText}>{railEligibility.countryName || topupCountry}</Text>
              <Ionicons name="chevron-down" size={12} color="#1D4ED8" style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          </View>

          {/* Option 1: Mobile Money */}
          {railEligibility.momo.enabled ? (
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
                  <Text style={styles.methodTitle}>{t('topup.mobile_money')}</Text>
                  <Text style={styles.methodSubtitle}>
                    {railEligibility.momo.operators.length > 0
                      ? railEligibility.momo.operators.slice(0, 3).join(', ')
                      : t('topup.mobile_money_desc')}
                  </Text>
                  <View style={styles.paysBadge}>
                    <Text style={styles.paysBadgeText}>
                      {railEligibility.countryFlag} {railEligibility.countryName}
                    </Text>
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

              {/* Bottom 3-Column Features */}
              <View style={styles.featuresRow}>
                <View style={styles.featureCol}>
                  <Ionicons name="shield-checkmark-outline" size={15} color="#1A2840" style={{ marginRight: 4 }} />
                  <Text style={styles.featureText}>{t('topup.features.lowFees', 'Frais réduits')}</Text>
                </View>

                <View style={styles.featureCol}>
                  <Ionicons name="flash-outline" size={15} color="#1A2840" style={{ marginRight: 4 }} />
                  <Text style={styles.featureText}>{t('topup.features.fastPayments', 'Paiements rapides')}</Text>
                </View>

                <View style={styles.featureCol}>
                  <Ionicons name="lock-closed-outline" size={15} color="#1A2840" style={{ marginRight: 4 }} />
                  <Text style={styles.featureText}>{t('topup.features.secure', 'Sécurisé')}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ) : (
            /* Option 1 Disabled: Mobile Money for Unsupported Country */
            <TouchableOpacity 
              style={styles.disabledTopupCard}
              onPress={() => setRegionModalVisible(true)}
              activeOpacity={0.8}
            >
              <View style={styles.methodTopRow}>
                <View style={[styles.methodIconBox, { backgroundColor: '#F1F5F9' }]}>
                  <Ionicons name="phone-portrait-outline" size={32} color="#94A3B8" />
                </View>

                <View style={styles.methodInfo}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={[styles.methodTitle, { color: '#94A3B8' }]}>{t('topup.mobile_money')}</Text>
                    <View style={styles.disabledTopupBadge}>
                      <Ionicons name="lock-closed" size={10} color="#64748B" style={{ marginRight: 2 }} />
                      <Text style={styles.disabledTopupBadgeText}>
                        {t('paymentRails.unavailableInCountry', `Indisponible en/au ${railEligibility.countryName}`, {
                          country: railEligibility.countryName,
                        })}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.disabledTopupSubtext}>
                    {t(
                      'paymentRails.momoUnavailableExplanation',
                      `Le paiement Mobile Money n'est pas disponible pour ${railEligibility.countryName}. Il est actif dans 20 pays d'Afrique (Bénin, Côte d'Ivoire, Sénégal, Togo, Cameroun, Kenya...).`,
                      { country: railEligibility.countryName }
                    )}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}

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
                <Text style={styles.methodTitle}>{t('topup.credit_debit_card', 'Credit & Debit cards')}</Text>
                <Text style={styles.methodSubtitle}>{t('topup.credit_debit_card_desc', 'Visa, Mastercard')}</Text>
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
                <Text style={styles.featureText}>{t('topup.features.secure', 'Sécurisé')}</Text>
              </View>

              <View style={styles.featureCol}>
                <Ionicons name="globe-outline" size={15} color="#0052FF" style={{ marginRight: 4 }} />
                <Text style={styles.featureText}>{t('topup.features.availableEverywhere', 'Disponible partout')}</Text>
              </View>

              <View style={styles.featureCol}>
                <Ionicons name="lock-closed-outline" size={15} color="#0052FF" style={{ marginRight: 4 }} />
                <Text style={styles.featureText}>{t('topup.features.reliableTransactions', 'Transactions fiables')}</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Smart Contextual Info Banner */}
          {railEligibility.momo.enabled ? (
            /* MoMo SUPPORTED: green confirmation */
            <View style={styles.infoBannerGreen}>
              <View style={styles.bannerIconWrapper}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              </View>
              <Text style={styles.infoBannerTextGreen}>
                <Text style={{fontFamily: 'Inter_700Bold'}}>{t('topup.recommended', 'Recommended:')} </Text>
                {t('topup.recommended_desc', 'For best experience in Africa, use Mobile Money on Polygon network')}
              </Text>
            </View>
          ) : (
            /* MoMo NOT SUPPORTED: info note about card */
            <View style={styles.infoBannerIndigo}>
              <View style={styles.bannerIconWrapper}>
                <Ionicons name="information-circle" size={20} color="#6366F1" />
              </View>
              <Text style={styles.infoBannerTextIndigo}>
                <Text style={{fontFamily: 'Inter_700Bold'}}>{t('paymentRails.notAvailableTitle', 'Mobile Money unavailable')} </Text>
                {t(
                  'paymentRails.cardAlternativeNote',
                  `Mobile Money is not yet available in ${railEligibility.countryName || topupCountry}. Use your Visa or Mastercard card to top up your account from anywhere in the world.`,
                  { country: railEligibility.countryName || topupCountry }
                )}
              </Text>
            </View>
          )}

          {/* Bottom Bar Continue Button */}
          <TouchableOpacity style={styles.btnContinue} onPress={handleContinue}>
            <Text style={styles.btnContinueText}>{t('topup.continue', 'CONTINUER')}</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFC759" />
          </TouchableOpacity>

          <View style={{ height: 20 }} />
        </ScrollView>

        {/* Region Switcher Modal */}
        <PaymentRegionModal
          visible={regionModalVisible}
          onClose={() => setRegionModalVisible(false)}
          currentCountryCode={topupCountry}
          onSelectCountry={(code) => {
            setTopupCountry(code);
            if (setUserCountry) setUserCountry(code);
          }}
          onSelectAlternativeMethod={(method) => setSelectedMethod(method)}
        />

        <BottomNavBar activeTab="wallet" />
        {!!toast && <View style={styles.toastWrap}><AppToast title={toast.title} message={toast.message} onClose={() => setToast(null)} /></View>}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? Math.max(StatusBar.currentHeight || 0, 44) + 6 : 14,
  },
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  toastWrap: { position: 'absolute', left: 14, right: 14, top: 64, zIndex: 50 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 12 },
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
  methodCard: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#94A3B8', borderRadius: 18, padding: 14, marginBottom: 14, shadowColor: '#1A2840', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 3 },
  methodCardActive: { backgroundColor: '#FFFDF0', borderColor: '#F59E0B', borderWidth: 2, shadowColor: '#F59E0B', shadowOpacity: 0.2, elevation: 5 },
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
  radioOuterActive: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#F59E0B', justifyContent: 'center', alignItems: 'center' },
  radioInnerActive: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#F59E0B' },
  radioInactive: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#1A2840', backgroundColor: '#F8FAFC' },
  detectedOperatorRow: { flexDirection: 'row', alignItems: 'center', paddingTop: 10, paddingBottom: 10, borderTopWidth: 1, borderTopColor: '#FDE68A', borderStyle: 'dotted', marginBottom: 6 },
  detectedOperatorText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#1A2840' },
  featuresRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  featureCol: { flexDirection: 'row', alignItems: 'center' },
  featureText: { fontFamily: 'Inter_500Medium', fontSize: 11, color: '#1A2840' },
  /* Dynamic info banners — distinct from card options */
  infoBannerGreen: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#6EE7B7',
  },
  infoBannerIndigo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  bannerIconWrapper: { marginRight: 10, marginTop: 1 },
  infoBannerTextGreen: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#065F46',
    lineHeight: 18,
  },
  infoBannerTextIndigo: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#3730A3',
    lineHeight: 18,
  },
  btnContinue: { 
    flexDirection: 'row', backgroundColor: '#1A2840', paddingVertical: 15, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginTop: 10, marginBottom: 10, shadowColor: '#1A2840', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 6, elevation: 4 
  },
  btnContinueText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 15, color: '#FFC759', textTransform: 'uppercase', letterSpacing: 0.5, marginRight: 8 },
  topupCountryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  topupCountryLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#475569',
  },
  topupCountryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  topupCountryFlag: {
    fontSize: 14,
    marginRight: 5,
  },
  topupCountryText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: '#1D4ED8',
  },
  disabledTopupCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
    opacity: 0.9,
  },
  disabledTopupBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  disabledTopupBadgeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 9.5,
    color: '#64748B',
  },
  disabledTopupSubtext: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
    marginTop: 4,
  },
});
