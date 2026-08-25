import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, StatusBar, ActivityIndicator, TextInput, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNavBar from '../components/BottomNavBar';
import AppSelect from '../components/AppSelect';
import CryptoIcon from '../components/CryptoIcon';
import { CrossmintEmbeddedCheckout } from '@crossmint/client-sdk-react-native-ui';
import { useApp } from '../context/AppContext';
import { transactionService } from '../services/transactionService';
import { theme } from '../theme/theme';

// Dynamic options will be mapped inside the component to use `t()`
const getCurrencyOptions = (t) => [
  { value: 'USDC', label: 'USDC', subtitle: 'USD Coin' },
  { value: 'USDT', label: 'USDT', subtitle: 'Tether' },
  { value: 'EURC', label: 'EURC', subtitle: 'Euro Coin' },
  { value: 'DZY', label: 'DZY', subtitle: 'DizzitUp Wallet' },
];

const getNetworkOptions = (t) => [
  { value: 'base', label: 'Base', subtitle: 'Recommandé', iconSymbol: 'BASE', color: '#0052FF' },
  { value: 'polygon', label: 'Polygon', subtitle: 'Rapide et économique', iconSymbol: 'MATIC', color: '#8247E5' },
  { value: 'ethereum', label: 'Ethereum', subtitle: 'Réseau principal', iconSymbol: 'ETH', color: '#627EEA' },
  { value: 'solana', label: 'Solana', subtitle: 'Haute performance', iconSymbol: 'SOL', color: '#14F195' },
];

export default function TopUpWalletDetailsScreen() {
  const navigation = useNavigation();
  const { session, user, t } = useApp();
  const evmAddress = user?.evmAddress || user?.businessEvmAddress || '';
  
  const currencyOptions = getCurrencyOptions(t);
  const networkOptions = getNetworkOptions(t);
  const [amount, setAmount] = useState('10');
  const [currency, setCurrency] = useState('USDC');
  const [network, setNetwork] = useState('base');
  const [orderIdentifier, setOrderIdentifier] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerateOrder = async () => {
    try {
      setIsLoading(true);
      setError(null);
      if (!session?.access_token) {
        throw new Error(t('topup.login_required', 'Login required'));
      }
      
      const userEmail = user?.email || session?.user?.email;
      if (!evmAddress) {
        throw new Error('Wallet address is missing from your profile. Please refresh the app.');
      }
      if (!userEmail) {
        throw new Error('Email address is missing from your profile. Please refresh the app.');
      }
      
      const payload = {
        amount: parseFloat(amount || '10').toFixed(2), // Crossmint often expects 2 decimals like "10.00"
        walletAddress: evmAddress,
        email: userEmail,
        token: currency,
        chain: network,
        billingCountry: user?.country || 'TG',
        source: 'dizzitapp',
        userType: 'user'
      };

      const result = await transactionService.createCrossmintOnrampOrder(session.access_token, payload);
      setOrderIdentifier(result.orderId);
    } catch (err) {
      console.error(err);
      setError(err.message || t('topup.network_error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="#1A2840" />
          </TouchableOpacity>
          <Text style={styles.pageTitle}>{t('topup.title')}</Text>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="help-circle-outline" size={24} color="#1A2840" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Progress Stepper */}
          <View style={styles.stepperContainer}>
            <View style={styles.stepWrapper}>
              <View style={[styles.stepCircle, styles.stepCircleCompleted]}>
                <Ionicons name="checkmark" size={16} color="#FFB800" />
                <View style={styles.tinyCheckBadge}>
                  <Ionicons name="checkmark" size={8} color="#FFFFFF" />
                </View>
              </View>
              <Text style={styles.stepText}>{t('topup.payment_method')}</Text>
            </View>
            <View style={[styles.stepLine, styles.stepLineActive]} />
            
            <View style={styles.stepWrapper}>
              <View style={[styles.stepCircle, styles.stepCircleActive]}>
                <Text style={[styles.stepNumber, styles.stepNumberActive]}>2</Text>
              </View>
              <Text style={[styles.stepText, styles.stepTextActive]}>{t('topup.details')}</Text>
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
            <View style={styles.stepLine} />

            <View style={styles.stepWrapper}>
              <View style={styles.stepCircle}>
                <Text style={styles.stepNumber}>5</Text>
              </View>
              <Text style={styles.stepText}>{t('topup.confirmation')}</Text>
            </View>
          </View>

          {/* Titles */}
          <Text style={styles.mainTitle}>{t('topup.payment_details')}</Text>
          <Text style={styles.mainSubtitle}>
            {t('topup.crossmint_secure')}
          </Text>

          {/* Form: Montant */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>{t('topup.amount_usd')}</Text>
            <View style={styles.inputContainer}>
              <TextInput 
                style={styles.input}
                value={amount}
                onChangeText={(text) => setAmount(text.replace(/[^0-9.,]/g, '').replace(',', '.').slice(0, 10))}
                keyboardType="numeric"
                placeholder="10.00"
                editable={!orderIdentifier}
              />
              <Text style={styles.currencyText}>USD</Text>
            </View>
          </View>

          {/* Form: Devise */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>{t('topup.crypto_currency')}</Text>
            <AppSelect value={currency} options={currencyOptions} onChange={setCurrency} title={t('topup.choose_currency')} renderLeading={(option) => <CryptoIcon symbol={option.value} size={26} style={{marginRight: 12}} />} />
          </View>

          {/* Form: Réseau de transaction */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>{t('topup.transaction_network')}</Text>
            <AppSelect value={network} options={networkOptions} onChange={setNetwork} title={t('topup.choose_network')} renderLeading={(option) => <CryptoIcon symbol={option.iconSymbol} size={26} style={{marginRight: 12}} />} />
          </View>

          {/* Crossmint Embedded Checkout */}
          <View style={styles.checkoutWrapper}>
            {!orderIdentifier && !isLoading && !error && (
              <TouchableOpacity style={styles.btnContinue} onPress={handleGenerateOrder}>
                <Text style={styles.btnContinueText}>{t('topup.continue_crossmint')}</Text>
                <Ionicons name="arrow-forward" size={20} color="#1A2840" />
              </TouchableOpacity>
            )}

            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FFB800" />
                <Text style={styles.loadingText}>{t('topup.preparing_transaction')}</Text>
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={48} color="#EF4444" />
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryBtn} onPress={() => setError(null)}>
                  <Text style={styles.retryText}>{t('topup.retry')}</Text>
                </TouchableOpacity>
              </View>
            ) : orderIdentifier ? (
              <View style={styles.crossmintContainer}>
                <CrossmintEmbeddedCheckout
                  paymentMethod="fiat"
                  orderIdentifier={orderIdentifier}
                  environment={process.env.EXPO_PUBLIC_CROSSMINT_CLIENT_SIDE_API_KEY?.startsWith('sk_test') ? 'staging' : 'production'}
                  onEvent={(event) => {
                    console.log("Crossmint Event:", event);
                    if (event.type === 'payment:process.succeeded') {
                      navigation.navigate('TopUpWalletPaymentScreen'); // success screen
                    } else if (event.type === 'payment:process.failed') {
                      setError(t('topup.payment_failed'));
                    } else if (event.type === 'payment:process.rejected') {
                       setError(t('topup.payment_rejected'));
                    }
                  }}
                />
              </View>
            ) : null}
          </View>

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
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  pageTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    color: '#1A2840',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  stepperContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 16,
    marginBottom: 32,
  },
  stepWrapper: {
    alignItems: 'center',
    width: 48,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepCircleActive: {
    backgroundColor: '#FFFBEB',
    borderWidth: 2,
    borderColor: '#FFB800',
  },
  stepCircleCompleted: {
    backgroundColor: '#FFFBEB',
  },
  tinyCheckBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#FFB800',
    width: 12,
    height: 12,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFF',
  },
  stepNumber: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#94A3B8',
  },
  stepNumberActive: {
    color: '#FFB800',
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
    backgroundColor: '#F1F5F9',
    marginTop: 14,
    marginHorizontal: -8,
  },
  stepLineActive: {
    backgroundColor: '#FFB800',
  },
  mainTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 24,
    color: '#1A2840',
    marginBottom: 8,
  },
  mainSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#64748B',
    lineHeight: 22,
    marginBottom: 32,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  networkIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkoutWrapper: {
    flex: 1,
    minHeight: 400,
    marginTop: 20,
  },
  btnContinue: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFB800',
    paddingVertical: 18,
    borderRadius: 16,
    marginBottom: 24,
  },
  btnContinueText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: '#1A2840',
    marginRight: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  input: {
    flex: 1,
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    color: '#1A2840',
    outlineStyle: 'none',
  },
  currencyText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#64748B',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontFamily: 'Inter_500Medium',
    color: '#64748B',
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
  },
  errorText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#991B1B',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  retryBtn: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontFamily: 'Inter_600SemiBold',
  },
  crossmintContainer: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 8,
    minHeight: 500,
  },
});
