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
      // Real Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        throw error;
      }

      console.log("✅ Supabase login successful", data.user.id);
      setIsLoading(false);
      navigation.navigate('HomeScreen');
    } catch (error) {
      console.error("❌ Login error:", error.message);
      setIsLoading(false);
      // Ideally show an error toast here
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('HomeScreen')}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{language === 'fr' ? 'Connexion' : 'Log In'}</Text>
          <TouchableOpacity style={styles.languageSelector} onPress={toggleLanguage} accessibilityLabel="Changer la langue / Switch language">
            <Image 
              source={{ uri: `https://flagcdn.com/w40/${getFlagCode(language)}.png` }} 
              style={{ width: 22, height: 15, borderRadius: 3, marginRight: 6 }} 
            />
            <Text style={styles.languageText}>{language.toUpperCase()}</Text>
            <Ionicons name="chevron-down" size={16} color={theme.colors.primary} />
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

          

          <View style={{marginTop: theme.spacing.md}}>
            <DizzitButton 
              title={t('login.login_button', 'Log in')} 
              onPress={handleLogin}
              isLoading={isLoading}
              disabled={!email || !password}
            />
          </View>
        </View>

        {/* Social Logins */}
        <View style={{marginTop: theme.spacing.lg}}>
          <SocialLogins variant="square" />
        </View>

        {/* Signup Link */}
        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>{language === 'fr' ? "Vous n'avez pas de compte ? " : "Don't have an account? "}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('RegisterScreen')}>
            <Text style={styles.signupLink}>{language === 'fr' ? "S'inscrire" : 'Sign up'}</Text>
          </TouchableOpacity>
        </View>
        
      </ScrollView>

      {/* Features Banner pinned to bottom */}
      <FeaturesBanner />
      
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    paddingTop: Platform.OS === 'android' ? Math.max(StatusBar.currentHeight || 0, 44) + 6 : 14,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: 20, // Extra padding before banner
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xl, },
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
  flag: {
    flexDirection: 'row',
    width: 18,
    height: 12,
    marginRight: 6,
    borderRadius: 2,
    overflow: 'hidden',
  },
  flagStripe: {
    flex: 1,
    height: '100%',
  },
  languageText: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 12,
    color: theme.colors.primary,
    marginRight: 4,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  logo: {
    width: 180,
    height: 45,
    marginBottom: theme.spacing.md,
  },
  mainTitle: {
    fontFamily: theme.typography.fontFamily.heading,
    fontSize: 32,
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  subTitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    marginBottom: theme.spacing.xl,
  },
  tab: {
    flex: 1,
    paddingVertical: theme.spacing.md,
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
    marginBottom: theme.spacing.md,
  },
  passwordContainer: {
    marginTop: theme.spacing.md,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  forgotPasswordText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 13,
    color: theme.colors.textSecondary,
    textDecorationLine: 'underline',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
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
