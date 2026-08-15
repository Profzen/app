import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, StatusBar, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNavBar from '../components/BottomNavBar';
import AppSelect from '../components/AppSelect';
import CryptoIcon from '../components/CryptoIcon';
import { CrossmintEmbeddedCheckout } from '@crossmint/client-sdk-react-native-ui';
import { useApp } from '../context/AppContext';
import { theme } from '../theme/theme';

const currencyOptions = [
  { value: 'USDC', label: 'USDC', subtitle: 'USD Coin' },
  { value: 'USDT', label: 'USDT', subtitle: 'Tether' },
  { value: 'EURC', label: 'EURC', subtitle: 'Euro Coin' },
  { value: 'DZY', label: 'DZY', subtitle: 'DizzitUp Wallet' },
];

const networkOptions = [
  { value: 'base', label: 'Réseau principal de Base', subtitle: 'Recommandé', iconName: 'radio-button-on', color: '#0052FF' },
  { value: 'polygon', label: 'Polygon', subtitle: 'Rapide et économique', iconName: 'git-network', color: '#8247E5' },
  { value: 'ethereum', label: 'Ethereum', subtitle: 'Réseau principal', iconName: 'diamond-outline', color: '#627EEA' },
  { value: 'solana', label: 'Solana', subtitle: 'Haute performance', iconName: 'flash-outline', color: '#14F195' },
];

export default function TopUpWalletDetailsScreen() {
  const navigation = useNavigation();
  const { session, user } = useApp();
  const [currency, setCurrency] = useState('USDC');
  const [network, setNetwork] = useState('base');
  const [orderIdentifier, setOrderIdentifier] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        if (!session?.access_token) {
          throw new Error("Veuillez vous connecter pour continuer.");
        }
        
        // This makes a real authenticated call to dizzy-wallet backend!
        let API_URL = process.env.EXPO_PUBLIC_DIZZY_WALLET_API_URL || 'http://localhost:5000/api/wallet';
        if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
          try {
            const urlObj = new URL(API_URL);
            if (urlObj.hostname === 'localhost') {
              urlObj.hostname = window.location.hostname;
              API_URL = urlObj.toString();
            }
          } catch (e) {}
        }
        
        const response = await fetch(`${API_URL}/create-order`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            amount: "10.00",
            currency: currency,
            network: network,
            fiatCurrency: "USD"
          })
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || 'Erreur réseau lors de la création de la commande');
        }

        const data = await response.json();
        setOrderIdentifier(data.orderId);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [session, currency, network]);

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
          {/* Progress Stepper */}
          <View style={styles.stepperContainer}>
            <View style={styles.stepWrapper}>
              <View style={[styles.stepCircle, styles.stepCircleCompleted]}>
                <Ionicons name="checkmark" size={16} color="#FFB800" />
                <View style={styles.tinyCheckBadge}>
                  <Ionicons name="checkmark" size={8} color="#FFFFFF" />
                </View>
              </View>
              <Text style={styles.stepText}>Mode de paiement</Text>
            </View>
            <View style={[styles.stepLine, styles.stepLineActive]} />
            
            <View style={styles.stepWrapper}>
              <View style={[styles.stepCircle, styles.stepCircleActive]}>
                <Text style={[styles.stepNumber, styles.stepNumberActive]}>2</Text>
              </View>
              <Text style={[styles.stepText, styles.stepTextActive]}>Détails</Text>
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
          <Text style={styles.mainTitle}>Détails du paiement</Text>
          <Text style={styles.mainSubtitle}>
            Effectuez votre paiement en toute sécurité via Crossmint.
          </Text>

          {/* Form: Devise */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>DEVISE</Text>
            <AppSelect value={currency} options={currencyOptions} onChange={setCurrency} title="Choisir la devise" renderLeading={(option) => <CryptoIcon symbol={option.value} size={26} style={{marginRight: 12}} />} />
          </View>

          {/* Form: Réseau de transaction */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>RÉSEAU DE TRANSACTION</Text>
            <AppSelect value={network} options={networkOptions} onChange={setNetwork} title="Choisir le réseau de transaction" renderLeading={(option) => <View style={[styles.networkIconCircle, {backgroundColor: option.color || '#0052FF'}]}><Ionicons name={option.iconName || 'git-network'} size={14} color="#FFF" /></View>} />
          </View>

          {/* Crossmint Embedded Checkout */}
          <View style={styles.checkoutWrapper}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FFB800" />
                <Text style={styles.loadingText}>Préparation de la transaction...</Text>
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={48} color="#EF4444" />
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryBtn} onPress={() => navigation.goBack()}>
                  <Text style={styles.retryText}>Retour</Text>
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
                      navigation.navigate('TopUpWalletPaymentScreen');
                    } else if (event.type === 'payment:process.failed') {
                      setError("Le paiement a échoué. Veuillez réessayer.");
                    } else if (event.type === 'payment:process.rejected') {
                       setError("Le paiement a été rejeté par la banque.");
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
