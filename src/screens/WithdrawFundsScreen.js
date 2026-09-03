import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Platform, StatusBar, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CryptoIcon from '../components/CryptoIcon';
import { useApp } from '../context/AppContext';
import { getCountryCurrencyInfo } from '../utils/countryCurrencyUtils';

export default function WithdrawFundsScreen() {
  const navigation = useNavigation();
  const { user, t } = useApp();

  // 1. Auto-detect user's local fiat currency based on country
  const userCountryInfo = useMemo(() => {
    return getCountryCurrencyInfo(user?.country || 'Togo');
  }, [user?.country]);

  const localCurrency = ['XOF', 'XAF'].includes(userCountryInfo.currency) ? 'FCFA' : userCountryInfo.currency;

  const [amount, setAmount] = useState('250 000');
  const [selectedToken, setSelectedToken] = useState('USDC');

  // 2. Token selection with live balances
  const tokens = useMemo(() => [
    { id: 'USDC', name: 'USDC', balance: user?.allBalances?.USDC ? `${user.allBalances.USDC}` : '1 250,00', network: 'Polygon' },
    { id: 'USDT', name: 'USDT', balance: user?.allBalances?.USDT ? `${user.allBalances.USDT}` : '930,00', network: 'Polygon' },
    { id: 'EURC', name: 'EURC', balance: user?.allBalances?.EURC ? `${user.allBalances.EURC}` : '420,00', network: 'Base' },
    { id: 'DZY', name: 'DZY', balance: user?.balanceDZY ? `${user.balanceDZY}` : '12 500', network: 'Polygon' },
  ], [user?.allBalances, user?.balanceDZY]);

  // 3. Auto-detected blockchain network based on selected token
  const selectedNetwork = useMemo(() => {
    const found = tokens.find(t => t.id === selectedToken);
    return found?.network || 'Polygon';
  }, [selectedToken, tokens]);

  // Rough equivalence estimation for UI feedback
  const parsedAmount = parseFloat((amount || '').replace(/\s/g, '')) || 0;
  const estimatedCrypto = useMemo(() => {
    if (localCurrency === 'FCFA') return (parsedAmount / 600).toFixed(2);
    if (localCurrency === 'EUR') return (parsedAmount * 1.08).toFixed(2);
    if (localCurrency === 'GHS') return (parsedAmount / 15).toFixed(2);
    if (localCurrency === 'NGN') return (parsedAmount / 1500).toFixed(2);
    return parsedAmount.toFixed(2);
  }, [parsedAmount, localCurrency]);

  const renderTokenIcon = (id) => <CryptoIcon symbol={id} size={38} />;
  const renderNetworkIcon = (id) => <CryptoIcon symbol={id} size={28} />;

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
          <Text style={styles.mainTitle}>{t('withdraw.choose_details_title', 'Choisissez les détails de votre retrait')}</Text>
          <Text style={styles.mainSubtitle}>{t('withdraw.choose_details_desc', 'La devise de votre pays est fixée automatiquement. Choisissez le jeton à débiter.')}</Text>

          {/* Main Card */}
          <View style={styles.mainCard}>
            
            {/* Montant à retirer en monnaie locale */}
            <View style={styles.sectionHeaderBetween}>
              <Text style={styles.sectionTitle}>{t('withdraw.amount_to_withdraw', 'Montant à retirer')}</Text>
              <View style={styles.detectedCountryBadge}>
                <Image source={{ uri: `https://flagcdn.com/w40/${userCountryInfo.code}.png` }} style={styles.countryFlag} />
                <Text style={styles.detectedCountryText}>{userCountryInfo.label || 'Afrique'}</Text>
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
            <Text style={styles.equivText}>≈ {estimatedCrypto} {selectedToken}</Text>

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

            {/* Réseau détecté automatiquement */}
            <View style={styles.detectedNetworkCard}>
              <View style={styles.detectedNetworkLeft}>
                <View style={styles.networkIconCircle}>
                  {renderNetworkIcon(selectedNetwork)}
                </View>
                <View>
                  <Text style={styles.networkTitle}>{t('withdraw.detected_network', 'Réseau blockchain détecté')}</Text>
                  <Text style={styles.networkName}>{selectedNetwork} {t('withdraw.recommended_network', '(Recommandé)')}</Text>
                </View>
              </View>
              <View style={styles.autoBadge}>
                <Ionicons name="flash" size={12} color="#16A34A" style={{ marginRight: 3 }} />
                <Text style={styles.autoBadgeText}>{t('common.auto', 'Auto')}</Text>
              </View>
            </View>

            {/* Info Banner */}
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
            style={styles.btnContinue} 
            onPress={() => navigation.navigate('WithdrawFundsMethodScreen', { amount, currency: localCurrency, selectedToken, selectedNetwork })}
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
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  gridItemCard: {
    width: '23%', // approx 4 items per row, or we could use flex: 1 and map
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 8,
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
  btnContinue: {
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
});
