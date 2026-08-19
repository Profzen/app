import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, ActivityIndicator, StatusBar } from 'react-native';
import { theme } from '../theme/theme';
import HeaderBackButton from '../components/HeaderBackButton';
import StepIndicator from '../components/StepIndicator';
import { OtpInput } from '../components/OtpInput';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { supabase } from '../services/supabaseClient';
import AppToast from '../components/AppToast';

const STEPS = (t) => [
  { label: t('auth.email', 'E-mail') },
  { label: t('auth.code', 'Code') },
  { label: t('auth.reset', 'Réinitialiser') },
];

export default function ResetPasswordCodeScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const email = route.params?.email || '';
  const { t } = useApp();
  
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toastInfo, setToastInfo] = useState({ visible: false, title: '', message: '', type: 'success' });

  const handleNext = async () => {
    if (code.length < 6) return;
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({ email, token: code, type: 'recovery' });
      if (error) throw error;
      
      setToastInfo({ visible: true, title: t('common.success', 'Success'), message: t('auth.codeValidated', 'Code validé avec succès !'), type: 'success' });
      setTimeout(() => navigation.navigate('ResetPasswordFinalScreen'), 1500);
    } catch (err) {
      setToastInfo({ visible: true, title: t('common.error', 'Error'), message: err.message, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      setToastInfo({ visible: true, title: t('common.success', 'Success'), message: t('auth.resetSent', 'Nouveau code envoyé !'), type: 'success' });
    } catch (err) {
      setToastInfo({ visible: true, title: t('common.error', 'Error'), message: err.message, type: 'error' });
    }
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
            <HeaderBackButton onPress={() => navigation.goBack()} />
            <Text style={styles.headerTitle}>{t('auth.resetPasswordTitle', 'Réinitialiser le mot de passe')}</Text>
            <View style={styles.placeholderBox} />
          </View>

          {/* Title Section */}
          <View style={styles.titleSection}>
            <Text style={styles.mainTitle}>{t('auth.verificationCodeTitle', 'Code de vérification')}</Text>
            <Text style={styles.subtitle}>
              {t('auth.enterVerificationCode', 'Veuillez entrer le code de vérification reçu ci-dessous.')}
            </Text>
          </View>

          {/* Stepper */}
          <StepIndicator currentStep={2} steps={STEPS(t)} />

          {/* OTP Input */}
          <View style={styles.formContainer}>
            <OtpInput length={6} value={code} onChange={setCode} />
          </View>

          {/* Buttons */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.buttonPrevious]}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.buttonPreviousText}>{t('common.previous', 'PRÉCÉDENT')}</Text>
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
                  {t('common.next', 'SUIVANT')}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Resend Link */}
          <TouchableOpacity 
            style={styles.resendContainer}
            onPress={handleResend}
          >
            <Ionicons name="refresh" size={20} color="#1A2840" />
            <Text style={styles.resendText}>{t('auth.resendCode', 'Renvoyer le code')}</Text>
          </TouchableOpacity>

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
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
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
