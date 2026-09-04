import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform, StatusBar, KeyboardAvoidingView, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme/theme';
import { DizzitInput } from '../components/DizzitInput';
import { DizzitButton } from '../components/DizzitButton';
import { SocialLogins } from '../components/SocialLogins';
import { FeaturesBanner } from '../components/FeaturesBanner';
import { LanguageSelector } from '../components/LanguageSelector';
import AppToast from '../components/AppToast';
import { useApp } from '../context/AppContext';
import { supabase } from '../services/supabaseClient';

import { isSmallScreen, isShortScreen } from '../utils/responsive';

export default function LoginScreen() {
  const navigation = useNavigation();
  const { language, toggleLanguage, setLanguage, t } = useApp();
  const [activeTab, setActiveTab] = useState('email'); // 'email' | 'phone'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toastInfo, setToastInfo] = useState({ visible: false, title: '', message: '', type: 'info' });
  const [errorMessage, setErrorMessage] = useState(null);

  const handleLogin = async () => {
    if (!email || !password) return;
    
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      const isPlaceholder = !process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL.includes('placeholder');

      if (!isPlaceholder) {
        // Real Supabase Auth
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password,
        });

        if (error) {
          throw error;
        }

        console.log("✅ Supabase login successful", data.user.id);
      } else {
        console.log("ℹ️ Mode démo/mock actif (Supabase non configuré en local).");
      }

      setIsLoading(false);
      navigation.navigate('HomeScreen');
    } catch (error) {
      console.warn("⚠️ Connexion Supabase échouée (" + error.message + ")");
      setIsLoading(false);
      setErrorMessage(t('login.error_failed', 'Échec de connexion : ') + error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerSpacer} />
          <Text style={styles.headerTitle}>{t('auth.login', 'Connexion')}</Text>
          <LanguageSelector />
        </View>

        {/* Title Area */}
        <View style={styles.titleContainer}>
          <Image 
            source={require('../../assets/brand/dizzitup_logo_cercle_cropped.png')} 
            style={styles.logo} 
            resizeMode="contain"
          />
          <Text style={styles.mainTitle}>{t('login.welcome', 'Welcome back!')}</Text>
          <Text style={styles.subTitle}>
            {t('login.subtitle', 'Sign in to your DizzitUp account to continue.')}
          </Text>

          <View style={{marginTop: theme.spacing.md, width: '100%'}}>
            <FeaturesBanner />
          </View>
        </View>

        {/* Form Container */}
        <View style={styles.formContainer}>
          {/* Tabs */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'email' && styles.activeTab]}
              onPress={() => setActiveTab('email')}
            >
              <Text style={[styles.tabText, activeTab === 'email' && styles.activeTabText]}>
                {t('login.tab_email', 'Email')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, { opacity: 0.5 }]}
              onPress={() => {
                setToastInfo({
                  visible: true,
                  title: t('common.comingSoon', 'Coming Soon'),
                  message: t('auth.phoneNotAvailable', 'Phone number authentication is not available yet. Please use your email address.'),
                  type: 'info'
                });
              }}
            >
              <Text style={[styles.tabText, { color: theme.colors.textSecondary }]}>
                {t('login.tab_phone', 'Phone Number')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Input Fields */}
          {activeTab === 'email' ? (
            <DizzitInput 
              label={t('login.email_label', 'Email Address')}
              placeholder={t('login.email_placeholder', 'name@example.com')}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              iconLeft={<Ionicons name="mail-outline" size={20} color={theme.colors.primary} />}
            />
          ) : (
            <DizzitInput 
              label={t('login.phone_label', 'Phone Number')}
              placeholder={t('login.phone_placeholder', '+33 6 12 34 56 78')}
              value={email} // Reusing field for phone
              onChangeText={setEmail}
              keyboardType="phone-pad"
              iconLeft={<Ionicons name="call-outline" size={20} color={theme.colors.primary} />}
            />
          )}

          <DizzitInput 
            label={t('login.password_label', 'Password')}
            placeholder={t('login.password_placeholder', '••••••••')}
            value={password}
            onChangeText={setPassword}
            isPassword
            iconLeft={<Ionicons name="lock-closed-outline" size={20} color={theme.colors.primary} />}
            returnKeyType="done"
            onSubmitEditing={handleLogin}
          />

          {/* Forgot Password */}
          <View style={styles.forgotPasswordContainer}>
            <TouchableOpacity onPress={() => navigation.navigate('ResetPasswordEmailScreen')}>
              <Text style={styles.forgotPasswordText}>
                {t('login.forgot_password', 'Forgot password?')}
              </Text>
            </TouchableOpacity>
          </View>

          {errorMessage && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          <View style={{marginTop: theme.spacing.sm}}>
            <DizzitButton 
              title={t('login.login_button', 'Log in')} 
              onPress={handleLogin}
              isLoading={isLoading}
              disabled={!email || !password}
            />
          </View>
        </View>

        {/* Social Logins */}
        <View style={{marginTop: theme.spacing.md}}>
          <SocialLogins variant="square" />
        </View>

        {/* Signup Link */}
        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>{t('auth.no_account', "Vous n'avez pas de compte ? ")}</Text>
          <TouchableOpacity onPress={() => Linking.openURL('https://dizzitup.com/user-registration-login?mode=signup')}>
            <Text style={styles.signupLink}>{t('auth.sign_up', "S'inscrire")}</Text>
          </TouchableOpacity>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <AppToast 
        visible={toastInfo.visible} 
        title={toastInfo.title} 
        message={toastInfo.message} 
        type={toastInfo.type} 
        onClose={() => setToastInfo({ ...toastInfo, visible: false })} 
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    paddingTop: Platform.OS === 'android' ? Math.max(StatusBar.currentHeight || 0, 44) + 6 : 10,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: isSmallScreen ? 16 : theme.spacing.lg,
    paddingTop: 8,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: isShortScreen ? 14 : theme.spacing.xl,
  },
  headerSpacer: {
    width: 44,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: theme.typography.sizes.base,
    color: theme.colors.primary,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: isShortScreen ? 12 : theme.spacing.xl,
  },
  logo: {
    width: isShortScreen ? 60 : 80,
    height: isShortScreen ? 60 : 80,
    marginBottom: isShortScreen ? 12 : theme.spacing.lg,
    borderRadius: isShortScreen ? 30 : 40, // Ensure perfect circle
  },
  mainTitle: {
    fontFamily: theme.typography.fontFamily.heading,
    fontSize: isShortScreen ? 24 : 30,
    color: theme.colors.primary,
    marginBottom: 4,
  },
  subTitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: isShortScreen ? 12 : theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: isShortScreen ? 16 : 22,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    marginBottom: isShortScreen ? 14 : theme.spacing.xl,
  },
  tab: {
    flex: 1,
    paddingVertical: isShortScreen ? 10 : theme.spacing.md,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.accent,
  },
  tabText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
  },
  activeTabText: {
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.primary,
  },
  formContainer: {
    marginBottom: 8,
  },
  passwordContainer: {
    marginTop: 8,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginTop: 6,
    marginBottom: 4,
  },
  forgotPasswordText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 12,
    color: theme.colors.textSecondary,
    textDecorationLine: 'underline',
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  errorText: {
    color: '#DC2626',
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 12,
    textAlign: 'center',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: isShortScreen ? 12 : theme.spacing.xl,
    marginBottom: isShortScreen ? 8 : theme.spacing.lg,
  },
  signupText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
  },
  signupLink: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.accent,
  },
});
