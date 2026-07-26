import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, ActivityIndicator, StatusBar } from 'react-native';
import { theme } from '../theme/theme';
import HeaderBackButton from '../components/HeaderBackButton';
import StepIndicator from '../components/StepIndicator';
import { DizzitInput } from '../components/DizzitInput';
import { Ionicons } from '@expo/vector-icons';

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
            
            <View style={{ height: 16 }} />
            
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

          {/* Buttons (Dual layout like M16) */}
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
    paddingTop: Platform.OS === 'android' ? Math.max(StatusBar.currentHeight || 0, 44) + 6 : 0,
  },
  container: {
    flex: 1,
  },
  innerContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24, },
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
    marginBottom: 8,
  },
  shieldIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF8ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  mainTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 26,
    color: '#1A2840',
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  formContainer: {
    marginTop: 8,
    marginBottom: 32,
  },
  sectionTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 16,
    color: '#1A2840',
    marginBottom: 12,
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
    marginTop: 'auto', // pushes buttons to bottom if space available
  },
  actionButton: {
    flex: 1,
    height: 56,
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
