import { SafeAreaView } from 'react-native-safe-area-context';
import { getCountryCurrencyInfo } from '../utils/countryCurrencyUtils';
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Platform, StatusBar, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CryptoIcon from '../components/CryptoIcon';
import { useApp } from '../context/AppContext';
import { currencyRateService, EMERGENCY_RATES } from '../services/currencyRateService';
import { getPaymentRailEligibility } from '../services/paymentCorridorService';

export default function WithdrawFundsScreen() {
  const navigation = useNavigation();
  const { user, t, getEffectiveWalletCountry } = useApp();

  // 1. Resolve fiat currency: for merchants use HQ country, for users use their account country
  const isBusinessCard = user?.role === 'merchant';
  const rawCountryKey = getEffectiveWalletCountry ? getEffectiveWalletCountry(isBusinessCard) : (user?.country || user?.country_code || '');
  const resolvedCode = getCountryCurrencyInfo(rawCountryKey).code;
  const effectiveCountryKey = (resolvedCode && resolvedCode.length === 2 ? resolvedCode : (rawCountryKey || '')).toUpperCase();
  const userCountryInfo = useMemo(() => getCountryCurrencyInfo(effectiveCountryKey), [effectiveCountryKey]);
  const localCurrency = ['XOF', 'XAF'].includes(userCountryInfo.currency) ? 'FCFA' : userCountryInfo.currency;

  // 2. Live exchange rates from currencyRateService (Supabase → live API → emergency fallback)
  const [rates, setRates] = useState(currencyRateService.getRates() || EMERGENCY_RATES);
  useEffect(() => {
    const unsubscribe = currencyRateService.subscribe((newRates) => setRates(newRates));
    return unsubscribe;
  }, []);

  const [amount, setAmount] = useState('');
  const [selectedToken, setSelectedToken] = useState(null);

  // 3. Only tokens with positive balance — USDC, USDT, EURC, DZY
  const allTokens = useMemo(() => [
    { id: 'USDC', name: 'USDC', rawBalance: user?.allBalances?.USDC ? parseFloat(user.allBalances.USDC) : 0 },
    { id: 'USDT', name: 'USDT', rawBalance: user?.allBalances?.USDT ? parseFloat(user.allBalances.USDT) : 0 },
    { id: 'EURC', name: 'EURC', rawBalance: user?.allBalances?.EURC ? parseFloat(user.allBalances.EURC) : 0 },
    { id: 'DZY',  name: 'DZY',  rawBalance: user?.balanceDZY ? parseFloat(user.balanceDZY) : 0 },
  ], [user?.allBalances, user?.balanceDZY]);

  const tokens = useMemo(() =>
    allTokens
      .filter(tk => tk.rawBalance > 0)
      .map(tk => ({ ...tk, balance: tk.rawBalance.toFixed(2) })),
    [allTokens]
  );

  // Auto-select first available token when list resolves
  useEffect(() => {
    if (tokens.length > 0 && (!selectedToken || !tokens.find(tk => tk.id === selectedToken))) {
      setSelectedToken(tokens[0].id);
    }
  }, [tokens]);

  // 4. Validate token availability dynamically against backend execution routes
  const [tokenStatus, setTokenStatus] = useState('LOADING');
  const [tokenStatusMsg, setTokenStatusMsg] = useState('');
  
  useEffect(() => {
    if (!selectedToken) return;
    let isMounted = true;
    const checkAvailability = async () => {
      try {
        setTokenStatus('LOADING');
        const sessionToken = user?.token || '';
        let DIZZY_URL = process.env.EXPO_PUBLIC_DIZZY_WALLET_API_URL || 'http://localhost:5000/api';
        if (Platform.OS === 'android' && DIZZY_URL.includes('localhost')) {
          DIZZY_URL = DIZZY_URL.replace('localhost', '10.0.2.2');
        }
        
        const response = await fetch(`${DIZZY_URL}/momo/wallet/cashout/quote`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${sessionToken}` },
          body: JSON.stringify({
            amount: 1000, // Dummy amount just to check route eligibility
            currency: selectedToken,
            country: effectiveCountryKey,
            payoutMethod: 'momo'
          })
        });
        const data = await response.json();
        if (isMounted) {
          if (data && (data.status === 'UNAVAILABLE' || data.success === false)) {
            setTokenStatus('UNAVAILABLE');
            setTokenStatusMsg(data.message || data.error);
          } else {
            setTokenStatus('AVAILABLE');
          }
        }
      } catch (err) {
        if (isMounted) {
          const rail = getPaymentRailEligibility(effectiveCountryKey, 'offramp');
          if (rail && (rail.momo?.enabled || rail.bank?.enabled)) {
            setTokenStatus('AVAILABLE');
          } else {
            setTokenStatus('AVAILABLE'); // Fallback to let user view available corridors in method screen
          }
        }
      }
    };
    checkAvailability();
    return () => { isMounted = false; };
  }, [selectedToken, effectiveCountryKey, user]);

  // 5. Live fiat→USD rate from currencyRateService
  const normalizedCurrency = currencyRateService.normalizeCurrency(localCurrency);
  const localRate = rates[normalizedCurrency] || EMERGENCY_RATES[normalizedCurrency];
  const hasValidRate = !!localRate;

  // Parsed fiat amount
  const parsedAmount = parseFloat((amount || '').replace(/[\s,]/g, '')) || 0;

  // Equivalent in USD, then in selected token (USDC/USDT 1:1 USD, EURC≈EUR, DZY 10:1)
  const selectedTokenObj = useMemo(() => tokens.find(tk => tk.id === selectedToken), [tokens, selectedToken]);
  const tokenToUsd = useMemo(() => {
    if (!selectedToken) return 1;
    if (selectedToken === 'DZY') return 0.10;
    if (selectedToken === 'EURC') return 1 / (rates['EUR'] || 0.92);
    return 1;
  }, [selectedToken, rates]);

  // How many tokens needed to cover the fiat amount
  const amountInUsd = hasValidRate ? parsedAmount / localRate : 0;
  const tokensNeeded = amountInUsd / tokenToUsd;

  // Max tokens user can sell (after 3% DizzitUp fee deducted from fiat side)
  // Wait, if they want to sell 100%, the total cost (fiat + 3%) must = token balance in fiat
  // So max fiat = token balance * tokenToUsd * localRate / 1.03
  const availableTokens = selectedTokenObj ? parseFloat(selectedTokenObj.balance) : 0;
  const maxFiatFromTokens = hasValidRate ? availableTokens * tokenToUsd * localRate * (1 / 1.03) : 0;
  const isInsufficient = parsedAmount > 0 && parsedAmount > maxFiatFromTokens;

  const renderTokenIcon = (id) => <CryptoIcon symbol={id} size={38} />;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()} accessibilityLabel="Retour">
            <Ionicons name="chevron-back" size={24} color="#1A2840" />
          </TouchableOpacity>
          <Text style={styles.pageTitle}>{t('withdraw.title', 'Retirer des fonds')}</Text>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('ContactUsScreen')} accessibilityLabel="Support">
            <Ionicons name="headset-outline" size={22} color="#1A2840" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {tokenStatus !== 'UNAVAILABLE' && (
            <>
              {/* Stepper (1 to 5) */}
              <View style={styles.stepperContainer}>
                <View style={[styles.stepCircle, styles.stepCircleActive]}>
                  <Text style={styles.stepNumberActive}>1</Text>
                </View>
                <View style={styles.stepLine} />
                <View style={styles.stepCircle}><Text style={styles.stepNumber}>2</Text></View>
                <View style={styles.stepLine} />
                <View style={styles.stepCircle}><Text style={styles.stepNumber}>3</Text></View>
                <View style={styles.stepLine} />
                <View style={styles.stepCircle}><Text style={styles.stepNumber}>4</Text></View>
                <View style={styles.stepLine} />
                <View style={styles.stepCircle}><Text style={styles.stepNumber}>5</Text></View>
              </View>

              {/* Titles */}
              <Text style={styles.stepOverTitle}>{t('withdraw.step_1_of_5', 'Étape 1/5')}</Text>
            </>
          )}
          <Text style={styles.mainTitle}>{t('withdraw.choose_details_title', 'Choisissez les détails de votre retrait')}</Text>
          <Text style={styles.mainSubtitle}>{t('withdraw.choose_details_desc', 'La devise de votre pays est fixée automatiquement. Choisissez le jeton à débiter.')}</Text>

          {/* Main Card */}
          <View style={styles.mainCard}>
            
            {tokenStatus === 'UNAVAILABLE' && (
              <View style={styles.unavailableBanner}>
                <View style={styles.unavailableHeader}>
                  <View style={styles.unavailableIconWrapper}>
                    <Ionicons name="alert-circle" size={22} color="#E11D48" />
                  </View>
                  <View style={styles.unavailableBadge}>
                    <Text style={styles.unavailableBadgeText}>{t('withdraw.coming_soon', 'Coming soon')}</Text>
                  </View>
                </View>
                <Text style={styles.unavailableTitle}>
                  {t('withdraw.unavailable_country', { country: t(`country.${effectiveCountryKey}`, userCountryInfo.countryName || effectiveCountryKey), defaultValue: `Cash-out is temporarily unavailable in ${t(`country.${effectiveCountryKey}`, userCountryInfo.countryName || effectiveCountryKey)}.` })}
                </Text>
                <Text style={styles.unavailableSubtitle}>
                  {t('withdraw.unavailable_subtitle', 'This payout route is being enabled and will become available once the off-ramp connection is ready.')}
                </Text>
              </View>
            )}

            {!hasValidRate && tokenStatus !== 'UNAVAILABLE' && (
              <View style={[styles.infoBanner, { backgroundColor: '#FEE2E2', borderColor: '#FCA5A5', borderWidth: 1, marginBottom: 16 }]}>
                <View style={[styles.infoIconCircle, { backgroundColor: '#EF4444' }]}>
                  <Ionicons name="alert-circle" size={16} color="#FFFFFF" />
                </View>
                <Text style={[styles.infoBannerText, { color: '#7F1D1D' }]}>
                  {t('withdraw.exchange_rate_unavailable', 'Le taux de change actuel n\'est pas disponible. Veuillez réessayer plus tard.')}
                </Text>
              </View>
            )}
            {/* Montant à retirer en monnaie locale */}
            <View style={styles.sectionHeaderBetween}>
              <Text style={styles.sectionTitle}>{t('withdraw.amount_to_withdraw', 'Montant à retirer')}</Text>
              <View style={styles.detectedCountryBadge}>
                <Image source={{ uri: `https://flagcdn.com/w40/${userCountryInfo.code}.png` }} style={styles.countryFlag} />
                <Text style={styles.detectedCountryText}>{t(`country.${effectiveCountryKey}`, userCountryInfo.countryName || 'Afrique')} ({localCurrency})</Text>
              </View>
            </View>

            <View style={styles.amountInputContainer}>
              <TextInput 
                style={styles.amountInput}
                value={amount}
                onChangeText={(text) => setAmount(text.replace(/\D/g, '').slice(0, 12).replace(/\B(?=(\d{3})+(?!\d))/g, ' '))}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#94A3B8"
              />
              <View style={styles.fixedCurrencyBadge}>
                <Text style={styles.fixedCurrencyText}>{localCurrency}</Text>
              </View>
            </View>
            <Text style={styles.equivText}>≈ {tokensNeeded > 0 ? tokensNeeded.toFixed(4) : '—'} {selectedToken || '—'}</Text>

            {/* Quick Percentage Chips — calculated using live rates from currencyRateService */}
            <View style={styles.percentRow}>
              {[25, 50, 75, 100].map((pct) => (
                <TouchableOpacity
                  key={pct}
                  style={styles.percentChip}
                  onPress={() => {
                    if (!selectedTokenObj || !hasValidRate || tokenStatus === 'UNAVAILABLE') return;
                    const fiatValue = Math.floor(maxFiatFromTokens * (pct / 100));
                    setAmount(fiatValue.toLocaleString('fr-FR').replace(/,/g, ' '));
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.percentChipText}>{pct}%</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Insufficient balance: offer max cash-out instead of top-up */}
            {isInsufficient && selectedTokenObj && (
              <TouchableOpacity
                style={styles.maxSellBanner}
                onPress={() => {
                  const fiatValue = Math.round(maxFiatFromTokens);
                  setAmount(fiatValue.toLocaleString('fr-FR').replace(/,/g, ' '));
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="alert-circle-outline" size={15} color="#D97706" style={{ marginRight: 6 }} />
                <Text style={styles.maxSellText}>
                  {t('withdraw.max_available', 'Max available')}{': '}
                  <Text style={{ fontFamily: 'Inter_700Bold' }}>
                    {Math.round(maxFiatFromTokens).toLocaleString('fr-FR')} {localCurrency}
                  </Text>
                  {'  '}·{'  '}
                  <Text style={{ color: '#D97706', fontFamily: 'Inter_600SemiBold' }}>
                    {t('withdraw.sell_max_tap', 'Tap to use')}
                  </Text>
                </Text>
              </TouchableOpacity>
            )}

            <View style={styles.divider} />

            {/* Choisissez le jeton à débiter */}
            <Text style={styles.sectionTitle}>{t('withdraw.select_token_to_debit', 'Choisissez le jeton à débiter')}</Text>
            <Text style={styles.sectionSubInstruction}>{t('withdraw.select_token_desc', 'Sélectionnez parmi vos jetons disponibles :')}</Text>
            
            <View style={styles.gridContainer}>
              {tokens.map((token) => (
                <TouchableOpacity 
                  key={token.id} 
                  style={[styles.gridItemCard, selectedToken === token.id && styles.gridItemCardActive]}
                  onPress={() => setSelectedToken(token.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.itemIconContainer}>
                    {renderTokenIcon(token.id)}
                  </View>
                  <Text style={styles.itemName}>{token.name}</Text>
                  <Text style={styles.itemSubText}>{t('common.wallet.balance', 'Solde')} : {token.balance}</Text>
                  
                  {selectedToken === token.id && (
                    <View style={styles.checkBadge}>
                      <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Info Banner — blockchain routing is hidden from user, handled by backend */}
            <View style={styles.infoBanner}>
              <View style={styles.infoIconCircle}>
                <Ionicons name="shield-checkmark" size={16} color="#FFFFFF" />
              </View>
              <Text style={styles.infoBannerText}>
                {t('withdraw.safety_notice', 'Conversion sécurisée garantie au meilleur taux de change vers votre monnaie locale.')}
              </Text>
            </View>

          </View>

          {/* Continue Button */}
          <TouchableOpacity
            style={[styles.btnContinue, (!selectedToken || parsedAmount <= 0 || isInsufficient || !hasValidRate || tokenStatus !== 'AVAILABLE') && { opacity: 0.5 }]}
            disabled={!selectedToken || parsedAmount <= 0 || isInsufficient || !hasValidRate || tokenStatus !== 'AVAILABLE'}
            onPress={() => navigation.navigate('WithdrawFundsMethodScreen', {
              amount,
              currency: localCurrency,
              selectedToken,
              countryCode: effectiveCountryKey,
            })}
          >
            <Text style={styles.btnContinueText}>{t('btnContinue', 'Continuer')}</Text>
            <Ionicons name="arrow-forward" size={18} color="#1A2840" style={{ marginLeft: 8 }} />
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
  mainCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
  },
  sectionHeaderBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#1A2840',
    marginBottom: 4,
  },
  sectionSubInstruction: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#64748B',
    marginBottom: 12,
  },
  detectedCountryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  countryFlag: {
    width: 16,
    height: 12,
    borderRadius: 2,
    marginRight: 6,
  },
  detectedCountryText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#1E293B',
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingLeft: 16,
    paddingRight: 8,
    height: 56,
  },
  amountInput: {
    flex: 1,
    fontFamily: 'Inter_700Bold',
    fontSize: 24,
    color: '#1A2840',
    outlineStyle: 'none',
  },
  fixedCurrencyBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  fixedCurrencyText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#1D4ED8',
  },
  currencySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  flagText: {
    fontSize: 16,
    marginRight: 6,
  },
  currencyCode: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#1A2840',
  },
  equivText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: '#64748B',
    marginTop: 8,
  },
  percentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 12,
  },
  percentChip: {
    flex: 1,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  percentChipText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#1E293B',
  },
  detectedNetworkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    marginTop: 4,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  detectedNetworkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  networkTitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#64748B',
  },
  networkName: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    color: '#1A2840',
    marginTop: 2,
  },
  autoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  autoBadgeText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    color: '#15803D',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 20,
  },
  gridContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8,
  },
  gridItemCard: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 4,
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  gridItemCardActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFB800',
    borderWidth: 1.5,
  },
  itemIconContainer: {
    marginBottom: 10,
  },
  tokenIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tokenIconText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  networkIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  baseIconInner: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  itemName: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    color: '#1A2840',
    marginBottom: 4,
    textAlign: 'center',
  },
  itemSubText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 9,
    color: '#94A3B8',
    textAlign: 'center',
  },
  checkBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#FFB800',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
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
  unavailableBanner: {
    backgroundColor: '#FFF1F2',
    borderWidth: 1,
    borderColor: '#FECDD3',
    borderRadius: 16, 
    padding: 16, 
    marginBottom: 20,
    shadowColor: '#E11D48',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  unavailableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  unavailableIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFE4E6',
    borderWidth: 1,
    borderColor: '#FECDD3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unavailableBadge: {
    backgroundColor: '#E11D48',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  unavailableBadgeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    color: '#FFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  unavailableTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14, 
    color: '#9F1239', 
    marginBottom: 6,
    lineHeight: 20,
  },
  unavailableSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#BE123C', 
    lineHeight: 18,
  },
  btnContinue: {
    flexDirection: 'row',
    backgroundColor: '#FFB800',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnContinueText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: '#1A2840',
  },
  maxSellBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FCD34D',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 10,
  },
  maxSellText: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#92400E',
    lineHeight: 18,
  },
});
