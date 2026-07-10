import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SendMoneyMethodScreen() {
  const navigation = useNavigation();
  const [selectedMethod, setSelectedMethod] = useState('dizzy');

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1A2840" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Ionicons name="arrow-redo" size={20} color="#1A2840" style={styles.headerIcon} />
            <Text style={styles.headerTitle}>Envoyer de l'argent</Text>
          </View>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="ellipsis-horizontal" size={20} color="#1A2840" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <Text style={styles.pageTitle}>Méthode</Text>
          <Text style={styles.pageSubtitle}>Comment souhaitez-vous envoyer l'argent ?</Text>

          {/* Stepper */}
          <View style={styles.stepperContainer}>
            <View style={styles.stepItem}>
              <View style={[styles.stepCircle, styles.stepCircleActive]}>
                <Text style={styles.stepNumActive}>1</Text>
              </View>
              <Text style={styles.stepText}>Montant</Text>
            </View>
            
            <View style={styles.stepLine}>
              <View style={styles.stepLineActive} />
            </View>
            
            <View style={styles.stepItem}>
              <View style={[styles.stepCircle, styles.stepCircleActive]}>
                <Text style={styles.stepNumActive}>2</Text>
              </View>
              <Text style={styles.stepTextActive}>Méthode</Text>
            </View>
          </View>

          {/* Methods List */}
          <View style={styles.methodsContainer}>
            
            {/* Dizzy Method */}
            <TouchableOpacity 
              style={[styles.methodCard, selectedMethod === 'dizzy' && styles.methodCardActive]}
              onPress={() => setSelectedMethod('dizzy')}
              activeOpacity={0.8}
            >
              <View style={styles.methodIconWrapper}>
                <Image source={require('../../dizzitup logo cercle.png')} style={styles.dzyLogo} resizeMode="contain" />
              </View>
              
              <View style={styles.methodContent}>
                <Text style={styles.methodTitle}>Dizzy</Text>
                <Text style={styles.methodDesc}>Envoyer via mon portefeuille DIZY</Text>
              </View>

              <View style={styles.radioWrapper}>
                {selectedMethod === 'dizzy' ? (
                  <View style={styles.radioActive}>
                    <View style={styles.radioInner} />
                  </View>
                ) : (
                  <View style={styles.radioInactive} />
                )}
              </View>
            </TouchableOpacity>

            {/* Mobile Money Method */}
            <TouchableOpacity 
              style={[styles.methodCard, selectedMethod === 'mobile_money' && styles.methodCardActive]}
              onPress={() => setSelectedMethod('mobile_money')}
              activeOpacity={0.8}
            >
              <View style={styles.methodIconWrapperMM}>
                <Ionicons name="phone-portrait-outline" size={24} color="#1A2840" />
              </View>
              
              <View style={styles.methodContent}>
                <Text style={styles.methodTitle}>Mobile money</Text>
                <Text style={styles.methodDesc}>Envoyer vers un compte mobile money</Text>
              </View>

              <View style={styles.radioWrapper}>
                {selectedMethod === 'mobile_money' ? (
                  <View style={styles.radioActive}>
                    <View style={styles.radioInner} />
                  </View>
                ) : (
                  <View style={styles.radioInactive} />
                )}
              </View>
            </TouchableOpacity>

          </View>

          <View style={styles.spacer} />

          {/* Security Banner */}
          <View style={styles.securityBanner}>
            <View style={styles.securityIconWrapper}>
              <Ionicons name="shield-checkmark-outline" size={24} color="#1A2840" />
            </View>
            <View style={styles.securityContent}>
              <Text style={styles.securityTitle}>Vos transactions sont sécurisées</Text>
              <Text style={styles.securityDesc}>Nous protégeons vos fonds et vos informations à chaque étape.</Text>
            </View>
          </View>

        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.btnPrev}>
            <Text style={styles.btnPrevText}>Précédent</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnNext}>
            <Text style={styles.btnNextText}>Suivant</Text>
          </TouchableOpacity>
        </View>

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
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginRight: 8,
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 24,
    paddingBottom: 24,
  },
  pageTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 24,
    color: '#1A2840',
    textAlign: 'center',
    marginBottom: 8,
  },
  pageSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 32,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 60,
    marginBottom: 40,
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
    width: '100%',
    height: '100%',
    backgroundColor: '#FFC759',
    borderRadius: 1.5,
  },
  methodsContainer: {
    paddingHorizontal: 20,
    gap: 16,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  methodCardActive: {
    borderColor: '#FFC759',
  },
  methodIconWrapper: {
    width: 56,
    height: 56,
    marginRight: 16,
  },
  dzyLogo: {
    width: '100%',
    height: '100%',
  },
  methodIconWrapperMM: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  methodContent: {
    flex: 1,
  },
  methodTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: '#1A2840',
    marginBottom: 4,
  },
  methodDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#64748B',
  },
  radioWrapper: {
    marginLeft: 16,
  },
  radioInactive: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  radioActive: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#1A2840',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#1A2840',
  },
  spacer: {
    flex: 1,
    minHeight: 40,
  },
  securityBanner: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FE',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  securityIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  securityContent: {
    flex: 1,
  },
  securityTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#1A2840',
    marginBottom: 4,
  },
  securityDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 16,
    gap: 16,
  },
  btnPrev: {
    flex: 1,
    backgroundColor: '#8C94A3',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  btnPrevText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  btnNext: {
    flex: 1,
    backgroundColor: '#FFC759',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  btnNextText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#1A2840',
  },
});
