import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Keyboard } from 'react-native';
import { theme } from '../theme/theme';
import HeaderBackButton from '../components/HeaderBackButton';
import StepIndicator from '../components/StepIndicator';
import { DizzitInput } from '../components/DizzitInput';
import { DizzitButton } from '../components/DizzitButton';

const STEPS = [
  { label: 'E-mail' },
  { label: 'Code' },
  { label: 'Réinitialiser' },
];

export default function ResetPasswordEmailScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleNext = () => {
    // Basic validation
    if (!email.trim() || !email.includes('@')) {
      setError('Veuillez entrer une adresse e-mail valide.');
      return;
    }
    setError('');
    
    // Simulate API call
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert('Code de vérification envoyé à ' + email);
      navigation.navigate('ResetPasswordCodeScreen', { email });
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
              <Text style={styles.headerTitle}>Réinitialiser le mot de passe</Text>
              <View style={styles.placeholderBox} />
            </View>

            {/* Title Section */}
            <View style={styles.titleSection}>
              <Text style={styles.mainTitle}>E-mail</Text>
              <Text style={styles.subtitle}>
                Entrez votre adresse e-mail. Un code de vérification vous sera envoyé.
              </Text>
            </View>

            {/* Stepper */}
            <StepIndicator currentStep={1} steps={STEPS} />

            {/* Form */}
            <View style={styles.formContainer}>
              <DizzitInput
                icon="mail-outline"
                placeholder="E-mail"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setError('');
                }}
                error={error}
              />
            </View>

            {/* Button */}
            <View style={styles.buttonContainer}>
              <DizzitButton
                title="SUIVANT"
                onPress={handleNext}
                isLoading={isLoading}
              />
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
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
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
    fontSize: 28,
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
  },
  buttonContainer: {
    marginTop: 32,
  }
});
