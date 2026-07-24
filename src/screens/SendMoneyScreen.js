import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, TextInput, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppSelect from '../components/AppSelect';

const sendCurrencies = [
  { value: 'Ar', label: 'Ar', name: 'Ariary malgache' },
  { value: 'XOF', label: 'XOF', name: 'Franc CFA' },
  { value: 'GHS', label: 'GHS', name: 'Cedi ghanéen' },
  { value: 'NGN', label: 'NGN', name: 'Naira nigérian' },
  { value: 'USDC', label: 'USDC', name: 'USD Coin' },
];

export default function SendMoneyScreen() {
  const navigation = useNavigation();
  const [amount, setAmount] = useState('4 000');
  const [currency, setCurrency] = useState('Ar');

  const selectedCurrency = sendCurrencies.find((item) => item.value === currency) || sendCurrencies[0];

  const handleKeyPress = (key) => {
    if (key === 'backspace') {
      if (amount.length > 0) {
        const raw = amount.replace(/\s/g, '').slice(0, -1);
        if (!raw) {
          setAmount('0');
        } else {
          setAmount(raw.replace(/\B(?=(\d{3})+(?!\d))/g, ' '));
        }
      }
    } else if (key === ',') {
      if (!amount.includes(',')) {
        setAmount(amount + ',');
      }
    } else {
      const raw = (amount === '0' ? '' : amount.replace(/\s/g, '')) + key;
      if (raw.length <= 8) {
        setAmount(raw.replace(/\B(?=(\d{3})+(?!\d))/g, ' '));
      }
    }
  };

  const KeyButton = ({ num, chars, isAction, icon, onPress }) => (
    <TouchableOpacity 
      style={[styles.keyBtn, isAction && styles.keyBtnAction]} 
      onPress={() => onPress ? onPress() : handleKeyPress(num)}
      activeOpacity={0.7}
    >
      {icon ? (
        <Ionicons name={icon} size={22} color={isAction ? '#1A2840' : '#1A2840'} />
      ) : (
        <>
          <Text style={styles.keyNum}>{num}</Text>
          {chars ? <Text style={styles.keyChars}>{chars}</Text> : <View style={{ height: 10 }} />}
        </>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#1A2840" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Envoyer de l'argent</Text>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="ellipsis-horizontal" size={20} color="#1A2840" />
          </TouchableOpacity>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Stepper (Step 1 Active) */}
          <View style={styles.stepperContainer}>
            <View style={styles.stepItem}>
              <View style={[styles.stepCircle, styles.stepCircleActive]}>
                <Text style={styles.stepNumActive}>1</Text>
              </View>
              <Text style={styles.stepTextActive}>Montant</Text>
            </View>
            
            <View style={styles.stepLineTrack}>
              <View style={styles.stepLineActive} />
            </View>
            
            <View style={styles.stepItem}>
              <View style={styles.stepCircle}>
                <Text style={styles.stepNum}>2</Text>
              </View>
              <Text style={styles.stepText}>Méthode</Text>
            </View>
          </View>

          {/* Title */}
          <Text style={styles.pageTitle}>Quel montant souhaitez-vous envoyer ?</Text>

          {/* Amount Card */}
          <View style={styles.amountCard}>
            <View style={styles.currencyRow}>
              <AppSelect 
                value={currency} 
                options={sendCurrencies} 
                onChange={(val) => setCurrency(val)} 
                title="Choisir la devise" 
                style={styles.currencySelector} 
                textStyle={styles.currencyCode} 
              />
              <Text style={styles.currencyName}>{selectedCurrency.name}</Text>
            </View>
            
            <View style={styles.amountDisplay}>
              <Text style={styles.amountValue}>{amount}</Text>
              <Text style={styles.amountSymbol}> {currency}</Text>
            </View>
            
            <View style={styles.conversionInfo}>
              <Text style={styles.conversionText}>≈ 1,03 DZ</Text>
              <Ionicons name="information-circle-outline" size={14} color="#6B7280" style={{ marginLeft: 4 }} />
            </View>
          </View>

          {/* Convert Button */}
          <View style={styles.convertBtnWrapper}>
            <TouchableOpacity style={styles.convertBtn} activeOpacity={0.8}>
              <Ionicons name="swap-horizontal" size={16} color="#1A2840" style={{ marginRight: 6 }} />
              <Text style={styles.convertBtnText}>Convertir</Text>
            </TouchableOpacity>
          </View>

          <View style={{ flex: 1, minHeight: 16 }} />

          {/* Custom Keypad */}
          <View style={styles.keypad}>
            <View style={styles.keyRow}>
              <KeyButton num="1" chars=" " />
              <KeyButton num="2" chars="ABC" />
              <KeyButton num="3" chars="DEF" />
            </View>
            <View style={styles.keyRow}>
              <KeyButton num="4" chars="GHI" />
              <KeyButton num="5" chars="JKL" />
              <KeyButton num="6" chars="MNO" />
            </View>
            <View style={styles.keyRow}>
              <KeyButton num="7" chars="PQRS" />
              <KeyButton num="8" chars="TUV" />
              <KeyButton num="9" chars="WXYZ" />
            </View>
            <View style={styles.keyRow}>
              <KeyButton num="," chars=" " isAction={true} onPress={() => handleKeyPress(',')} />
              <KeyButton num="0" chars=" " />
              <KeyButton icon="backspace-outline" isAction={true} onPress={() => handleKeyPress('backspace')} />
            </View>
          </View>

        </ScrollView>

        {/* Footer Button */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.continueBtn} 
            onPress={() => navigation.navigate('SendMoneyMethodScreen', { amount, currency })}
            activeOpacity={0.88}
          >
            <Text style={styles.continueBtnText}>Continuer</Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 36 : 10,
    paddingBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    color: '#0F172A',
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    marginTop: 16,
    marginBottom: 28,
  },
  stepItem: {
    alignItems: 'center',
    width: 60,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  stepCircleActive: {
    backgroundColor: '#FFC759',
  },
  stepNum: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#94A3B8',
  },
  stepNumActive: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    color: '#1A2840',
  },
  stepText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#94A3B8',
  },
  stepTextActive: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: '#1A2840',
  },
  stepLineTrack: {
    flex: 1,
    height: 3,
    backgroundColor: '#F1F5F9',
    marginHorizontal: -10,
    marginTop: -18,
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  stepLineActive: {
    width: '50%',
    height: '100%',
    backgroundColor: '#FFC759',
  },
  pageTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    color: '#1A2840',
    textAlign: 'center',
    marginHorizontal: 32,
    marginBottom: 24,
    lineHeight: 28,
  },
  amountCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
  },
  currencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  currencySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minHeight: 40,
  },
  currencyCode: {
    fontFamily: 'Inter_700Bold',
    fontSize: 15,
    color: '#1A2840',
  },
  currencyName: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#64748B',
  },
  amountDisplay: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'baseline',
    marginVertical: 12,
  },
  amountValue: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 54,
    color: '#0F172A',
    textAlign: 'center',
  },
  amountSymbol: {
    fontFamily: 'Inter_400Regular',
    fontSize: 24,
    color: '#94A3B8',
    marginLeft: 6,
  },
  conversionInfo: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  conversionText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#64748B',
  },
  convertBtnWrapper: {
    alignItems: 'center',
    marginTop: 16,
  },
  convertBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  convertBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#1A2840',
  },
  keypad: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  keyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  keyBtn: {
    width: '31%',
    aspectRatio: 1.8,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  keyBtnAction: {
    backgroundColor: '#F8FAFC',
  },
  keyNum: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 26,
    color: '#1A2840',
  },
  keyChars: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    color: '#94A3B8',
    marginTop: -2,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    paddingTop: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  continueBtn: {
    backgroundColor: '#FFC759',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#FFC759',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  continueBtnText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: '#1A2840',
  },
});
