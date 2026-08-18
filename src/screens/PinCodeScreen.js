import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, ActivityIndicator, StatusBar } from 'react-native';
import { theme } from '../theme/theme';
import HeaderBackButton from '../components/HeaderBackButton';
import StepIndicator from '../components/StepIndicator';
import { DizzitInput } from '../components/DizzitInput';
import { Ionicons } from '@expo/vector-icons';

import { isSmallScreen, isShortScreen } from '../utils/responsive';

const STEPS = [
  { label: 'Profil' },
  { label: 'Code PIN' },
];

export default function PinCodeScreen() {
  const navigation = useNavigation();
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isPinComplete = pin.length === 6;
  const isConfirmComplete = confirmPin.length === 6;
  const doPinsMatch = pin === confirmPin;
  
  const isNextDisabled = !isPinComplete || !isConfirmComplete || !doPinsMatch;

  let displayError = '';
  if (isConfirmComplete && !doPinsMatch) {
    displayError = 'Les codes PIN ne correspondent pas.';
  }

  const handleNext = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert('Code PIN créé avec succès !');
      navigation.navigate('SuccessScreen');
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.innerContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <HeaderBackButton onPress={() => navigation.goBack()} />
            <TouchableOpacity onPress={() => navigation.navigate('LoginScreen')}>
              <Text style={styles.loginText}>
                Déjà un compte ? <Text style={styles.loginLink}>Se connecter</Text>
              </Text>
            </TouchableOpacity>
          </View>

          {/* Title Section */}
          <View style={styles.titleSection}>
            <View style={styles.shieldIconContainer}>
              <Ionicons name="shield-checkmark-outline" size={24} color="#1A2840" />
            </View>
            <Text style={styles.mainTitle}>Code PIN</Text>
            <Text style={styles.subtitle}>
              Définissez un code à 6 chiffres pour sécuriser votre compte.
            </Text>
          </View>

          {/* Stepper */}
          <StepIndicator currentStep={2} steps={STEPS} />

          {/* Form */}
          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>Créez votre code PIN</Text>
            <DizzitInput
              placeholder="••••••"
              value={pin}
              onChangeText={setPin}
              secureTextEntry={true}
              keyboardType="number-pad"
              maxLength={6}
            />
            
            <View style={{ height: 12 }} />
            
            <Text style={styles.sectionTitle}>Confirmez votre code PIN</Text>
            <DizzitInput
              placeholder="••••••"
              value={confirmPin}
              onChangeText={setConfirmPin}
              secureTextEntry={true}
              keyboardType="number-pad"
              maxLength={6}
            />
            
            {displayError ? (
              <Text style={styles.errorText}>{displayError}</Text>
            ) : null}
          </View>

          {/* Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.previousButton]}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.previousButtonText}>PRÉCÉDENT</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.actionButton, 
                styles.nextButton,
                isNextDisabled && styles.nextButtonDisabled
              ]}
              onPress={handleNext}
              disabled={isNextDisabled || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.nextButtonText}>TERMINER</Text>
              )}
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? Math.max(StatusBar.currentHeight || 0, 44) + 6 : 10,
  },
  container: {
    flex: 1,
  },
  innerContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: isShortScreen ? 12 : 20,
  },
  loginText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#1A2840',
  },
  loginLink: {
    color: theme.colors.accent,
    fontFamily: 'Inter_700Bold',
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: isShortScreen ? 4 : 8,
  },
  shieldIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF8ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: isShortScreen ? 8 : 14,
  },
  mainTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: isShortScreen ? 22 : 26,
    color: '#1A2840',
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 10,
  },
  formContainer: {
    marginTop: 4,
    marginBottom: isShortScreen ? 16 : 24,
  },
  sectionTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 15,
    color: '#1A2840',
    marginBottom: 8,
  },
  errorText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: theme.colors.error,
    marginTop: 4,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: isShortScreen ? 12 : 'auto',
    paddingTop: 8,
  },
  actionButton: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previousButton: {
    backgroundColor: '#8B92A5',
    marginRight: 12,
  },
  previousButtonText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  nextButton: {
    backgroundColor: theme.colors.accent,
  },
  nextButtonDisabled: {
    backgroundColor: '#F3F4F6', // Lighter when disabled
  },
  nextButtonText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#1A2840',
  },
});
