import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SendMoneyScreen() {
  const navigation = useNavigation();
  const [amount, setAmount] = useState('4 000');

  const handleKeyPress = (key) => {
    if (key === 'backspace') {
      if (amount.length > 0) {
        setAmount(amount.slice(0, -1).trim());
      }
    } else {
      // Very basic formatting logic for UI mockup purposes
      const newAmount = amount.replace(/\s/g, '') + key;
      if (newAmount.length <= 7) {
        // Format with space as thousands separator
        const formatted = newAmount.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
        setAmount(formatted);
      }
    }
  };

  const KeyButton = ({ num, chars, isAction, icon, onPress }) => (
    <TouchableOpacity 
      style={[styles.keyBtn, isAction && styles.keyBtnAction]} 
      onPress={() => onPress ? onPress() : handleKeyPress(num)}
    >
      {icon ? (
        <Ionicons name={icon} size={24} color={isAction ? '#FFFFFF' : '#1A2840'} />
      ) : (
        <>
          <Text style={styles.keyNum}>{num}</Text>
          {chars ? <Text style={styles.keyChars}>{chars}</Text> : <View style={{height: 12}} />}
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

        <ScrollView style={{flex: 1}} contentContainerStyle={{flexGrow: 1, paddingBottom: 24}} showsVerticalScrollIndicator={false}>
        {/* Stepper */}
        <View style={styles.stepperContainer}>
          <View style={styles.stepItem}>
            <View style={[styles.stepCircle, styles.stepCircleActive]}>
              <Text style={styles.stepNumActive}>1</Text>
            </View>
            <Text style={styles.stepTextActive}>Montant</Text>
          </View>
          
          <View style={styles.stepLine}>
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
            <TouchableOpacity style={styles.currencySelector}>
              <Text style={styles.currencyCode}>Ar</Text>
              <Ionicons name="chevron-down" size={16} color="#1A2840" style={{marginLeft: 4}} />
            </TouchableOpacity>
            <Text style={styles.currencyName}>Ariary malgache</Text>
          </View>
          
          <View style={styles.amountDisplay}>
            <TextInput 
              style={styles.amountValue} 
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="#94A3B8"
            />
            <Text style={styles.amountSymbol}>Ar</Text>
          </View>
          
          <View style={styles.conversionInfo}>
            <Text style={styles.conversionText}>≈ 1,03 DZ</Text>
            <Ionicons name="information-circle-outline" size={14} color="#6B7280" style={{marginLeft: 4}} />
          </View>
        </View>

        {/* Convert Button */}
        <View style={styles.convertBtnWrapper}>
          <TouchableOpacity style={styles.convertBtn}>
            <Ionicons name="swap-horizontal" size={18} color="#1A2840" style={{marginRight: 6}} />
            <Text style={styles.convertBtnText}>Convertir</Text>
          </TouchableOpacity>
        </View>

        <View style={{flex: 1}} />

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
            <KeyButton num="," chars=" " isAction={true} style={{backgroundColor: '#F8FAFC'}} onPress={() => handleKeyPress(',')} />
            <KeyButton num="0" chars=" " />
            <KeyButton icon="backspace" isAction={true} style={{backgroundColor: '#1A2840'}} onPress={() => handleKeyPress('backspace')} />
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.continueBtn} onPress={() => navigation.navigate('SendMoneyMethodScreen')}>
            <Text style={styles.continueBtnText}>Continuer</Text>
          </TouchableOpacity>
        </View>
        </ScrollView>

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
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    marginTop: 20,
    marginBottom: 32,
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
    marginBottom: 8,
  },
  stepCircleActive: {
    backgroundColor: '#FFC759',
  },
  stepNum: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#94A3B8',
  },
  stepNumActive: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
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
  stepLine: {
    flex: 1,
    height: 3,
    backgroundColor: '#F1F5F9',
    marginHorizontal: -10,
    marginTop: -20, // adjust for step text
    borderRadius: 1.5,
  },
  stepLineActive: {
    width: '50%',
    height: '100%',
    backgroundColor: '#FFC759',
    borderRadius: 1.5,
  },
  pageTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    color: '#1A2840',
    textAlign: 'center',
    marginHorizontal: 32,
    marginBottom: 24,
  },
  amountCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 24,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
  },
  currencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  currencySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  currencyCode: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
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
    fontFamily: 'SpaceGrotesk_400Regular',
    fontSize: 64,
    color: '#0F172A',
    includeFontPadding: false,
  },
  amountSymbol: {
    fontFamily: 'Inter_400Regular',
    fontSize: 24,
    color: '#94A3B8',
    marginLeft: 8,
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
    marginTop: 20,
  },
  convertBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
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
    paddingBottom: 24,
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
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  keyBtnAction: {
    backgroundColor: '#F8FAFC', // For the comma
  },
  keyNum: {
    fontFamily: 'Inter_500Medium',
    fontSize: 28,
    color: '#1A2840',
  },
  keyChars: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    color: '#94A3B8',
    marginTop: -2,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  continueBtn: {
    backgroundColor: '#FFC759',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  continueBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#1A2840',
  },
});
