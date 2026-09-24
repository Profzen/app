import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNavBar from '../components/BottomNavBar';
import AppSelect from '../components/AppSelect';
import CryptoIcon from '../components/CryptoIcon';
import { useApp } from '../context/AppContext';

import { getPaymentRailEligibility, COUNTRY_METADATA, ALL_MOMO_CORRIDORS } from '../services/paymentCorridorService';

const countryOptions = [
  { value: '+229', label: '🇧🇯  +229', subtitle: 'Bénin', flag: '🇧🇯', code: 'BJ' },
  { value: '+228', label: '🇹🇬  +228', subtitle: 'Togo', flag: '🇹🇬', code: 'TG' },
  { value: '+261', label: '🇲🇬  +261', subtitle: 'Madagascar', flag: '🇲🇬', code: 'MG' },
  { value: '+225', label: '🇨🇮  +225', subtitle: 'Côte d\'Ivoire', flag: '🇨🇮', code: 'CI' },
  { value: '+221', label: '🇸🇳  +221', subtitle: 'Sénégal', flag: '🇸🇳', code: 'SN' },
  { value: '+237', label: '🇨🇲  +237', subtitle: 'Cameroun', flag: '🇨🇲', code: 'CM' },
  { value: '+233', label: '🇬🇭  +233', subtitle: 'Ghana', flag: '🇬🇭', code: 'GH' },
  { value: '+254', label: '🇰🇪  +254', subtitle: 'Kenya', flag: '🇰🇪', code: 'KE' },
  { value: '+234', label: '🇳🇬  +234', subtitle: 'Nigeria', flag: '🇳🇬', code: 'NG' },
  { value: '+226', label: '🇧🇫  +226', subtitle: 'Burkina Faso', flag: '🇧🇫', code: 'BF' },
  { value: '+223', label: '🇲🇱  +223', subtitle: 'Mali', flag: '🇲🇱', code: 'ML' },
  { value: '+227', label: '🇳🇪  +227', subtitle: 'Niger', flag: '🇳🇪', code: 'NE' },
  { value: '+241', label: '🇬🇦  +241', subtitle: 'Gabon', flag: '🇬🇦', code: 'GA' },
  { value: '+243', label: '🇨🇩  +243', subtitle: 'RD Congo', flag: '🇨🇩', code: 'CD' },
  { value: '+250', label: '🇷🇼  +250', subtitle: 'Rwanda', flag: '🇷🇼', code: 'RW' },
  { value: '+256', label: '🇺🇬  +256', subtitle: 'Ouganda', flag: '🇺🇬', code: 'UG' },
  { value: '+260', label: '🇿🇲  +260', subtitle: 'Zambie', flag: '🇿🇲', code: 'ZM' },
  { value: '+255', label: '🇹🇿  +255', subtitle: 'Tanzanie', flag: '🇹🇿', code: 'TZ' },
];

const operatorOptionsByCountry = {
  BJ: [
    { value: 'mtn', label: 'MTN Mobile Money', subtitle: 'Recommandé' },
    { value: 'moov', label: 'Moov Money', subtitle: 'Disponible' },
    { value: 'celtiis', label: 'Celtiis Cash', subtitle: 'Disponible' },
  ],
  TG: [
    { value: 'mixx', label: 'Mixx by Yas (T-Money)', subtitle: 'Recommandé' },
    { value: 'moov', label: 'Moov Money (Flooz)', subtitle: 'Disponible' },
  ],
  MG: [
    { value: 'mvola', label: 'MVola (Telma)', subtitle: 'Recommandé' },
    { value: 'orange', label: 'Orange Money Madagascar', subtitle: 'Disponible' },
    { value: 'airtel', label: 'Airtel Money Madagascar', subtitle: 'Disponible' },
  ],
  CI: [
    { value: 'wave', label: 'Wave Côte d\'Ivoire', subtitle: 'Recommandé' },
    { value: 'orange', label: 'Orange Money', subtitle: 'Disponible' },
    { value: 'mtn', label: 'MTN Mobile Money', subtitle: 'Disponible' },
    { value: 'moov', label: 'Moov Money', subtitle: 'Disponible' },
  ],
  SN: [
    { value: 'wave', label: 'Wave Sénégal', subtitle: 'Recommandé' },
    { value: 'orange', label: 'Orange Money', subtitle: 'Disponible' },
    { value: 'free', label: 'Free Money', subtitle: 'Disponible' },
  ],
  CM: [
    { value: 'mtn', label: 'MTN Mobile Money Cameroun', subtitle: 'Recommandé' },
    { value: 'orange', label: 'Orange Money Cameroun', subtitle: 'Disponible' },
  ],
  KE: [
    { value: 'mpesa', label: 'Safaricom M-Pesa', subtitle: 'Recommandé' },
    { value: 'airtel', label: 'Airtel Money Kenya', subtitle: 'Disponible' },
  ],
  GH: [
    { value: 'mtn', label: 'MTN Mobile Money Ghana', subtitle: 'Recommandé' },
    { value: 'telecel', label: 'Telecel Cash', subtitle: 'Disponible' },
    { value: 'airteltigo', label: 'AirtelTigo Money', subtitle: 'Disponible' },
  ],
  default: [
    { value: 'mtn', label: 'MTN Mobile Money', subtitle: 'Disponible' },
    { value: 'orange', label: 'Orange Money', subtitle: 'Disponible' },
    { value: 'moov', label: 'Moov Money', subtitle: 'Disponible' },
    { value: 'airtel', label: 'Airtel Money', subtitle: 'Disponible' },
    { value: 'wave', label: 'Wave', subtitle: 'Disponible' },
    { value: 'mpesa', label: 'M-Pesa', subtitle: 'Disponible' },
  ],
};

const tokenOptions = [
  { value: 'USDC', label: 'USDC (USD Coin)', subtitle: 'Stablecoin 1:1 USD' },
  { value: 'USDT', label: 'USDT (Tether)', subtitle: 'Stablecoin 1:1 USD' },
  { value: 'EURC', label: 'EURC (Euro Coin)', subtitle: 'Stablecoin 1:1 EUR' },
  { value: 'DZY', label: 'DZY (DizzitUp Token)', subtitle: 'Token écosystème' },
];

export default function TopUpDetailsScreen({ route }) {
  const navigation = useNavigation();
  const { t, userCountry, language } = useApp();

  const passedCountry = route?.params?.country;
  const isUserCountrySupported = ALL_MOMO_CORRIDORS.includes((userCountry || '').toUpperCase());
  
  const initialCountry = countryOptions.find(
    c => c.code === (passedCountry || (isUserCountrySupported ? userCountry : 'BJ')).toUpperCase()
  ) || countryOptions[0];

  const [selectedCountry, setSelectedCountry] = useState(initialCountry);
  const [phone, setPhone] = useState('90 12 34 56');
  const [operator, setOperator] = useState(() => {
    const ops = operatorOptionsByCountry[initialCountry.code] || operatorOptionsByCountry.default;
    return ops[0].value;
  });
  const [amount, setAmount] = useState('10');
  const [token, setToken] = useState('USDC');

  const currentOperators = operatorOptionsByCountry[selectedCountry.code] || operatorOptionsByCountry.default;
  const activeOperatorObj = currentOperators.find(o => o.value === operator) || currentOperators[0];

  const userCountryMeta = COUNTRY_METADATA[(userCountry || 'DZ').toUpperCase()] || {
    name: userCountry || 'International',
    nameEn: userCountry || 'International',
    flag: '🌍',
  };
  const localizedUserCountryName = language === 'en' ? (userCountryMeta.nameEn || userCountryMeta.name) : userCountryMeta.name;

  const handleCountryChange = (val, opt) => {
    setSelectedCountry(opt);
    const newOps = operatorOptionsByCountry[opt.code] || operatorOptionsByCountry.default;
    setOperator(newOps[0].value);
  };

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
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('AskAminataScreen')}>
            <Ionicons name="help-circle-outline" size={24} color="#1A2840" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Titles */}
          <Text style={styles.mainSubtitle}>
            {t('topup.enter_info_desc', 'Enter the information to complete your top-up via Mobile Money.')}
          </Text>

          {/* Corridor info notice if user's detected country does not have native MoMo rails */}
          {!isUserCountrySupported && (
            <View style={styles.corridorNotice}>
              <Ionicons name="information-circle" size={22} color="#0284C7" style={{ marginRight: 10, marginTop: 2 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.corridorNoticeTitle}>
                  {language === 'en' 
                    ? `Mobile Money Corridors` 
                    : `Corridors Mobile Money Partenaires`}
                </Text>
                <Text style={styles.corridorNoticeDesc}>
                  {language === 'en'
                    ? `Local Mobile Money is not operating in ${localizedUserCountryName}. You can recharge a number in any supported partner corridor (Benin, Togo, Madagascar, Senegal...) or top up instantly via Card/Crypto.`
                    : `Le Mobile Money local n'opère pas en ${localizedUserCountryName}. Vous pouvez recharger une SIM dans un pays partenaire ci-dessous (Bénin, Togo, Madagascar, Sénégal...) ou utiliser la Carte Bancaire / Crypto.`}
                </Text>
                <TouchableOpacity 
                  style={styles.corridorNoticeBtn}
                  onPress={() => navigation.navigate('TopUpScreen')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.corridorNoticeBtnText}>
                    {language === 'en' ? '💳 Pay with Card or Crypto instead' : '💳 Payer par Carte ou Crypto plutôt'}
                  </Text>
                  <Ionicons name="arrow-forward" size={14} color="#0369A1" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Form: Numéro Mobile Money */}
          <View style={styles.formGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>{t('topup.momo_number', 'MOBILE MONEY NUMBER')}</Text>
            </View>
            
            <View style={styles.inputContainer}>
              <AppSelect
                value={selectedCountry.value}
                options={countryOptions}
                onChange={handleCountryChange}
                title={t('topup.select_country', 'Sélectionner le pays')}
                renderCustomTrigger={({ setOpen }) => (
                  <TouchableOpacity style={styles.countrySelector} onPress={() => setOpen(true)} activeOpacity={0.7}>
                    <Text style={styles.countryFlag}>{selectedCountry.flag}</Text>
                    <Text style={styles.countryCodeText}>{selectedCountry.value}</Text>
                    <Ionicons name="chevron-down" size={14} color="#1A2840" style={{ marginLeft: 4 }} />
                  </TouchableOpacity>
                )}
              />
              
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
            
            <AppSelect
              value={operator}
              options={currentOperators}
              onChange={(val) => setOperator(val)}
              title={t('topup.select_operator', 'Sélectionner un opérateur')}
              renderCustomTrigger={({ setOpen }) => (
                <TouchableOpacity style={styles.dropdownContainer} onPress={() => setOpen(true)} activeOpacity={0.7}>
                  <View style={styles.operatorLogoMock}>
                    <Ionicons name="cellular" size={16} color="#FFF" />
                  </View>
                  <Text style={styles.dropdownText}>{activeOperatorObj?.label || 'Opérateur'}</Text>
                  <Ionicons name="chevron-down" size={20} color="#1A2840" />
                </TouchableOpacity>
              )}
            />
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
              
              <Text style={styles.equivText}>
                {(() => {
                  const val = parseFloat(amount) || 0;
                  switch (selectedCountry.code) {
                    case 'MG':
                      return `≈ ${Math.round(val * 4600).toLocaleString()} MGA`;
                    case 'CM':
                    case 'GA':
                    case 'CD':
                      return `≈ ${Math.round(val * 610).toLocaleString()} XAF`;
                    case 'KE':
                      return `≈ ${Math.round(val * 130).toLocaleString()} KES`;
                    case 'GH':
                      return `≈ ${Math.round(val * 15.5).toLocaleString()} GHS`;
                    case 'NG':
                      return `≈ ${Math.round(val * 1500).toLocaleString()} NGN`;
                    default:
                      return `≈ ${Math.round(val * 605).toLocaleString()} XOF`;
                  }
                })()}
              </Text>
            </View>
            
            <View style={[styles.formGroup, {flex: 1, marginLeft: 8}]}>
              <Text style={styles.label}>{t('topup.token_to_buy', 'TOKEN TO BUY')}</Text>
              
              <AppSelect
                value={token}
                options={tokenOptions}
                onChange={(val) => setToken(val)}
                title={t('topup.select_token', 'Sélectionner le token')}
                renderCustomTrigger={({ setOpen }) => (
                  <TouchableOpacity style={styles.dropdownContainer} onPress={() => setOpen(true)} activeOpacity={0.7}>
                    <CryptoIcon symbol={token} size={24} style={{marginRight: 8}} />
                    <Text style={styles.dropdownText}>{token}</Text>
                    <Ionicons name="chevron-down" size={20} color="#1A2840" />
                  </TouchableOpacity>
                )}
              />
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
              countryCode: selectedCountry.value,
              country: selectedCountry.code,
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
  corridorNotice: {
    flexDirection: 'row',
    backgroundColor: '#F0F9FF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  corridorNoticeTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#0369A1',
    marginBottom: 4,
  },
  corridorNoticeDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#334155',
    lineHeight: 19,
    marginBottom: 10,
  },
  corridorNoticeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#E0F2FE',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  corridorNoticeBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#0369A1',
    marginRight: 6,
  },
});
