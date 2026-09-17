import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { getPaymentRailEligibility, COUNTRY_METADATA } from '../services/paymentCorridorService';
import PaymentRegionModal from '../components/PaymentRegionModal';

export default function WithdrawFundsMethodScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { user, t, language, userCountry, setUserCountry } = useApp();
  const { amount, currency, selectedToken, selectedNetwork } = route.params || {};
  const [selectedMethod, setSelectedMethod] = useState('bank'); // 'bank' or 'mobile'

  const [destinationCountry, setDestinationCountry] = useState(() => {
    const raw = (userCountry || user?.country_code || user?.country || 'DZ').toUpperCase().trim();
    return raw.length === 2 ? raw : (raw === 'FRANCE' ? 'FR' : raw === 'MAROC' ? 'MA' : 'DZ');
  });
  const [regionModalVisible, setRegionModalVisible] = useState(false);

  // Sync with userCountry when geolocation resolves asynchronously
  useEffect(() => {
    if (userCountry && typeof userCountry === 'string' && userCountry.length === 2) {
      setDestinationCountry(userCountry.toUpperCase());
    }
  }, [userCountry]);

  // Compute rail eligibility for 'offramp' flow
  const railEligibility = useMemo(() => {
    return getPaymentRailEligibility(destinationCountry, 'offramp', language);
  }, [destinationCountry, language]);

  // If mobile is selected but not supported, fallback to 'bank'
  useEffect(() => {
    if (selectedMethod === 'mobile' && !railEligibility.momo.enabled) {
      setSelectedMethod('bank');
    }
  }, [destinationCountry, railEligibility.momo.enabled]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#1A2840" />
          </TouchableOpacity>
          <Text style={styles.pageTitle}>{t('withdrawFunds.title', 'Withdraw funds')}</Text>
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
          <Text style={styles.stepOverTitle}>{t('withdrawFunds.step2Of5', 'Step 2/5')}</Text>
          <Text style={styles.mainTitle}>{t('withdrawFunds.chooseMethodTitle', 'Choose your receiving method')}</Text>
          <Text style={styles.mainSubtitle}>{t('withdrawFunds.chooseMethodSubtitle', 'Select how you would like to receive your funds.')}</Text>

          {/* Destination Country Indicator & Switcher */}
          <View style={styles.countrySelectionRow}>
            <Text style={styles.countrySelectionLabel}>
              {t('paymentRails.withdrawRegionLabel', 'Pays de réception des fonds :')}
            </Text>
            <TouchableOpacity
              style={styles.countryPill}
              onPress={() => setRegionModalVisible(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.countryPillFlag}>{railEligibility.countryFlag}</Text>
              <Text style={styles.countryPillText}>{railEligibility.countryName || destinationCountry}</Text>
              <Ionicons name="chevron-down" size={12} color="#1D4ED8" style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          </View>

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
                    <Text style={styles.cardTitle}>{t('withdrawFunds.bankTransfer', 'Bank transfer')}</Text>
                    <View style={styles.badgeRecommended}>
                      <Text style={styles.badgeRecommendedText}>{t('withdrawFunds.recommended', 'Recommended')}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.featuresList}>
                    <View style={styles.featureItem}>
                      <Ionicons name="checkmark-circle" size={14} color={selectedMethod === 'bank' ? '#10B981' : '#64748B'} />
                      <Text style={styles.featureText}>{t('withdrawFunds.idealHighAmounts', 'Ideal for large amounts')}</Text>
                    </View>
                    <View style={styles.featureItem}>
                      <Ionicons name="checkmark-circle" size={14} color={selectedMethod === 'bank' ? '#10B981' : '#64748B'} />
                      <Text style={styles.featureText}>{t('withdrawFunds.secureReliable', 'Secure and reliable')}</Text>
                    </View>
                    <View style={styles.featureItem}>
                      <Ionicons name="checkmark-circle" size={14} color={selectedMethod === 'bank' ? '#10B981' : '#64748B'} />
                      <Text style={styles.featureText}>{t('withdrawFunds.compatibleAllBanks', 'Compatible with all banks')}</Text>
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
                  <Text style={styles.statLabel}>{t('withdrawFunds.delay', 'Delay')}</Text>
                  <Text style={styles.statValue}>{t('withdrawFunds.delay24To72h', '24h to 72h')}</Text>
                </View>
              </View>
              <View style={styles.statItem}>
                <View style={[styles.statIconCircle, {backgroundColor: selectedMethod === 'bank' ? '#10B981' : '#64748B'}]}>
                  <Text style={{color: '#FFF', fontSize: 10, fontWeight: 'bold'}}>%</Text>
                </View>
                <View>
                  <Text style={styles.statLabel}>{t('withdrawFunds.dizzitupFee', 'DizzitUp Fee')}</Text>
                  <Text style={styles.statValue}>1,5%</Text>
                </View>
              </View>
              <View style={styles.statItem}>
                <View style={[styles.statIconCircle, {backgroundColor: selectedMethod === 'bank' ? '#10B981' : '#64748B'}]}>
                  <Ionicons name="git-network-outline" size={12} color="#FFF" />
                </View>
                <View>
                  <Text style={styles.statLabel}>{t('withdrawFunds.networkFee', 'Network Fee')}</Text>
                  <Text style={styles.statValue}>{t('withdrawFunds.variable', 'Variable')}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>

          {/* Card 2: Mobile Money */}
          {railEligibility.momo.enabled ? (
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
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={styles.cardTitle}>{t('withdrawFunds.mobileMoney', 'Mobile Money')}</Text>
                      <View style={[styles.badgeRecommended, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}>
                        <Text style={[styles.badgeRecommendedText, { color: '#065F46' }]}>
                          {railEligibility.momo.operators.length > 0 ? railEligibility.momo.operators.slice(0, 2).join(', ') : 'Disponible'}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.featuresList}>
                      <View style={styles.featureItem}>
                        <Ionicons name="checkmark-circle" size={14} color={selectedMethod === 'mobile' ? '#3B82F6' : '#64748B'} />
                        <Text style={styles.featureText}>{t('withdrawFunds.instantReception', 'Instant reception')}</Text>
                      </View>
                      <View style={styles.featureItem}>
                        <Ionicons name="checkmark-circle" size={14} color={selectedMethod === 'mobile' ? '#3B82F6' : '#64748B'} />
                        <Text style={styles.featureText}>{t('withdrawFunds.available247', 'Available 24/7')}</Text>
                      </View>
                      <View style={styles.featureItem}>
                        <Ionicons name="checkmark-circle" size={14} color={selectedMethod === 'mobile' ? '#3B82F6' : '#64748B'} />
                        <Text style={styles.featureText}>
                          {t('paymentRails.momoWithdrawAvailable', `Retrait instantané vers ${railEligibility.momo.operators.join(', ')}.`, {
                            operators: railEligibility.momo.operators.join(', ')
                          })}
                        </Text>
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
                    <Text style={styles.statLabel}>{t('withdrawFunds.delay', 'Delay')}</Text>
                    <Text style={styles.statValue}>{t('withdrawFunds.delayInstant', 'Instant')}</Text>
                  </View>
                </View>
                <View style={styles.statItem}>
                  <View style={[styles.statIconCircle, {backgroundColor: selectedMethod === 'mobile' ? '#3B82F6' : '#64748B'}]}>
                    <Text style={{color: '#FFF', fontSize: 10, fontWeight: 'bold'}}>%</Text>
                  </View>
                  <View>
                    <Text style={styles.statLabel}>{t('withdrawFunds.dizzitupFee', 'DizzitUp Fee')}</Text>
                    <Text style={styles.statValue}>1,5%</Text>
                  </View>
                </View>
                <View style={styles.statItem}>
                  <View style={[styles.statIconCircle, {backgroundColor: selectedMethod === 'mobile' ? '#3B82F6' : '#64748B'}]}>
                    <Ionicons name="git-network-outline" size={12} color="#FFF" />
                  </View>
                  <View>
                    <Text style={styles.statLabel}>{t('withdrawFunds.networkFee', 'Network Fee')}</Text>
                    <Text style={styles.statValue}>Polygon Network</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ) : (
            /* Card 2 Disabled: Mobile Money for Unsupported Country */
            <TouchableOpacity 
              style={[styles.methodCard, styles.methodCardDisabled]}
              onPress={() => setRegionModalVisible(true)}
              activeOpacity={0.8}
            >
              <View style={styles.cardTop}>
                <View style={styles.cardTopLeft}>
                  <View style={[styles.cardIconCircle, {backgroundColor: '#F1F5F9'}]}>
                    <Ionicons name="phone-portrait-outline" size={28} color="#94A3B8" />
                  </View>
                  <View style={styles.cardHeaderInfo}>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                      <Text style={[styles.cardTitle, {color: '#94A3B8'}]}>{t('withdrawFunds.mobileMoney', 'Mobile Money')}</Text>
                      <View style={[styles.badgeComingSoon, { backgroundColor: '#F1F5F9', borderColor: '#E2E8F0' }]}>
                        <Ionicons name="lock-closed" size={10} color="#64748B" style={{ marginRight: 2 }} />
                        <Text style={[styles.badgeComingSoonText, { color: '#64748B' }]}>
                          {t('paymentRails.unavailableInCountry', `Indisponible en/au ${railEligibility.countryName}`, {
                            country: railEligibility.countryName,
                          })}
                        </Text>
                      </View>
                    </View>
                    
                    <Text style={styles.disabledCardSubtext}>
                      {t(
                        'paymentRails.momoWithdrawUnavailable',
                        `Le retrait Mobile Money n'est pas disponible pour ${railEligibility.countryName}. Il est actif dans 18 pays d'Afrique (Bénin, Sénégal, Côte d'Ivoire, Kenya...).`,
                        { country: railEligibility.countryName }
                      )}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.btnChangeCountrySmall}
                  onPress={() => setRegionModalVisible(true)}
                >
                  <Text style={styles.btnChangeCountrySmallText}>
                    {t('paymentRails.switchCountry', 'Changer')}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}

          {/* Card 3: Carte bancaire (Disabled) */}
          <View style={[styles.methodCard, styles.methodCardDisabled]}>
            <View style={styles.cardTop}>
              <View style={styles.cardTopLeft}>
                <View style={[styles.cardIconCircle, {backgroundColor: '#E2E8F0'}]}>
                  <Ionicons name="card-outline" size={28} color="#94A3B8" />
                </View>
                <View style={styles.cardHeaderInfo}>
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Text style={[styles.cardTitle, {color: '#94A3B8'}]}>{t('withdrawFunds.bankCard', 'Bank card')}</Text>
                    <View style={styles.badgeComingSoon}>
                      <Text style={styles.badgeComingSoonText}>{t('withdrawFunds.comingSoon', 'Coming soon')}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.featuresList}>
                    <View style={styles.featureItem}>
                      <Ionicons name="checkmark-circle" size={14} color="#94A3B8" />
                      <Text style={[styles.featureText, {color: '#94A3B8'}]}>{t('withdrawFunds.withdrawToCard', 'Withdrawal to your card')}</Text>
                    </View>
                    <View style={styles.featureItem}>
                      <Ionicons name="checkmark-circle" size={14} color="#94A3B8" />
                      <Text style={[styles.featureText, {color: '#94A3B8'}]}>{t('withdrawFunds.usableEverywhere', 'Usable everywhere')}</Text>
                    </View>
                    <View style={styles.featureItem}>
                      <Ionicons name="checkmark-circle" size={14} color="#94A3B8" />
                      <Text style={[styles.featureText, {color: '#94A3B8'}]}>{t('withdrawFunds.arrivingSoon', 'Arriving soon')}</Text>
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
                  <Text style={styles.statLabel}>{t('withdrawFunds.delay', 'Delay')}</Text>
                  <Text style={[styles.statValue, {color: '#94A3B8'}]}>{t('withdrawFunds.delay24To48h', '24h to 48h')}</Text>
                </View>
              </View>
              <View style={styles.statItem}>
                <View style={[styles.statIconCircle, {backgroundColor: '#94A3B8'}]}>
                  <Text style={{color: '#FFF', fontSize: 10, fontWeight: 'bold'}}>%</Text>
                </View>
                <View>
                  <Text style={styles.statLabel}>{t('withdrawFunds.dizzitupFee', 'DizzitUp Fee')}</Text>
                  <Text style={[styles.statValue, {color: '#94A3B8'}]}>2,5%</Text>
                </View>
              </View>
              <View style={styles.statItem}>
                <View style={[styles.statIconCircle, {backgroundColor: '#94A3B8'}]}>
                  <Ionicons name="git-network-outline" size={12} color="#FFF" />
                </View>
                <View>
                  <Text style={styles.statLabel}>{t('withdrawFunds.networkFee', 'Network Fee')}</Text>
                  <Text style={[styles.statValue, {color: '#94A3B8'}]}>{t('withdrawFunds.variable', 'Variable')}</Text>
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
              {t('withdrawFunds.reviewDetailsNotice', 'You can review all details before confirming your withdrawal.')}
            </Text>
          </View>

          {/* Continue Button */}
          <TouchableOpacity style={styles.btnContinue} onPress={() => navigation.navigate('WithdrawFundsMobileMoneySummaryScreen', { amount, currency, selectedToken, selectedNetwork, selectedMethod, destinationCountry })}>
            <Text style={styles.btnContinueText}>{t('withdrawFunds.continueBtn', 'Continue')}</Text>
          </TouchableOpacity>

        </ScrollView>

        {/* Region Switcher Modal */}
        <PaymentRegionModal
          visible={regionModalVisible}
          onClose={() => setRegionModalVisible(false)}
          currentCountryCode={destinationCountry}
          onSelectCountry={(code) => {
            setDestinationCountry(code);
            if (setUserCountry) setUserCountry(code);
          }}
          onSelectAlternativeMethod={(method) => setSelectedMethod(method === 'card' ? 'bank' : 'bank')}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    paddingTop: Platform.OS === 'android' ? Math.max(StatusBar.currentHeight || 0, 44) + 6 : 14,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
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
  countrySelectionRow: {
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
  countrySelectionLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#475569',
  },
  countryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  countryPillFlag: {
    fontSize: 14,
    marginRight: 5,
  },
  countryPillText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: '#1D4ED8',
  },
  disabledCardSubtext: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
    marginTop: 4,
    paddingRight: 6,
  },
  btnChangeCountrySmall: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    alignSelf: 'center',
    marginLeft: 6,
  },
  btnChangeCountrySmallText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#1D4ED8',
  },
});
