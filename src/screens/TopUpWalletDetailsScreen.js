import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNavBar from '../components/BottomNavBar';

export default function TopUpWalletDetailsScreen() {
  const navigation = useNavigation();
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
                value="4242 4242 4242 4242"
                keyboardType="numeric"
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
                />
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
                value="Jean Dupont"
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
            <TouchableOpacity style={styles.dropdownContainer}>
              <View style={styles.dropdownLeft}>
                <View style={styles.tokenIconCircle}>
                  <Text style={{color: '#FFF', fontSize: 10, fontWeight: 'bold'}}>USDC</Text>
                </View>
                <Text style={styles.dropdownText}>USDC</Text>
              </View>
              <Ionicons name="chevron-down" size={20} color="#1A2840" />
            </TouchableOpacity>
          </View>

          {/* Form: Réseau de transaction */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>RÉSEAU DE TRANSACTION</Text>
            <TouchableOpacity style={styles.dropdownContainer}>
              <View style={styles.dropdownLeft}>
                <View style={styles.networkIconCircle}>
                  <Text style={{color: '#FFF', fontSize: 12, fontWeight: 'bold'}}>b</Text>
                </View>
                <Text style={styles.dropdownText}>Réseau principal de base</Text>
              </View>
              <View style={styles.dropdownRight}>
                <View style={styles.recommendedBadge}>
                  <Text style={styles.recommendedText}>Recommandé</Text>
                </View>
                <Ionicons name="chevron-down" size={20} color="#1A2840" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Continue Button */}
          <TouchableOpacity style={styles.btnContinue} onPress={() => navigation.navigate('TopUpWalletPaymentScreen')}>
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
  },
  input: {
    flex: 1,
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: '#1A2840',
    letterSpacing: 1,
  },
  inputRegular: {
    flex: 1,
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    color: '#1A2840',
  },
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
});
