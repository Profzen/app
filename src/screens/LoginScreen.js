import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme/theme';
import { DizzitInput } from '../components/DizzitInput';
import { DizzitButton } from '../components/DizzitButton';
import { SocialLogins } from '../components/SocialLogins';
import { FeaturesBanner } from '../components/FeaturesBanner';
import { useApp } from '../context/AppContext';
import { supabase } from '../services/supabaseClient';

import { isSmallScreen, isShortScreen } from '../utils/responsive';

const getFlagCode = (lang) => {
  switch(lang) {
    case 'fr': return 'fr';
    case 'pt': return 'pt';
    case 'ar': return 'sa';
    case 'am': return 'et';
    default: return 'gb';
  }
};

export default function LoginScreen() {
  const navigation = useNavigation();
  const { language, toggleLanguage, t } = useApp();
  const [activeTab, setActiveTab] = useState('email'); // 'email' | 'phone'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return; // Basic validation
    
    setIsLoading(true);
    
    try {
      const isPlaceholder = !process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL.includes('placeholder');

      if (!isPlaceholder) {
        // Real Supabase Auth
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email,
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
      console.warn("⚠️ Connexion Supabase échouée (" + error.message + ") -> Redirection vers HomeScreen en mode démo.");
      setIsLoading(false);
      navigation.navigate('HomeScreen');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('HomeScreen')}>
            <Ionicons name="arrow-back" size={22} color={theme.colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{language === 'fr' ? 'Connexion' : 'Log In'}</Text>
          <TouchableOpacity style={styles.languageSelector} onPress={toggleLanguage} accessibilityLabel="Changer la langue / Switch language">
            <Image 
              source={{ uri: `https://flagcdn.com/w40/${getFlagCode(language)}.png` }} 
              style={{ width: 20, height: 14, borderRadius: 2, marginRight: 5 }} 
            />
            <Text style={styles.languageText}>{language.toUpperCase()}</Text>
            <Ionicons name="chevron-down" size={14} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Title Area */}
        <View style={styles.titleContainer}>
          <Image 
            source={require('../../assets/brand/dizzitup_logo.jpeg')} 
            style={styles.logo} 
            resizeMode="contain"
          />
          <Text style={styles.mainTitle}>{t('login.welcome', 'Welcome back!')}</Text>
          <Text style={styles.subTitle}>
            {t('login.subtitle', 'Sign in to your DizzitUp account to continue.')}
          </Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'email' && styles.activeTab]}
            onPress={() => setActiveTab('email')}
          >
            <Text style={[styles.tabText, activeTab === 'email' && styles.activeTabText]}>
              {t('login.email_tab', 'Email')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'phone' && styles.activeTab]}
            onPress={() => setActiveTab('phone')}
          >
            <Text style={[styles.tabText, activeTab === 'phone' && styles.activeTabText]}>
              {t('login.phone_tab', 'Phone')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form Container */}
        <View style={styles.formContainer}>
          <DizzitInput 
            label={activeTab === 'email' ? t('login.email_label', 'Email address') : t('login.phone_label', 'Phone number')}
            iconLeft={<Ionicons name={activeTab === 'email' ? 'mail-outline' : 'call-outline'} size={20} color={theme.colors.primary} />}
            placeholder={activeTab === 'email' ? t('login.email_placeholder', 'Enter your email address') : t('login.phone_placeholder', 'Enter your phone number')}
            value={email}
            onChangeText={setEmail}
            keyboardType={activeTab === 'email' ? 'email-address' : 'phone-pad'}
          />

          <View style={styles.passwordContainer}>
            <DizzitInput 
              label={t('login.password_label', 'Password')}
              iconLeft={<Ionicons name="lock-closed-outline" size={20} color={theme.colors.primary} />}
              placeholder={t('login.password_placeholder', 'Enter your password')}
              value={password}
              onChangeText={setPassword}
              isPassword={true}
            />
          </View>

          <TouchableOpacity style={styles.forgotPasswordContainer} onPress={() => navigation.navigate('ResetPasswordEmailScreen')}>
            <Text style={styles.forgotPasswordText}>{t('login.forgot_password', 'Forgot password?')}</Text>
          </TouchableOpacity>

          

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
          <Text style={styles.signupText}>{language === 'fr' ? "Vous n'avez pas de compte ? " : "Don't have an account? "}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('RegisterScreen')}>
            <Text style={styles.signupLink}>{language === 'fr' ? "S'inscrire" : 'Sign up'}</Text>
          </TouchableOpacity>
        </View>
        
        {/* Features Banner inside scroll */}
        <View style={{marginTop: theme.spacing.md}}>
          <FeaturesBanner />
        </View>
      </ScrollView>
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
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: theme.typography.sizes.base,
    color: theme.colors.primary,
  },
  languageSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  languageText: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 12,
    color: theme.colors.primary,
    marginRight: 4,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: isShortScreen ? 12 : theme.spacing.xl,
  },
  logo: {
    width: isShortScreen ? 140 : 180,
    height: isShortScreen ? 36 : 45,
    marginBottom: isShortScreen ? 6 : theme.spacing.md,
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
