import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNavBar from '../components/BottomNavBar';
import AppSelect from '../components/AppSelect';
import CryptoIcon from '../components/CryptoIcon';

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
          <Text style={styles.pageTitle}>Recharger</Text>
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
          </View>

          {/* Titles */}
          <Text style={styles.mainTitle}>Entrez vos informations</Text>
          <Text style={styles.mainSubtitle}>
            Saisissez les informations pour effectuer{'\n'}votre recharge via Mobile Money.
          </Text>

          {/* Form: Numéro Mobile Money */}
          <View style={styles.formGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>NUMÉRO MOBILE MONEY</Text>
              <TouchableOpacity style={styles.modifierBtn}>
                <Ionicons name="pencil-outline" size={14} color="#3B82F6" style={{marginRight: 4}} />
                <Text style={styles.modifierText}>Modifier</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.inputContainer}>
              <AppSelect value={countryCode} options={countryOptions} onChange={setCountryCode} title="Choisir le pays" style={styles.countryInlineSelect} textStyle={styles.countryInlineText} />
              
              <View style={styles.verticalDivider} />
              
              <TextInput 
                style={styles.input}
                value={phone}
                onChangeText={formatPhone}
                keyboardType="phone-pad"
              />
              
              <TouchableOpacity style={styles.contactBtn}>
                <Ionicons name="person-outline" size={18} color="#1A2840" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.successMessageRow}>
              <Ionicons name="checkmark-circle" size={14} color="#10B981" style={{marginRight: 6}} />
              <Text style={styles.successMessageText}>Numéro de profil connecté et vérifié</Text>
            </View>
          </View>

          {/* Form: Opérateur Détecté */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>OPÉRATEUR DÉTECTÉ</Text>
            
            <AppSelect value={operator} options={operatorOptions} onChange={setOperator} title="Choisir l'opérateur" renderLeading={() => <View style={styles.operatorLogoMock}><Text style={{color: '#FFF', fontSize: 10, fontWeight: 'bold'}}>{operator}</Text></View>} />
          </View>

          {/* Form: Montant & Token */}
          <View style={styles.rowFormGroup}>
            <View style={[styles.formGroup, {flex: 1, marginRight: 8}]}>
              <View style={styles.labelRowLeft}>
                <Text style={styles.label}>MONTANT À PAYER</Text>
                <Ionicons name="information-circle-outline" size={14} color="#94A3B8" style={{marginLeft: 4, marginTop: 2}} />
              </View>
              
              <View style={styles.amountInputContainer}>
                <TextInput 
                  style={styles.amountInput}
                  value={amount}
                  onChangeText={(text) => setAmount(text.replace(/[^0-9.,]/g, '').replace(',', '.').slice(0, 10))}
                  keyboardType="numeric"
                />
                <Text style={styles.currencyText}>USD</Text>
              </View>
              
              <Text style={styles.equivText}>≈ 6 500 XOF</Text>
            </View>
            
            <View style={[styles.formGroup, {flex: 1, marginLeft: 8}]}>
              <Text style={styles.label}>TOKEN À ACHETER</Text>
              
              <AppSelect value={token} options={tokenOptions} onChange={setToken} title="Choisir le token" renderLeading={(option) => <CryptoIcon symbol={option.value} size={26} style={{marginRight: 8}} />} />
            </View>
          </View>

          {/* Security Banner */}
          <View style={styles.securityBanner}>
            <View style={styles.shieldContainer}>
              <Ionicons name="shield-half" size={32} color="#FFB800" />
            </View>
            <View style={styles.securityContent}>
              <Text style={styles.securityTitle}>Paiements sécurisés et instantanés</Text>
              <Text style={styles.securityDesc}>
                Aucune carte bancaire requise. Vos fonds sont{'\n'}protégés par un chiffrement de niveau bancaire.
              </Text>
            </View>
          </View>

          {/* Continue Button */}
          <TouchableOpacity style={styles.btnContinue} onPress={() => navigation.navigate('TopUpSummaryScreen')}>
            <Text style={styles.btnContinueText}>Continuer</Text>
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
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
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
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginBottom: 32,
    paddingHorizontal: 10,
  },
  stepWrapper: {
    alignItems: 'center',
    width: 60,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
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
    fontSize: 14,
    color: '#94A3B8',
  },
  stepNumberActive: {
    color: '#FFB800',
  },
  stepText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
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
    marginTop: 15,
    marginHorizontal: 4,
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
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  formGroup: {
    marginBottom: 24,
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
    color: '#64748B',
  },
  modifierBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modifierText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#3B82F6',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 12,
    height: 56,
  },
  countryCodeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  flagText: {
    fontSize: 18,
    marginRight: 6,
  },
  countryCodeText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    color: '#1A2840',
    marginRight: 4,
  },
  verticalDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8F0',
    marginRight: 12,
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
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successMessageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  successMessageText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: '#10B981',
  },
  operatorDropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 12,
  },
  operatorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  operatorLogoMock: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#0033A0', // Mixx blue
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  operatorName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: '#1A2840',
  },
  operatorRight: {
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
  rowFormGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  amountInput: {
    flex: 1,
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    color: '#1A2840',
    outlineStyle: 'none',
  },
  countryInlineSelect: { width: 118, minHeight: 52, borderWidth: 0, paddingHorizontal: 0, backgroundColor: 'transparent' },
  countryInlineText: { fontSize: 13 },
  currencyText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#64748B',
  },
  equivText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 8,
  },
  tokenDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  tokenLeft: {
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
    marginRight: 8,
  },
  tokenName: {
    fontFamily: 'Inter_700Bold',
    fontSize: 15,
    color: '#1A2840',
  },
  securityBanner: {
    flexDirection: 'row',
    backgroundColor: '#FFFBEB', // light yellow
    borderWidth: 1,
    borderColor: '#FEF3C7',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  shieldContainer: {
    marginRight: 12,
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
    color: '#1A2840',
    lineHeight: 18,
  },
  btnContinue: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFB800',
    paddingVertical: 18,
    borderRadius: 16,
  },
  btnContinueText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: '#1A2840',
    marginRight: 8,
  },
});
