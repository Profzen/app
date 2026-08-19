import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, ActivityIndicator, StatusBar, Modal } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import { useApp } from '../context/AppContext';
import { theme } from '../theme/theme';
import HeaderBackButton from '../components/HeaderBackButton';
import StepIndicator from '../components/StepIndicator';
import { DizzitInput } from '../components/DizzitInput';
import { Ionicons } from '@expo/vector-icons';

import { isSmallScreen, isShortScreen } from '../utils/responsive';

const STEPS = (t) => [
  { label: t('auth.profile', 'Profil') },
  { label: t('auth.pinCode', 'Code PIN') },
];

export default function PinCodeScreen() {
  const { t } = useApp();
  const navigation = useNavigation();
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showBioPrompt, setShowBioPrompt] = useState(false);

  const isPinComplete = pin.length === 6;
  const isConfirmComplete = confirmPin.length === 6;
  const doPinsMatch = pin === confirmPin;
  
  const isNextDisabled = !isPinComplete || !isConfirmComplete || !doPinsMatch;

  let displayError = '';
  if (confirmPin.length > 0) {
    if (confirmPin.length === 6 && !doPinsMatch) {
      displayError = t('auth.pinsDoNotMatch', 'Les codes PIN ne correspondent pas.');
    } else if (confirmPin.length < 6 && !pin.startsWith(confirmPin)) {
      displayError = t('auth.pinsDoNotMatch', 'Les codes PIN ne correspondent pas.');
    }
  }

  const handleNext = async () => {
    setIsLoading(true);
    try {
      if (Platform.OS !== 'web') {
        await SecureStore.setItemAsync('user_pin', pin);
        
        // Ask if they want to enable Biometrics
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        
        if (hasHardware && isEnrolled) {
          setShowBioPrompt(true);
          setIsLoading(false);
          return;
        }
      }
      finishSetup();
    } catch (e) {
      console.log('Error saving PIN:', e);
      // Fallback custom error handle, can use AppToast here if we import it, but let's just ignore for now or keep a log.
    } finally {
      if (!showBioPrompt) setIsLoading(false);
    }
  };

  const handleEnableBiometrics = async () => {
    setShowBioPrompt(false);
    await SecureStore.setItemAsync('use_biometrics', 'true');
    finishSetup();
  };

  const handleDeclineBiometrics = () => {
    setShowBioPrompt(false);
    finishSetup();
  };

  const finishSetup = () => {
    navigation.navigate('SuccessScreen');
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
                {t('auth.alreadyHaveAccount', 'Déjà un compte ?')} <Text style={styles.loginLink}>{t('auth.loginAction', 'Se connecter')}</Text>
              </Text>
            </TouchableOpacity>
          </View>

          {/* Title Section */}
          <View style={styles.titleSection}>
            <View style={styles.shieldIconContainer}>
              <Ionicons name="shield-checkmark-outline" size={24} color="#1A2840" />
            </View>
            <Text style={styles.mainTitle}>{t('auth.pinCode', 'Code PIN')}</Text>
            <Text style={styles.subtitle}>
              {t('auth.setPinSubtitle', 'Définissez un code à 6 chiffres pour sécuriser votre compte.')}
            </Text>
          </View>

          {/* Stepper */}
          <StepIndicator currentStep={2} steps={STEPS(t)} />

          {/* Form */}
          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>{t('auth.createPinTitle', 'Créez votre code PIN')}</Text>
            <DizzitInput
              placeholder="••••••"
              value={pin}
              onChangeText={setPin}
              isPassword={true}
              keyboardType="number-pad"
              maxLength={6}
            />
            
            <View style={{ height: 12 }} />
            
            <Text style={styles.sectionTitle}>{t('auth.confirmPinTitle', 'Confirmez votre code PIN')}</Text>
            <DizzitInput
              placeholder="••••••"
              value={confirmPin}
              onChangeText={setConfirmPin}
              isPassword={true}
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
              <Text style={styles.previousButtonText}>{t('auth.back', 'RETOUR')}</Text>
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
                <Text style={[
                  styles.nextButtonText,
                  isNextDisabled && styles.nextButtonTextDisabled
                ]}>{t('auth.savePin', 'ENREGISTRER LE PIN')}</Text>
              )}
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* Custom Biometric Prompt Modal */}
      <Modal
        visible={showBioPrompt}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconContainer}>
              <Ionicons name="finger-print" size={32} color={theme.colors.accent} />
            </View>
            <Text style={styles.modalTitle}>{t('auth.enableBiometricsTitle', 'Activer la biométrie')}</Text>
            <Text style={styles.modalText}>
              {t('auth.enableBiometricsText', 'Voulez-vous utiliser Face ID / Touch ID pour vous connecter plus rapidement la prochaine fois ?')}
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalBtn, styles.modalBtnCancel]} 
                onPress={handleDeclineBiometrics}
              >
                <Text style={styles.modalBtnCancelText}>{t('auth.later', 'Plus tard')}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalBtn, styles.modalBtnConfirm]} 
                onPress={handleEnableBiometrics}
              >
                <Text style={styles.modalBtnConfirmText}>{t('auth.yesEnable', 'Oui, activer')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    backgroundColor: '#E5E7EB', // more prominent gray
  },
  nextButtonText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#1A2840',
  },
  nextButtonTextDisabled: {
    color: '#9CA3AF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(26, 40, 64, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  modalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFF8ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 20,
    color: '#1A2840',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  modalBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBtnCancel: {
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  modalBtnCancelText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#6B7280',
  },
  modalBtnConfirm: {
    backgroundColor: theme.colors.accent,
    marginLeft: 8,
  },
  modalBtnConfirmText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#1A2840',
  },
});
