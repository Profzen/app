import React, { useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Image, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SendMoneyMethodScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const [selectedMethod, setSelectedMethod] = useState('dizzy');

  const { amount = '4 000', currency = 'Ar' } = route.params || {};

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#1A2840" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Ionicons name="paper-plane-outline" size={18} color="#1A2840" style={styles.headerIcon} />
            <Text style={styles.headerTitle}>Envoyer de l'argent</Text>
          </View>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="ellipsis-horizontal" size={20} color="#1A2840" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Stepper (Step 2 Active) */}
          <View style={styles.stepperContainer}>
            <View style={styles.stepItem}>
              <View style={[styles.stepCircle, styles.stepCircleActive]}>
                <Text style={styles.stepNumActive}>1</Text>
              </View>
              <Text style={styles.stepText}>Montant</Text>
            </View>
            
            <View style={styles.stepLineTrack}>
              <View style={styles.stepLineActive} />
            </View>
            
            <View style={styles.stepItem}>
              <View style={[styles.stepCircle, styles.stepCircleActive]}>
                <Text style={styles.stepNumActive}>2</Text>
              </View>
              <Text style={styles.stepTextActive}>Méthode</Text>
            </View>
          </View>

          <Text style={styles.pageTitle}>Méthode</Text>
          <Text style={styles.pageSubtitle}>Comment souhaitez-vous envoyer l'argent ?</Text>

          {/* Methods List */}
          <View style={styles.methodsContainer}>
            
            {/* Dizzy Method */}
            <TouchableOpacity 
              style={[styles.methodCard, selectedMethod === 'dizzy' && styles.methodCardActive]}
              onPress={() => setSelectedMethod('dizzy')}
              activeOpacity={0.85}
            >
              <View style={styles.methodIconWrapper}>
                <Image source={require('../../assets/brand/dizzitup_logo_cercle.png')} style={styles.dzyLogo} resizeMode="contain" />
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
              activeOpacity={0.85}
            >
              <View style={styles.methodIconWrapperMM}>
                <Ionicons name="phone-portrait-outline" size={24} color="#64748B" />
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

          <View style={{ flex: 1, minHeight: 32 }} />

          {/* Security Banner */}
          <View style={styles.securityBanner}>
            <View style={styles.securityIconArc}>
              <Ionicons name="shield-checkmark-outline" size={20} color="#1A2840" />
            </View>
            <Text style={styles.securityTitle}>Vos transactions sont sécurisées</Text>
          </View>

        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.btnPrev} onPress={() => navigation.goBack()} activeOpacity={0.8}>
            <Text style={styles.btnPrevText}>Précédent</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.btnNext} 
            onPress={() => navigation.navigate('SendMoneyPinScreen', { amount, currency, method: selectedMethod })}
            activeOpacity={0.88}
          >
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
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginRight: 6,
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
    paddingTop: 16,
    paddingBottom: 24,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    marginTop: 8,
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
  },
  stepLineActive: {
    width: '100%',
    height: '100%',
    backgroundColor: '#FFC759',
    borderRadius: 1.5,
  },
  pageTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 22,
    color: '#1A2840',
    textAlign: 'center',
    marginBottom: 6,
  },
  pageSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 28,
  },
  methodsContainer: {
    paddingHorizontal: 20,
    gap: 16,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  methodCardActive: {
    borderColor: '#FFC759',
    backgroundColor: '#FFFDF5',
  },
  methodIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  dzyLogo: {
    width: 44,
    height: 44,
  },
  methodIconWrapperMM: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  methodContent: {
    flex: 1,
  },
  methodTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: '#1A2840',
    marginBottom: 2,
  },
  methodDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#64748B',
  },
  radioWrapper: {
    marginLeft: 12,
  },
  radioInactive: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
  },
  radioActive: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#1A2840',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#1A2840',
  },
  securityBanner: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 8,
  },
  securityIconArc: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  securityTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#1A2840',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    paddingTop: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 12,
  },
  btnPrev: {
    flex: 1,
    backgroundColor: '#8A94A6',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  btnPrevText: {
    fontFamily: 'Inter_700Bold',
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
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: '#1A2840',
  },
});
