import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNavBar from '../components/BottomNavBar';

export default function CashierSendFundsScreen() {
  const navigation = useNavigation();
  return (
    <SafeAreaView style={styles.safeArea}>
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#1A2840" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Caisse (TPE)</Text>
        <TouchableOpacity style={styles.iconBtn}>
          <Ionicons name="scan-outline" size={24} color="#1A2840" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Validation Banner */}
        <View style={styles.validationBanner}>
          <View style={styles.validationIconCircle}>
            <Ionicons name="information" size={20} color="#FFFFFF" />
          </View>
          <View style={styles.validationContent}>
            <Text style={styles.validationTitle}>Validation requise</Text>
            <Text style={styles.validationText}>Veuillez patienter, transaction en cours d'approbation...</Text>
          </View>
        </View>

        {/* Top-up Banner */}
        <TouchableOpacity style={styles.topUpBanner}>
          <View style={styles.topUpLeft}>
            <View style={styles.topUpIconCircle}>
              <Text style={styles.topUpIconText}>D</Text>
            </View>
            <View>
              <Text style={styles.topUpTitle}>Top-up your DZYwallet</Text>
              <Text style={styles.topUpLink}>+ Alimenter mon portefeuille</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#1A2840" />
        </TouchableOpacity>

        {/* Envoyer des fonds Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIconBox}>
              <Ionicons name="paper-plane-outline" size={20} color="#1A2840" />
            </View>
            <View>
              <Text style={styles.cardTitle}>Envoyer des fonds</Text>
              <View style={styles.secureBadge}>
                <View style={styles.secureDot} />
                <Text style={styles.secureText}>sécurisé</Text>
              </View>
            </View>
          </View>

          {/* Form */}
          <View style={styles.formGroup}>
            <Text style={styles.inputLabel}>SÉLECTIONNER LA BLOCKCHAIN</Text>
            <TouchableOpacity style={styles.dropdownInput}>
              <View style={styles.dropdownLeft}>
                <View style={[styles.tokenIconSmall, {backgroundColor: '#8B5CF6'}]}><Text style={styles.tokenIconTextSmall}>P</Text></View>
                <Text style={styles.dropdownText}>Polygon</Text>
              </View>
              <Ionicons name="chevron-down" size={20} color="#1A2840" />
            </TouchableOpacity>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.inputLabel}>JETON</Text>
            <TouchableOpacity style={styles.dropdownInput}>
              <View style={styles.dropdownLeft}>
                <View style={[styles.tokenIconSmall, {backgroundColor: '#3B82F6'}]}><Text style={styles.tokenIconTextSmall}>$</Text></View>
                <Text style={styles.dropdownText}>USDC</Text>
              </View>
              <Ionicons name="chevron-down" size={20} color="#1A2840" />
            </TouchableOpacity>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.inputLabel}>ADRESSE DU DESTINATAIRE</Text>
            <View style={styles.contactInput}>
              <View style={styles.contactIcon}>
                <Ionicons name="person" size={16} color="#3B82F6" />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>My Business</Text>
                <Text style={styles.contactAddress}>0x9f6b...6A81</Text>
              </View>
              <TouchableOpacity style={styles.clearBtn}>
                <Ionicons name="close" size={16} color="#1A2840" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.formGroup}>
            <View style={styles.amountLabelRow}>
              <Text style={styles.inputLabel}>MONTANT</Text>
              <Text style={styles.availableText}>Disponible : 8,3040 USDC</Text>
            </View>
            <View style={styles.amountInputContainerError}>
              <TextInput 
                style={styles.amountInputError}
                value="45"
                editable={false} // For mockup purposes
              />
              <Text style={styles.amountCurrency}>USDC</Text>
            </View>
          </View>

          {/* Error Banner */}
          <View style={styles.errorBanner}>
            <Ionicons name="warning-outline" size={20} color="#EF4444" style={{marginTop: 2, marginRight: 12}} />
            <View style={{flex: 1}}>
              <Text style={styles.errorTitle}>SOLDE INSUFFISANT</Text>
              <Text style={styles.errorText}>Vous n'avez pas assez de fonds pour effectuer cette transaction. Veuillez réduire le montant ou déposer plus de fonds.</Text>
            </View>
          </View>

          {/* Submit Button Disabled */}
          <TouchableOpacity style={styles.btnSubmitDisabled} activeOpacity={1}>
            <Ionicons name="paper-plane-outline" size={18} color="#FFFFFF" style={{marginRight: 8}} />
            <Text style={styles.btnSubmitDisabledText}>Envoyer USDC</Text>
          </TouchableOpacity>

        </View>

      </ScrollView>

      {/* Mock Numeric Keypad (to match mockup visual exactly) */}
      <View style={styles.keyboardContainer}>
        <View style={styles.keyRow}>
          <TouchableOpacity style={styles.key}><Text style={styles.keyMain}>1</Text></TouchableOpacity>
          <TouchableOpacity style={styles.key}>
            <Text style={styles.keyMain}>2</Text>
            <Text style={styles.keySub}>ABC</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.key}>
            <Text style={styles.keyMain}>3</Text>
            <Text style={styles.keySub}>DEF</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.keyRow}>
          <TouchableOpacity style={styles.key}>
            <Text style={styles.keyMain}>4</Text>
            <Text style={styles.keySub}>GHI</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.key}>
            <Text style={styles.keyMain}>5</Text>
            <Text style={styles.keySub}>JKL</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.key}>
            <Text style={styles.keyMain}>6</Text>
            <Text style={styles.keySub}>MNO</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.keyRow}>
          <TouchableOpacity style={styles.key}>
            <Text style={styles.keyMain}>7</Text>
            <Text style={styles.keySub}>PQRS</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.key}>
            <Text style={styles.keyMain}>8</Text>
            <Text style={styles.keySub}>TUV</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.key}>
            <Text style={styles.keyMain}>9</Text>
            <Text style={styles.keySub}>WXYZ</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.keyRow}>
          <TouchableOpacity style={styles.keyEmpty}><Text style={styles.keyMain}>,</Text></TouchableOpacity>
          <TouchableOpacity style={styles.key}><Text style={styles.keyMain}>0</Text></TouchableOpacity>
          <TouchableOpacity style={styles.keyEmpty}>
            <Ionicons name="backspace-outline" size={24} color="#1A2840" />
          </TouchableOpacity>
        </View>
      </View>
      
      <BottomNavBar activeTab="swap" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFAFA',
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
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    color: '#1A2840',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24, // no huge padding needed because keyboard overlays partially
  },
  validationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC', // very light gray/blue
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  validationIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1A2840',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  validationContent: {
    flex: 1,
  },
  validationTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    color: '#1A2840',
    marginBottom: 2,
  },
  validationText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#64748B',
  },
  topUpBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  topUpLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topUpIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0A1128', // Dark blue
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  topUpIconText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    color: '#FFB800',
  },
  topUpTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#1A2840',
    marginBottom: 2,
  },
  topUpLink: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#10B981',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  cardIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFB800',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: '#1A2840',
  },
  secureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  secureDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 4,
  },
  secureText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: '#10B981',
  },
  formGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    color: '#64748B',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  dropdownInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dropdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tokenIconSmall: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tokenIconTextSmall: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  dropdownText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#1A2840',
  },
  contactInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
  },
  contactIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#1A2840',
    marginBottom: 2,
  },
  contactAddress: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#64748B',
  },
  clearBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  amountLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  availableText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#F59E0B',
  },
  amountInputContainerError: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  amountInputError: {
    fontFamily: 'Inter_700Bold',
    fontSize: 24,
    color: '#EF4444',
    padding: 0,
    margin: 0,
  },
  amountCurrency: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#64748B',
  },
  errorBanner: {
    flexDirection: 'row',
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  errorTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: '#EF4444',
    marginBottom: 4,
  },
  errorText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#EF4444',
    lineHeight: 16,
  },
  btnSubmitDisabled: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#CBD5E1', // Grayed out
    borderRadius: 12,
    paddingVertical: 16,
  },
  btnSubmitDisabledText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  keyboardContainer: {
    backgroundColor: '#E2E8F0',
    paddingBottom: 24, // Extra space at bottom
  },
  keyRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 6,
    paddingTop: 6,
  },
  key: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginHorizontal: 4,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
  },
  keyEmpty: {
    flex: 1,
    backgroundColor: 'transparent',
    marginHorizontal: 4,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyMain: {
    fontFamily: 'Inter_500Medium',
    fontSize: 24,
    color: '#1A2840',
  },
  keySub: {
    fontFamily: 'Inter_700Bold',
    fontSize: 9,
    color: '#1A2840',
    marginTop: -2,
    letterSpacing: 1,
  },
});
