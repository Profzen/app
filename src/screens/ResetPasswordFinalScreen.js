import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { theme } from '../theme/theme';
import HeaderBackButton from '../components/HeaderBackButton';
import StepIndicator from '../components/StepIndicator';
import { DizzitInput } from '../components/DizzitInput';
import { Ionicons } from '@expo/vector-icons';

const STEPS = [
  { label: 'E-mail' },
  { label: 'Code' },
  { label: 'Réinitialisation' },
];

export default function ResetPasswordFinalScreen() {
  const navigation = useNavigation();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleNext = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert('Votre mot de passe a été réinitialisé avec succès !');
      // In prod: navigation.navigate('LoginScreen')
    }, 1500);
  };

  const isPasswordValid = password.length >= 8;
  const doPasswordsMatch = password === confirmPassword && password.length > 0;
  const isNextDisabled = !isPasswordValid || !doPasswordsMatch;
  
  // Real-time error logic
  let displayError = '';
  if (confirmPassword.length > 0 && password !== confirmPassword) {
    displayError = 'Les mots de passe ne correspondent pas.';
  } else if (password.length > 0 && password.length < 8) {
    displayError = 'Le mot de passe doit contenir au moins 8 caractères.';
  }

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
            <HeaderBackButton onPress={() => alert('Retour au code')} />
            <Text style={styles.headerTitle}>Réinitialiser le mot de passe</Text>
            <View style={styles.placeholderBox} />
          </View>

          {/* Title Section */}
          <View style={styles.titleSection}>
            <Text style={styles.mainTitle}>Nouveau mot de passe</Text>
            <Text style={styles.subtitle}>
              Entrez un nouveau mot de passe pour vous connecter.
            </Text>
          </View>

          {/* Stepper */}
          <StepIndicator currentStep={3} steps={STEPS} />

          {/* Form */}
          <View style={styles.formContainer}>
            <DizzitInput
              iconLeft={<Ionicons name="lock-closed-outline" size={20} color={theme.colors.textSecondary} />}
              placeholder="Nouveau mot de passe"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setError('');
              }}
              isPassword={true}
            />
            
            <View style={{ height: 4 }} />
            
            <DizzitInput
              iconLeft={<Ionicons name="lock-closed-outline" size={20} color={theme.colors.textSecondary} />}
              placeholder="Confirmez le nouveau mot de passe"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                setError('');
              }}
              isPassword={true}
            />

            {displayError ? (
              <Text style={styles.errorText}>{displayError}</Text>
            ) : (
              <Text style={styles.hintText}>
                Le mot de passe doit contenir au moins 8 caractères.
              </Text>
            )}
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
    paddingHorizontal: 20,
  },
  formContainer: {
    marginTop: 24,
    marginBottom: 32,
  },
  hintText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#A0AABF',
    marginTop: 4,
    marginLeft: 4,
  },
  errorText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: theme.colors.error,
    marginTop: 4,
    marginLeft: 4,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonPrevious: {
    backgroundColor: '#8B92A5',
    marginRight: 8,
  },
  buttonNext: {
    backgroundColor: theme.colors.accent,
    marginLeft: 8,
  },
  buttonNextDisabled: {
    backgroundColor: '#F3F4F6',
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
    color: '#D1D5DB',
  },
});
