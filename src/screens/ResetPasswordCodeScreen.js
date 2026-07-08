import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { theme } from '../theme/theme';
import HeaderBackButton from '../components/HeaderBackButton';
import StepIndicator from '../components/StepIndicator';
import { OtpInput } from '../components/OtpInput';
import { Ionicons } from '@expo/vector-icons';

const STEPS = [
  { label: 'E-mail' },
  { label: 'Code' },
  { label: 'Réinitialiser' },
];

export default function ResetPasswordCodeScreen() {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleNext = () => {
    if (code.length < 6) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert('Code validé avec succès !');
      // In prod: navigation.navigate('ResetPasswordFinalScreen')
    }, 1500);
  };

  const isNextDisabled = code.length < 6;

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
            <HeaderBackButton onPress={() => alert('Retour à la saisie email')} />
            <Text style={styles.headerTitle}>Réinitialiser le mot de passe</Text>
            <View style={styles.placeholderBox} />
          </View>

          {/* Title Section */}
          <View style={styles.titleSection}>
            <Text style={styles.mainTitle}>Code de vérification</Text>
            <Text style={styles.subtitle}>
              Veuillez entrer le code de vérification reçu ci-dessous.
            </Text>
          </View>

          {/* Stepper */}
          <StepIndicator currentStep={2} steps={STEPS} />

          {/* OTP Input */}
          <View style={styles.formContainer}>
            <OtpInput length={6} value={code} onChange={setCode} />
          </View>

          {/* Buttons */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.buttonPrevious]}
              onPress={() => alert('Précédent')}
            >
              <Text style={styles.buttonPreviousText}>PRÉCÉDENT</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.button, 
                styles.buttonNext,
                isNextDisabled && styles.buttonNextDisabled
              ]}
              onPress={handleNext}
              disabled={isNextDisabled || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#1A2840" />
              ) : (
                <Text style={[
                  styles.buttonNextText,
                  isNextDisabled && styles.buttonNextTextDisabled
                ]}>
                  SUIVANT
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Resend Link */}
          <TouchableOpacity 
            style={styles.resendContainer}
            onPress={() => alert('Nouveau code envoyé !')}
          >
            <Ionicons name="refresh" size={20} color="#1A2840" />
            <Text style={styles.resendText}>Renvoyer le code</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
    marginBottom: 32,
  },
  headerTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 16,
    color: '#1A2840',
  },
  placeholderBox: {
    width: 40,
    height: 40,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 8,
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
    paddingHorizontal: 10,
  },
  formContainer: {
    marginTop: 24,
    marginBottom: 32,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 48,
  },
  button: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonPrevious: {
    backgroundColor: '#8B92A5', // Grayish blue
    marginRight: 8,
  },
  buttonNext: {
    backgroundColor: theme.colors.accent,
    marginLeft: 8,
  },
  buttonNextDisabled: {
    backgroundColor: '#F3F4F6', // Light gray
  },
  buttonPreviousText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  buttonNextText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: '#1A2840',
  },
  buttonNextTextDisabled: {
    color: '#D1D5DB', // Disabled gray text
  },
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resendText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: '#1A2840',
    marginLeft: 8,
    textDecorationLine: 'underline',
  },
});
