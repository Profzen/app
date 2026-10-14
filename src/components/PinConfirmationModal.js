import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, ActivityIndicator, Modal, KeyboardAvoidingView } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme/theme';
import { DizzitInput } from './DizzitInput';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { supabase } from '../services/supabaseClient';

export const PinConfirmationModal = ({ visible, onSuccess, onCancel, amount, tokenName, estimatedFee, title, subtitle, isChangeMode = false, isSettingsContext = false }) => {
  const { t, user, logout } = useApp();
  const navigation = useNavigation();
  const [pin, setPin] = useState('');
  const [firstPin, setFirstPin] = useState('');
  const [setupStep, setSetupStep] = useState(0); // 0 = enter, 1 = confirm, 2 = password
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasBiometrics, setHasBiometrics] = useState(false);
  const [isSetupMode, setIsSetupMode] = useState(false);
  const bioTriggered = useRef(false);

  useEffect(() => {
    if (visible && user?.id) {
      setPin('');
      setFirstPin('');
      setSetupStep(0);
      setPassword('');
      setError('');
      setWrongAttempts(0);
      setIsLoading(false);
      bioTriggered.current = false;
      checkPinState();
      checkBiometrics();
    }
  }, [visible, user?.id]);

  const checkPinState = async () => {
    try {
      if (!user?.id) return;
      const pinKey = `user_pin_${user.id}`;
      const stored = await SecureStore.getItemAsync(pinKey);
      setIsSetupMode(!stored);
    } catch (e) {
      console.log(e);
    }
  };

  const checkBiometrics = async () => {
    try {
      if (Platform.OS === 'web') return;
      const bioKey = user?.id ? `use_biometrics_${user?.id}` : 'use_biometrics';
      const useBio = await SecureStore.getItemAsync(bioKey);
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

  const handleVerifySuccess = () => {
    if (isChangeMode && !isSetupMode) {
      setIsSetupMode(true);
      setSetupStep(0);
      setPin('');
      setFirstPin('');
      setError('');
    } else {
      onSuccess();
    }
  };

  const triggerBiometrics = async () => {
    try {
      let prompt = t('auth.secureDizzitUp', "Secure DizzitUp");
      if (amount && tokenName) {
        prompt = t('sendMoney.biometricPrompt', 'Authorize Transfer of {{amount}} {{token}}', { amount, token: tokenName });
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: prompt,
        fallbackLabel: t('auth.pinCode', 'Use PIN Code'),
        disableDeviceFallback: true,
      });
      
      if (result.success) {
        handleVerifySuccess();
      }
    } catch (err) {
      console.log("Biometric error:", err);
    }
  };

  const handleUnlock = async () => {
    if (isSetupMode && setupStep === 3) {
      if (!password) return;
      setIsLoading(true);
      setError('');
      try {
        const { error: verifyError } = await supabase.auth.verifyOtp({
          email: user?.email,
          token: password,
          type: 'email',
        });
        if (verifyError) {
          setError(t('auth.invalidOtp', 'Invalid code.'));
          setIsLoading(false);
          return;
        }
        const pinKey = user?.id ? `user_pin_${user?.id}` : 'user_pin';
        await SecureStore.setItemAsync(pinKey, firstPin);
        onSuccess();
      } catch (e) {
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (isSetupMode && setupStep === 2) {
      if (!password) return;
      setIsLoading(true);
      setError('');
      try {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: user?.email,
          password: password,
        });
        if (authError) {
          setError(t('auth.invalidPassword', 'Invalid password.'));
          setIsLoading(false);
          return;
        }
        const pinKey = user?.id ? `user_pin_${user?.id}` : 'user_pin';
        await SecureStore.setItemAsync(pinKey, firstPin);
        onSuccess();
      } catch (e) {
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (pin.length < 6) return;
    setIsLoading(true);
    setError('');

    try {
      const pinKey = user?.id ? `user_pin_${user?.id}` : 'user_pin';
      const storedPin = await SecureStore.getItemAsync(pinKey);
      
      if (!storedPin || (isChangeMode && isSetupMode)) {
        // First time setup or Change PIN setup phase
        if (setupStep === 0) {
          setFirstPin(pin);
          setPin('');
          setSetupStep(1);
        } else if (setupStep === 1) {
          if (pin !== firstPin) {
            setError(t('auth.pinMismatch', 'PINs do not match. Try again.'));
            setFirstPin('');
            setPin('');
            setSetupStep(0);
          } else {
            const hw = await LocalAuthentication.hasHardwareAsync();
            const enrolled = await LocalAuthentication.isEnrolledAsync();
            
            if (hw && enrolled) {
               const result = await LocalAuthentication.authenticateAsync({
                 promptMessage: t('auth.verifyIdentity', 'Verify your identity to set PIN'),
                 disableDeviceFallback: true,
               });
               if (result.success) {
                 await SecureStore.setItemAsync(pinKey, pin);
                 onSuccess();
               } else {
                 setError(t('auth.verificationFailed', 'Verification failed.'));
               }
            } else {
               const primaryProvider = user?.app_metadata?.provider;
               const providersList = user?.app_metadata?.providers || [];
               console.log(`[PIN] provider=${primaryProvider}, providers=${JSON.stringify(providersList)}`);
               
               const isEmailAccount = primaryProvider === 'email' || providersList.includes('email');
               
               if (isEmailAccount) {
                 setSetupStep(2);
                 setPin('');
               } else {
                 const email = user?.email;
                 if (email) {
                    const { error: otpError } = await supabase.auth.signInWithOtp({
                      email,
                      options: { shouldCreateUser: false }
                    });
                    if (otpError) {
                      setError(otpError.message);
                    } else {
                      setSetupStep(3);
                      setPin('');
                    }
                 } else {
                    setError(t('auth.socialNoBio', 'Biometrics required to set PIN for social accounts. Please enable them or set a PIN in Settings.'));
                 }
               }
            }
          }
        }
        setIsLoading(false);
        return;
      }

      if (pin === storedPin) {
        handleVerifySuccess();
      } else {
        const attempts = wrongAttempts + 1;
        if (attempts >= 5) {
          await logout(navigation);
          return;
        }
        setWrongAttempts(attempts);
        setError(t('auth.incorrectPin', 'Incorrect PIN code.') + ` (${attempts}/5)`);
        setPin('');
      }
    } catch (e) {
      setError(t('auth.verificationError', 'Verification error.'));
    } finally {
      setIsLoading(false);
    }
  };

  if (!visible) return null;

  let displayTitle = title;
  let displaySubtitle = subtitle;
  
  if (isSetupMode) {
    if (setupStep === 0) {
      displayTitle = isChangeMode ? t('auth.enterNewPinTitle', 'Enter new PIN') : t('auth.createPinTitle', "Create your PIN code");
      displaySubtitle = isChangeMode ? t('auth.enterNewPinDesc', 'Enter your new 6-digit PIN.') : t('auth.createPinDesc', "Please set a 6-digit PIN to secure your transactions.");
    } else if (setupStep === 1) {
      displayTitle = t('auth.confirmPinTitle', "Confirm your PIN code");
      displaySubtitle = t('auth.confirmPinDesc', 'Please enter your 6-digit PIN again.');
    } else if (setupStep === 2) {
      displayTitle = t('auth.verifyPasswordTitle', 'Verify Password');
      displaySubtitle = t('auth.verifyPasswordDesc', 'Enter your account password to verify your identity.');
    } else if (setupStep === 3) {
      displayTitle = t('auth.verifyEmailTitle', 'Verify Email');
      displaySubtitle = t('auth.verifyEmailDesc', 'Enter the 6-digit code sent to your email.');
    }
  } else {
    if (isChangeMode) {
      displayTitle = title || t('auth.verifyCurrentPin', 'Verify Current PIN');
      displaySubtitle = subtitle || t('auth.enterCurrentPin', 'Enter your current PIN to continue.');
    } else {
      displayTitle = title || t('auth.secureDizzitUp', 'Secure DizzitUp');
      displaySubtitle = subtitle || t('auth.enterPinToUnlock', "Enter your 6-digit PIN to authorize.");
    }
  }

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
            <Text style={styles.mainTitle}>{displayTitle}</Text>
            <Text style={styles.subtitle}>{displaySubtitle}</Text>
            
            {amount && tokenName && (
              <Text style={styles.amountText}>{amount} {tokenName}</Text>
            )}
            {estimatedFee != null && (
              <View style={styles.feeBadge}>
                <Ionicons name="wallet-outline" size={13} color="#20365B" style={{ marginRight: 4 }} />
                <Text style={styles.feeText}>
                  {t('common.wallet.estimated_network_fee', 'Estimated network fee: ~{{fee}} USDC', { fee: estimatedFee })}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.formContainer}>
            {setupStep === 2 || setupStep === 3 ? (
              <DizzitInput
                placeholder={setupStep === 3 ? t('auth.code', "Code") : t('auth.password', 'Password')}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setError('');
                }}
                isPassword={setupStep === 2}
                keyboardType={setupStep === 3 ? "number-pad" : "default"}
              />
            ) : (
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
            )}
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>

          <View style={styles.buttonRow}>
              <TouchableOpacity 
              style={[
                styles.actionButton, 
                styles.nextButton,
                (((setupStep === 2 || setupStep === 3) ? !password : pin.length < 6) || isLoading) && styles.nextButtonDisabled
              ]}
              onPress={handleUnlock}
              disabled={((setupStep === 2 || setupStep === 3) ? !password : pin.length < 6) || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={[
                  styles.nextButtonText,
                  ((setupStep === 2 || setupStep === 3) ? !password : pin.length < 6) && styles.nextButtonTextDisabled
                ]}>{setupStep === 0 ? t('common.next', 'NEXT') : t('common.confirm', "Confirm")}</Text>
              )}
            </TouchableOpacity>
          </View>

          {hasBiometrics && !isSetupMode && (
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
  feeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  feeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#20365B',
  },
});
