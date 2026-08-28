import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, StatusBar, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import BottomNavBar from '../components/BottomNavBar';
import { isSmallScreen } from '../utils/responsive';

export default function LocalExchangeScreen() {
  const navigation = useNavigation();
  const { t } = useApp();
  const [step, setStep] = useState(1); // 1: Amount, 2: Scan, 3: Confirm, 4: Success
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USDC');

  const currencies = ['USDC', 'USDT', 'EURC', 'DZY'];

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1 && step < 4) {
      setStep(step - 1);
    } else {
      navigation.goBack();
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>{t('localExchange.title', 'Scan & Cash')}</Text>
      <Text style={styles.subtitle}>
        {t('localExchange.subtitle', 'Exchange your stablecoins against cash locally.')}
      </Text>

      <View style={styles.card}>
        <Text style={styles.label}>{t('localExchange.selectCurrency', 'Select Asset')}</Text>
        <View style={styles.currencyRow}>
          {currencies.map((c) => (
            <TouchableOpacity
              key={c}
              style={[styles.currencyChip, currency === c && styles.currencyChipActive]}
              onPress={() => setCurrency(c)}
            >
              <Text style={[styles.currencyChipText, currency === c && styles.currencyChipTextActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.label, { marginTop: 24 }]}>{t('localExchange.amount', 'Amount to cash out')}</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            placeholder="0.00"
            placeholderTextColor="#94A3B8"
          />
          <Text style={styles.inputCurrency}>{currency}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.btnPrimary, { marginTop: 'auto' }]}
        onPress={handleNext}
        disabled={!amount || parseFloat(amount) <= 0}
      >
        <Text style={styles.btnPrimaryText}>{t('common.continue', 'Continue')}</Text>
        <Ionicons name="arrow-forward" size={20} color="#1A2840" />
      </TouchableOpacity>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>{t('localExchange.scanTitle', 'Scan Receiver QR')}</Text>
      <Text style={styles.subtitle}>
        {t('localExchange.scanSubtitle', 'Ask the receiver to show their DizzitUp QR Code.')}
      </Text>

      <View style={styles.scannerPlaceholder}>
        <Ionicons name="qr-code-outline" size={80} color="#94A3B8" />
        <Text style={styles.scannerText}>Camera View Placeholder</Text>
        
        {/* Decorative corner markers */}
        <View style={[styles.cornerMarker, styles.topLeft]} />
        <View style={[styles.cornerMarker, styles.topRight]} />
        <View style={[styles.cornerMarker, styles.bottomLeft]} />
        <View style={[styles.cornerMarker, styles.bottomRight]} />
      </View>

      <TouchableOpacity style={styles.btnSecondary} onPress={() => setStep(3)}>
        <Text style={styles.btnSecondaryText}>[Simulate Successful Scan]</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>{t('localExchange.confirmTitle', 'Confirm Exchange')}</Text>
      <Text style={styles.subtitle}>
        {t('localExchange.confirmSubtitle', 'Review the details before validating.')}
      </Text>

      <View style={styles.card}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Receiver</Text>
          <Text style={styles.summaryValue}>John Doe (Verified)</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>You send</Text>
          <Text style={styles.summaryValueLarge}>{amount} {currency}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>You receive (Cash)</Text>
          <Text style={[styles.summaryValueLarge, { color: '#10B981' }]}>
            {parseFloat(amount || 0) * 600} FCFA
          </Text>
        </View>
      </View>

      <View style={styles.infoBanner}>
        <Ionicons name="information-circle-outline" size={20} color="#3B82F6" />
        <Text style={styles.infoText}>
          Make sure you have received the cash before validating this transaction.
        </Text>
      </View>

      <TouchableOpacity style={[styles.btnPrimary, { marginTop: 'auto', backgroundColor: '#10B981' }]} onPress={handleNext}>
        <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
        <Text style={[styles.btnPrimaryText, { color: '#FFFFFF' }]}>{t('common.validate', 'Validate Exchange')}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep4 = () => (
    <View style={[styles.stepContainer, { justifyContent: 'center', alignItems: 'center' }]}>
      <View style={styles.successCircle}>
        <Ionicons name="checkmark" size={60} color="#FFFFFF" />
      </View>
      <Text style={styles.successTitle}>Transaction Successful</Text>
      <Text style={styles.successSubtitle}>
        You have successfully exchanged {amount} {currency} for cash.
      </Text>

      <View style={[styles.card, { width: '100%', marginTop: 24 }]}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Transaction ID</Text>
          <Text style={styles.summaryValue}>#DZY-928374</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Date</Text>
          <Text style={styles.summaryValue}>{new Date().toLocaleDateString()}</Text>
        </View>
      </View>

      <TouchableOpacity style={[styles.btnPrimary, { marginTop: 40, width: '100%' }]} onPress={() => navigation.navigate('HomeScreen')}>
        <Text style={styles.btnPrimaryText}>Return to Home</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconBtn} onPress={handleBack}>
            {step === 4 ? (
              <Ionicons name="close" size={24} color="#1A2840" />
            ) : (
              <Ionicons name="chevron-back" size={24} color="#1A2840" />
            )}
          </TouchableOpacity>
          <Text style={styles.pageTitle}>Scan & Cash</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
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
  container: { flex: 1 },
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
    alignItems: 'flex-start',
  },
  pageTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: '#1A2840',
  },
  scrollView: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
    flexGrow: 1,
  },
  stepContainer: { flex: 1 },
  title: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 24,
    color: '#1A2840',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 24,
  },
  label: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#1A2840',
    marginBottom: 12,
  },
  currencyRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  currencyChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  currencyChipActive: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FFB800',
  },
  currencyChipText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: '#64748B',
  },
  currencyChipTextActive: {
    color: '#D97706',
    fontFamily: 'Inter_600SemiBold',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    height: 56,
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 24,
    color: '#1A2840',
  },
  inputCurrency: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#94A3B8',
  },
  btnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFB800',
    paddingVertical: 16,
    borderRadius: 16,
  },
  btnPrimaryText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: '#1A2840',
    marginRight: 8,
  },
  scannerPlaceholder: {
    height: 300,
    backgroundColor: '#F1F5F9',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  scannerText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 16,
  },
  cornerMarker: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#3B82F6',
  },
  topLeft: { top: 20, left: 20, borderTopWidth: 4, borderLeftWidth: 4 },
  topRight: { top: 20, right: 20, borderTopWidth: 4, borderRightWidth: 4 },
  bottomLeft: { bottom: 20, left: 20, borderBottomWidth: 4, borderLeftWidth: 4 },
  bottomRight: { bottom: 20, right: 20, borderBottomWidth: 4, borderRightWidth: 4 },
  btnSecondary: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  btnSecondaryText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#3B82F6',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  summaryLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#64748B',
  },
  summaryValue: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#1A2840',
  },
  summaryValueLarge: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 18,
    color: '#1A2840',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    alignItems: 'center',
  },
  infoText: {
    flex: 1,
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: '#1E3A8A',
    marginLeft: 12,
    lineHeight: 18,
  },
  successCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 24,
    color: '#1A2840',
    marginBottom: 8,
  },
  successSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  }
});
