import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNavBar from '../components/BottomNavBar';
import AppSelect from '../components/AppSelect';
import CryptoIcon from '../components/CryptoIcon';
import { useApp } from '../context/AppContext';

const countryOptions = [
  { value: '+228', label: '🇹🇬  +228', subtitle: 'Togo' },
  { value: '+221', label: '🇸🇳  +221', subtitle: 'Sénégal' },
  { value: '+233', label: '🇬🇭  +233', subtitle: 'Ghana' },
  { value: '+234', label: '🇳🇬  +234', subtitle: 'Nigeria' },
];
const operatorOptions = [
  { value: 'mixx', label: 'Mixx by Yas', subtitle: 'Recommandé' },
  { value: 'mtn', label: 'MTN Mobile Money', subtitle: 'Disponible' },
  { value: 'moov', label: 'Moov Money', subtitle: 'Disponible' },
  { value: 'airtel', label: 'Airtel Money', subtitle: 'Disponible' },
];
const tokenOptions = ['USDC', 'USDT', 'EURC', 'DZY'].map((value) => ({ value, label: value }));

export default function TopUpDetailsScreen() {
  const navigation = useNavigation();
  const { t } = useApp();
  const [phone, setPhone] = useState('90 12 34 56');
  const [countryCode, setCountryCode] = useState('+228');
  const [operator, setOperator] = useState('mixx');
  const [amount, setAmount] = useState('10');
  const [token, setToken] = useState('USDC');
  const formatPhone = (text) => setPhone(text.replace(/\D/g, '').slice(0, 12).replace(/(.{2})/g, '$1 ').trim());
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
          
          {/* Titles */}
          <Text style={styles.mainSubtitle}>
            {t('topup.enter_info_desc', 'Enter the information to complete your top-up via Mobile Money.')}
          </Text>

          {/* Form: Numéro Mobile Money */}
          <View style={styles.formGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>{t('topup.momo_number', 'MOBILE MONEY NUMBER')}</Text>
              <TouchableOpacity style={styles.modifierBtn}>
                <Ionicons name="pencil-outline" size={14} color="#0052FF" style={{marginRight: 4}} />
                <Text style={styles.modifierText}>{t('topup.modify', 'Modify')}</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.inputContainer}>
              <TouchableOpacity style={styles.countrySelector}>
                <Text style={styles.countryFlag}>🇹🇬</Text>
                <Text style={styles.countryCodeText}>+228</Text>
                <Ionicons name="chevron-down" size={16} color="#1A2840" style={{marginLeft: 4}} />
              </TouchableOpacity>
              
              <View style={styles.verticalDivider} />
              
              <TextInput 
                style={styles.input}
                value={phone}
                onChangeText={formatPhone}
                keyboardType="phone-pad"
                placeholder="90 12 34 56"
                placeholderTextColor="#9CA3AF"
              />
              
              <TouchableOpacity style={styles.contactBtn}>
                <Ionicons name="person-outline" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.successMessageRow}>
              <Ionicons name="checkmark-circle" size={16} color="#10B981" style={{marginRight: 6}} />
              <Text style={styles.successMessageText}>{t('topup.profile_verified', 'Connected and verified profile number')}</Text>
            </View>
          </View>

          {/* Form: Opérateur Détecté */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>{t('topup.operator_detected', 'DETECTED OPERATOR')}</Text>
            
            <View style={styles.dropdownContainer}>
              <View style={styles.operatorLogoMock}>
                <Text style={{color: '#FFF', fontSize: 10, fontWeight: 'bold'}}>{operator}</Text>
              </View>
              <Text style={styles.dropdownText}>Mixx by Yas</Text>
              <Ionicons name="chevron-down" size={20} color="#1A2840" />
            </View>
          </View>

          {/* Form: Montant & Token */}
          <View style={styles.rowFormGroup}>
            <View style={[styles.formGroup, {flex: 1, marginRight: 8}]}>
              <View style={styles.labelRowLeft}>
                <Text style={styles.label}>{t('topup.amount_to_pay', 'AMOUNT TO PAY')}</Text>
                <Ionicons name="information-circle-outline" size={14} color="#94A3B8" style={{marginLeft: 6}} />
              </View>
              
              <View style={styles.amountInputContainer}>
                <TextInput 
                  style={styles.amountInput}
                  value={amount}
                  onChangeText={(text) => setAmount(text.replace(/[^0-9.,]/g, '').replace(',', '.').slice(0, 10))}
                  keyboardType="numeric"
                  placeholder="10"
                  placeholderTextColor="#9CA3AF"
                />
                <Text style={styles.currencyText}>USD</Text>
              </View>
              
              <Text style={styles.equivText}>≈ 6 500 XOF</Text>
            </View>
            
            <View style={[styles.formGroup, {flex: 1, marginLeft: 8}]}>
              <Text style={styles.label}>{t('topup.token_to_buy', 'TOKEN TO BUY')}</Text>
              
              <View style={styles.dropdownContainer}>
                <CryptoIcon symbol={token} size={24} style={{marginRight: 8}} />
                <Text style={styles.dropdownText}>{token}</Text>
                <Ionicons name="chevron-down" size={20} color="#1A2840" />
              </View>
            </View>
          </View>

          {/* Security Banner */}
          <View style={styles.securityBanner}>
            <View style={styles.shieldContainer}>
              <Ionicons name="shield-half" size={36} color="#F59E0B" />
            </View>
            <View style={styles.securityContent}>
              <Text style={styles.securityTitle}>{t('topup.secure_payments', 'Secure and instant payments')}</Text>
              <Text style={styles.securityDesc}>
                {t('topup.no_card_required', 'No credit card required. Your funds are protected by bank-grade encryption.')}
              </Text>
            </View>
          </View>

          {/* Continue Button */}
          <TouchableOpacity 
            style={styles.btnContinue} 
            onPress={() => navigation.navigate('TopUpSummaryScreen', {
              phone,
              countryCode,
              operator,
              amount,
              token,
              paymentMethod: 'momo'
            })}
          >
            <Text style={styles.btnContinueText}>{t('topup.continue')}</Text>
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
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },
  mainSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  labelRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#6B7280',
    letterSpacing: 0.5,
  },
  modifierBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modifierText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#0052FF',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    height: 56,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
  },
  countrySelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryFlag: {
    fontSize: 18,
    marginRight: 6,
  },
  countryCodeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#1A2840',
  },
  verticalDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 12,
  },
  input: {
    flex: 1,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#1A2840',
    outlineStyle: 'none',
  },
  contactBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  successMessageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  successMessageText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#10B981',
  },
  dropdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    height: 56,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
  },
  operatorLogoMock: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#1E3A8A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  dropdownText: {
    flex: 1,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#1A2840',
  },
  rowFormGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    height: 56,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
  },
  amountInput: {
    flex: 1,
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    color: '#1A2840',
    outlineStyle: 'none',
  },
  currencyText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#6B7280',
  },
  equivText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 6,
  },
  securityBanner: {
    flexDirection: 'row',
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  shieldContainer: {
    marginRight: 16,
    marginTop: 2,
  },
  securityContent: {
    flex: 1,
  },
  securityTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#1A2840',
    marginBottom: 4,
  },
  securityDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 20,
  },
  btnContinue: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFB800',
    height: 56,
    borderRadius: 16,
    marginBottom: 10,
  },
  btnContinueText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: '#1A2840',
    marginRight: 8,
  },
});
