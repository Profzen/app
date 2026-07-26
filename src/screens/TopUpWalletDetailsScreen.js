import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, TextInput, Modal, Pressable, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNavBar from '../components/BottomNavBar';
import AppSelect from '../components/AppSelect';
import CryptoIcon from '../components/CryptoIcon';

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
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholder, setCardholder] = useState('Jean Dupont');
  const [currency, setCurrency] = useState('USDC');
  const [network, setNetwork] = useState('base');
  const [expiryPickerOpen, setExpiryPickerOpen] = useState(false);
  const [pickerMonth, setPickerMonth] = useState('01');
  const [pickerYear, setPickerYear] = useState(String(new Date().getFullYear()).slice(-2));

  const updateCardNumber = (text) => setCardNumber(text.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim());
  const updateExpiry = (text) => {
    const digits = text.replace(/\D/g, '').slice(0, 4);
    setExpiry(digits.length > 2 ? `${digits.slice(0, 2)} / ${digits.slice(2)}` : digits);
  };
  const applyExpiry = () => { setExpiry(`${pickerMonth} / ${pickerYear}`); setExpiryPickerOpen(false); };
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
          
          {/* Progress Stepper (5 steps) */}
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
          <Text style={styles.mainTitle}>Détails de la carte</Text>
          <Text style={styles.mainSubtitle}>
            Saisissez les informations de votre carte{'\n'}pour effectuer votre recharge en toute sécurité.
          </Text>

          {/* Form: Numéro de carte */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>NUMÉRO DE CARTE</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="card-outline" size={20} color="#64748B" style={{marginRight: 12}} />
              <TextInput 
                style={styles.input}
                value={cardNumber}
                onChangeText={updateCardNumber}
                keyboardType="numeric"
                maxLength={19}
                selectTextOnFocus
              />
              <Text style={styles.visaText}>VISA</Text>
            </View>
          </View>

          {/* Form: Expiration & CVV */}
          <View style={styles.rowFormGroup}>
            <View style={[styles.formGroup, {flex: 1, marginRight: 8}]}>
              <Text style={styles.label}>DATE D'EXPIRATION</Text>
              <View style={styles.inputContainer}>
                <TextInput 
                  style={styles.inputRegular}
                  placeholder="MM / AA"
                  placeholderTextColor="#94A3B8"
                  value={expiry}
                  onChangeText={updateExpiry}
                  keyboardType="numeric"
                  maxLength={7}
                />
                <TouchableOpacity style={styles.expiryPickerButton} onPress={() => setExpiryPickerOpen(true)} accessibilityLabel="Choisir le mois et l'année">
                  <Ionicons name="calendar-outline" size={20} color="#3B82F6" />
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={[styles.formGroup, {flex: 1, marginLeft: 8}]}>
              <Text style={styles.label}>CVV</Text>
              <View style={styles.inputContainer}>
                <TextInput 
                  style={styles.inputRegular}
                  placeholder="•••"
                  placeholderTextColor="#1A2840"
                  secureTextEntry
                  value={cvv}
                  onChangeText={(text) => setCvv(text.replace(/\D/g, '').slice(0, 4))}
                  keyboardType="numeric"
                  maxLength={4}
                />
                <Ionicons name="information-circle-outline" size={20} color="#94A3B8" />
              </View>
            </View>
          </View>

          {/* Form: Nom sur la carte */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>NOM SUR LA CARTE</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color="#64748B" style={{marginRight: 12}} />
              <TextInput 
                style={styles.inputRegular}
                value={cardholder}
                onChangeText={setCardholder}
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* Security Banner Ecobank */}
          <View style={styles.ecobankBanner}>
            <View style={styles.ecoShieldContainer}>
              <Ionicons name="shield-checkmark" size={20} color="#FFFFFF" />
            </View>
            <View style={styles.ecoContent}>
              <Text style={styles.ecoTitle}>Secured payment by Ecobank</Text>
              <Text style={styles.ecoDesc}>
                Vos informations bancaires sont protégées{'\n'}et le paiement est sécurisé par Ecobank.
              </Text>
            </View>
          </View>

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

          {/* Continue Button */}
          <TouchableOpacity style={styles.btnContinue} onPress={() => navigation.navigate('TopUpWalletPaymentScreen')}>
            <Text style={styles.btnContinueText}>Continuer</Text>
            <Ionicons name="arrow-forward" size={20} color="#1A2840" />
          </TouchableOpacity>

        </ScrollView>

        <BottomNavBar />
        <Modal visible={expiryPickerOpen} transparent animationType="fade" onRequestClose={() => setExpiryPickerOpen(false)}>
          <View style={styles.pickerOverlay}>
            <Pressable style={StyleSheet.absoluteFill} onPress={() => setExpiryPickerOpen(false)} />
            <View style={styles.pickerCard}>
              <Text style={styles.pickerTitle}>Date d'expiration</Text>
              <Text style={styles.pickerHint}>Choisissez le mois et l'année</Text>
              <Text style={styles.pickerSectionTitle}>Mois</Text>
              <View style={styles.pickerGrid}>{Array.from({length: 12}, (_, i) => String(i + 1).padStart(2, '0')).map((month) => <TouchableOpacity key={month} style={[styles.pickerChoice, pickerMonth === month && styles.pickerChoiceActive]} onPress={() => setPickerMonth(month)}><Text style={[styles.pickerChoiceText, pickerMonth === month && styles.pickerChoiceTextActive]}>{month}</Text></TouchableOpacity>)}</View>
              <Text style={styles.pickerSectionTitle}>Année</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.yearRow}>{Array.from({length: 12}, (_, i) => String(new Date().getFullYear() + i).slice(-2)).map((year) => <TouchableOpacity key={year} style={[styles.yearChoice, pickerYear === year && styles.pickerChoiceActive]} onPress={() => setPickerYear(year)}><Text style={[styles.pickerChoiceText, pickerYear === year && styles.pickerChoiceTextActive]}>20{year}</Text></TouchableOpacity>)}</ScrollView>
              <TouchableOpacity style={styles.pickerApply} onPress={applyExpiry}><Text style={styles.pickerApplyText}>Utiliser {pickerMonth} / {pickerYear}</Text></TouchableOpacity>
            </View>
          </View>
        </Modal>
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
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginBottom: 32,
  },
  stepWrapper: {
    alignItems: 'center',
    width: 50,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  stepCircleActive: {
    borderColor: '#FFB800',
  },
  stepCircleCompleted: {
    borderColor: '#FFB800',
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
    borderColor: '#FFFFFF',
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
    backgroundColor: '#E2E8F0',
    marginTop: 13,
    marginHorizontal: 2,
  },
  stepLineActive: {
    backgroundColor: '#FFB800',
  },
  mainTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 22,
    color: '#1A2840',
    textAlign: 'center',
    marginBottom: 8,
  },
  mainSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 20,
    minWidth: 0,
  },
  rowFormGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#64748B',
    marginBottom: 8,
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
    minWidth: 0,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    minWidth: 0,
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: '#1A2840',
    letterSpacing: 1,
    outlineStyle: 'none',
  },
  inputRegular: {
    flex: 1,
    minWidth: 0,
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    color: '#1A2840',
    outlineStyle: 'none',
  },
  expiryPickerButton: { width: 36, height: 36, flexShrink: 0, borderRadius: 18, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center' },
  visaText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: '#1A1F71', // VISA blue
    fontStyle: 'italic',
  },
  ecobankBanner: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  ecoShieldContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  ecoContent: {
    flex: 1,
  },
  ecoTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    color: '#1A2840',
    marginBottom: 4,
  },
  ecoDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#1A2840',
    lineHeight: 18,
  },
  dropdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  dropdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tokenIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2775CA', // USDC blue
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  networkIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#0052FF', // Base blue
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  dropdownText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: '#1A2840',
  },
  dropdownRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recommendedBadge: {
    backgroundColor: '#DCFCE7', // light green
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 12,
  },
  recommendedText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#10B981',
  },
  btnContinue: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFB800',
    paddingVertical: 18,
    borderRadius: 16,
    marginTop: 16,
  },
  btnContinueText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: '#1A2840',
    marginRight: 8,
  },
  pickerOverlay: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: 'rgba(10,17,40,0.35)' },
  pickerCard: { backgroundColor: '#FFF', borderRadius: 22, padding: 20 },
  pickerTitle: { fontFamily: 'Inter_700Bold', fontSize: 19, color: '#1A2840' },
  pickerHint: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#64748B', marginTop: 4, marginBottom: 18 },
  pickerSectionTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#64748B', marginBottom: 8, marginTop: 8 },
  pickerGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  pickerChoice: { width: '15%', height: 38, borderRadius: 10, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  pickerChoiceActive: { backgroundColor: '#FFB800' },
  pickerChoiceText: { fontFamily: 'Inter_600SemiBold', color: '#1A2840', fontSize: 12 },
  pickerChoiceTextActive: { color: '#0A1128' },
  yearRow: { paddingBottom: 8 },
  yearChoice: { paddingHorizontal: 13, height: 38, borderRadius: 10, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  pickerApply: { marginTop: 14, height: 52, borderRadius: 14, backgroundColor: '#FFB800', alignItems: 'center', justifyContent: 'center' },
  pickerApplyText: { fontFamily: 'Inter_700Bold', fontSize: 15, color: '#1A2840' },
});
