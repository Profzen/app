import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Keyboard, StatusBar } from 'react-native';
import { theme } from '../theme/theme';
import HeaderBackButton from '../components/HeaderBackButton';
import StepIndicator from '../components/StepIndicator';
import { DizzitInput } from '../components/DizzitInput';
import { DizzitButton } from '../components/DizzitButton';
import { supabase } from '../services/supabaseClient';
import AppToast from '../components/AppToast';
import { useApp } from '../context/AppContext';

const STEPS = (t) => [
  { label: t('auth.email', 'E-mail') },
  { label: t('auth.code', 'Code') },
  { label: t('auth.reset', 'Réinitialiser') },
];

export default function ResetPasswordEmailScreen() {
  const { t } = useApp();
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [toastInfo, setToastInfo] = useState({ visible: false, title: '', message: '', type: 'success' });

  const handleNext = async () => {
    // Basic validation
    if (!email.trim() || !email.includes('@')) {
      setError(t('auth.registration.errors.invalidEmail', 'Veuillez entrer une adresse e-mail valide.'));
      return;
    }
    setError('');
    
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) {
        setError(error.message);
      } else {
        setToastInfo({ visible: true, title: t('common.success', 'Success'), message: t('auth.resetSent', 'Code de vérification envoyé à ' + email), type: 'success' });
        setTimeout(() => navigation.navigate('ResetPasswordCodeScreen', { email }), 1200);
      }
    } catch (err) {
      setError(t('common.error', 'Une erreur est survenue.'));
    } finally {
      setIsLoading(false);
    }
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
              <Text style={styles.headerTitle}>{t('auth.resetPasswordTitle', 'Réinitialiser le mot de passe')}</Text>
              <View style={styles.placeholderBox} />
            </View>

            {/* Title Section */}
            <View style={styles.titleSection}>
              <Text style={styles.mainTitle}>{t('auth.email', 'E-mail')}</Text>
              <Text style={styles.subtitle}>
                {t('auth.enterEmailReset', 'Entrez votre adresse e-mail. Un code de vérification vous sera envoyé.')}
              </Text>
            </View>

            {/* Stepper */}
            <StepIndicator currentStep={1} steps={STEPS(t)} />

            {/* Form */}
            <View style={styles.formContainer}>
              <DizzitInput
                icon="mail-outline"
                placeholder={t('auth.email', 'E-mail')}
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
                title={t('common.next', 'SUIVANT')}
                onPress={handleNext}
                isLoading={isLoading}
              />
            </View>

          </ScrollView>
        </KeyboardAvoidingView>
        <AppToast visible={toastInfo.visible} title={toastInfo.title} message={toastInfo.message} type={toastInfo.type} onClose={() => setToastInfo({ ...toastInfo, visible: false })} />
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? Math.max(StatusBar.currentHeight || 0, 44) + 6 : 14,
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
    marginBottom: 32, },
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
