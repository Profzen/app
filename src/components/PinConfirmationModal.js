import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, ActivityIndicator, Modal, KeyboardAvoidingView } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme/theme';
import { DizzitInput } from './DizzitInput';
import { useApp } from '../context/AppContext';

export const PinConfirmationModal = ({ visible, onSuccess, onCancel, amount, tokenName, title, subtitle }) => {
  const { t } = useApp();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasBiometrics, setHasBiometrics] = useState(false);
  const [isSetupMode, setIsSetupMode] = useState(false);
  const bioTriggered = useRef(false);

  useEffect(() => {
    if (visible) {
      setPin('');
      setError('');
      setIsLoading(false);
      bioTriggered.current = false;
      checkPinState();
      checkBiometrics();
    }
  }, [visible]);

  const checkPinState = async () => {
    try {
      const stored = await SecureStore.getItemAsync('user_pin');
      setIsSetupMode(!stored);
    } catch (e) {
      console.log(e);
    }
  };

  const checkBiometrics = async () => {
    try {
      if (Platform.OS === 'web') return;
      const useBio = await SecureStore.getItemAsync('use_biometrics');
      if (useBio === 'true') {
        setHasBiometrics(true);
        if (!bioTriggered.current) {
          bioTriggered.current = true;
          triggerBiometrics();
        }
      }
    } catch (err) {
      console.log("Biometric error:", err);
    }
  };

  const triggerBiometrics = async () => {
    try {
      let prompt = t('auth.secureDizzitUp', 'Verify to authorize');
      if (amount && tokenName) {
        prompt = t('sendMoney.biometricPrompt', 'Authorize Transfer of {{amount}} {{token}}', { amount, token: tokenName });
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: prompt,
        fallbackLabel: t('auth.pinCode', 'Utiliser le code PIN'),
        disableDeviceFallback: true,
      });
      
      if (result.success) {
        onSuccess();
      }
    } catch (err) {
      console.log("Biometric error:", err);
    }
  };

  const handleUnlock = async () => {
    if (pin.length < 6) return;
    setIsLoading(true);
    setError('');

    try {
      const storedPin = await SecureStore.getItemAsync('user_pin');
      
      if (!storedPin) {
        // First time setup - Save the PIN
        await SecureStore.setItemAsync('user_pin', pin);
        onSuccess();
        return;
      }

      if (pin === storedPin) {
        onSuccess();
      } else {
        setError(t('auth.incorrectPin', 'Code PIN incorrect.'));
        setPin('');
      }
    } catch (e) {
      setError(t('auth.verificationError', 'Erreur lors de la vérification.'));
    } finally {
      setIsLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onCancel}
    >
      <KeyboardAvoidingView 
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.closeButton} onPress={onCancel}>
            <Ionicons name="close" size={24} color="#1A2840" />
          </TouchableOpacity>

          <View style={styles.iconContainer}>
            <View style={styles.shieldIconContainer}>
              <Ionicons name="lock-closed" size={32} color="#1A2840" />
            </View>
            <Text style={styles.mainTitle}>
              {title || (isSetupMode 
                ? t('auth.createPin', 'Créer un code PIN') 
                : t('auth.secureDizzitUp', 'DizzitUp Sécurisé'))}
            </Text>
            <Text style={styles.subtitle}>
              {subtitle || (isSetupMode 
                ? t('auth.createPinDesc', 'Veuillez configurer un code PIN à 6 chiffres pour sécuriser vos transactions.')
                : t('auth.enterPinToUnlock', 'Entrez votre code PIN pour déverrouiller.'))}
            </Text>
            
            {amount && tokenName && (
              <Text style={styles.amountText}>{amount} {tokenName}</Text>
            )}
          </View>

          <View style={styles.formContainer}>
            <DizzitInput
              placeholder="••••••"
              value={pin}
              onChangeText={(text) => {
                setPin(text);
                setError('');
              }}
              isPassword={true}
              keyboardType="number-pad"
              maxLength={6}
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[
                styles.actionButton, 
                styles.nextButton,
                pin.length < 6 && styles.nextButtonDisabled
              ]}
              onPress={handleUnlock}
              disabled={pin.length < 6 || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={[
                  styles.nextButtonText,
                  pin.length < 6 && styles.nextButtonTextDisabled
                ]}>{t('common.confirm', 'CONFIRM')}</Text>
              )}
            </TouchableOpacity>
          </View>

          {hasBiometrics && (
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#F3F4F6', marginBottom: 16 }]}
              onPress={triggerBiometrics}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="finger-print" size={20} color="#1A2840" style={{ marginRight: 8 }} />
                <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 15, color: '#1A2840' }}>
                  {t('settings.loginWithBiometrics', 'Login with Biometrics')}
                </Text>
              </View>
            </TouchableOpacity>
          )}

        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
    minHeight: 400,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  shieldIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFF8ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  mainTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 22,
    color: '#1A2840',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  amountText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 24,
    color: theme.colors.primary,
    marginTop: 12,
  },
  formContainer: {
    marginBottom: 24,
  },
  errorText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: theme.colors.error,
    marginTop: 8,
    textAlign: 'center',
  },
  buttonRow: {
    marginBottom: 16,
  },
  actionButton: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButton: {
    backgroundColor: theme.colors.accent,
  },
  nextButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  nextButtonText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: '#1A2840',
  },
  nextButtonTextDisabled: {
    color: '#9CA3AF',
  },
});
