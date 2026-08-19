import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, KeyboardAvoidingView, ScrollView, TouchableOpacity, StatusBar, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { theme } from '../theme/theme';
import { DizzitInput } from '../components/DizzitInput';
import { supabase } from '../services/supabaseClient';

export default function UnlockScreen() {
  const { t, setIsAppLocked } = useApp();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasBiometrics, setHasBiometrics] = useState(false);

  useEffect(() => {
    // Attempt biometric unlock on mount if enabled
    const checkBiometrics = async () => {
      try {
        if (Platform.OS === 'web') return;
        const useBio = await SecureStore.getItemAsync('use_biometrics');
        if (useBio === 'true') {
          setHasBiometrics(true);
          triggerBiometrics();
        }
      } catch (err) {
        console.log("Biometric error:", err);
      }
    };
    checkBiometrics();
  }, []);

  const triggerBiometrics = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: t('auth.secureDizzitUp', 'Déverrouiller DizzitUp'),
        fallbackLabel: t('auth.pinCode', 'Utiliser le code PIN'),
        disableDeviceFallback: true,
      });
      
      if (result.success) {
        setIsAppLocked(false);
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
      if (pin === storedPin) {
        setIsAppLocked(false);
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

  const handleLogout = async () => {
    try {
      await SecureStore.deleteItemAsync('user_pin');
      await SecureStore.deleteItemAsync('use_biometrics');
      await supabase.auth.signOut();
      setIsAppLocked(false); // Navigation will auto-route to LoginScreen because session is null
    } catch (e) {
      console.log('Error during logout:', e);
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
        >
          {/* Logo / Icon */}
          <View style={styles.iconContainer}>
            <View style={styles.shieldIconContainer}>
              <Ionicons name="lock-closed" size={32} color="#1A2840" />
            </View>
            <Text style={styles.mainTitle}>{t('auth.secureDizzitUp', 'DizzitUp Sécurisé')}</Text>
            <Text style={styles.subtitle}>{t('auth.enterPinToUnlock', 'Entrez votre code PIN pour déverrouiller.')}</Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            <DizzitInput
              placeholder="••••••"
              value={pin}
              onChangeText={(text) => {
                setPin(text);
                setError('');
                if (text.length === 6) {
                  // Auto-submit if 6 digits
                  // We do it safely by not depending on state snapshot inside effect
                }
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
                ]}>{t('common.unlock', 'DÉVERROUILLER')}</Text>
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

          <TouchableOpacity onPress={handleLogout} style={styles.logoutContainer}>
            <Text style={styles.logoutText}>{t('auth.forgotPinLogout', 'Oublié ? Se déconnecter')}</Text>
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
    paddingTop: Platform.OS === 'android' ? Math.max(StatusBar.currentHeight || 0, 44) + 6 : 14,
  },
  container: {
    flex: 1,
  },
  innerContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    paddingBottom: 40,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 40,
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
    fontSize: 24,
    color: '#1A2840',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
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
    marginBottom: 24,
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
  logoutContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  logoutText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#8B92A5',
    textDecorationLine: 'underline',
  },
});
