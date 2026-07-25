import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme/theme';
import { DizzitInput } from '../components/DizzitInput';
import { DizzitButton } from '../components/DizzitButton';
import { SocialLogins } from '../components/SocialLogins';
import { FeaturesBanner } from '../components/FeaturesBanner';
import { useApp } from '../context/AppContext';

export default function LoginScreen() {
  const navigation = useNavigation();
  const { language, toggleLanguage, t } = useApp();
  const [activeTab, setActiveTab] = useState('email'); // 'email' | 'phone'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    if (!email || !password) return; // Basic validation
    
    setIsLoading(true);
    const payload = {
      identifier: email,
      password: password
    };
    
    console.log("Submitting login payload:", payload);
    
    setTimeout(() => {
      setIsLoading(false);
      navigation.navigate('HomeScreen');
    }, 1500);
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
              source={{ uri: language === 'fr' ? 'https://flagcdn.com/w40/fr.png' : 'https://flagcdn.com/w40/gb.png' }} 
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
          <Text style={styles.mainTitle}>{language === 'fr' ? 'Bienvenue !' : 'Welcome back!'}</Text>
          <Text style={styles.subTitle}>
            {language === 'fr' 
              ? 'Connectez-vous à votre compte ' 
              : 'Sign in to your '}
            <Text style={{fontFamily: theme.typography.fontFamily.bold}}>DizzitUp</Text>
            {language === 'fr' ? ' account\npour continuer.' : ' account\nto continue.'}
          </Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'email' && styles.activeTab]}
            onPress={() => setActiveTab('email')}
          >
            <Text style={[styles.tabText, activeTab === 'email' && styles.activeTabText]}>
              Email
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'phone' && styles.activeTab]}
            onPress={() => setActiveTab('phone')}
          >
            <Text style={[styles.tabText, activeTab === 'phone' && styles.activeTabText]}>
              {language === 'fr' ? 'Téléphone' : 'Phone'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form Container */}
        <View style={styles.formContainer}>
          <DizzitInput 
            label={activeTab === 'email' ? (language === 'fr' ? 'Adresse e-mail' : 'Email address') : (language === 'fr' ? 'Numéro de téléphone' : 'Phone number')}
            iconLeft={<Ionicons name={activeTab === 'email' ? 'mail-outline' : 'call-outline'} size={20} color={theme.colors.primary} />}
            placeholder={activeTab === 'email' ? (language === 'fr' ? 'Entrez votre adresse e-mail' : 'Enter your email address') : (language === 'fr' ? 'Entrez votre numéro de téléphone' : 'Enter your phone number')}
            value={email}
            onChangeText={setEmail}
            keyboardType={activeTab === 'email' ? 'email-address' : 'phone-pad'}
          />

          <View style={styles.passwordContainer}>
            <DizzitInput 
              label={language === 'fr' ? 'Mot de passe' : 'Password'}
              iconLeft={<Ionicons name="lock-closed-outline" size={20} color={theme.colors.primary} />}
              placeholder={language === 'fr' ? 'Entrez votre mot de passe' : 'Enter your password'}
              value={password}
              onChangeText={setPassword}
              isPassword={true}
            />
          </View>

          <TouchableOpacity style={styles.forgotPasswordContainer} onPress={() => navigation.navigate('ResetPasswordEmailScreen')}>
            <Text style={styles.forgotPasswordText}>{language === 'fr' ? 'Mot de passe oublié ?' : 'Forgot password?'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.forgotPasswordContainer} onPress={() => navigation.navigate('PinCodeScreen')}>
            <Text style={styles.forgotPasswordText}>{language === 'fr' ? 'Se connecter avec mon code PIN' : 'Log in with my PIN code'}</Text>
          </TouchableOpacity>

          <View style={{marginTop: theme.spacing.md}}>
            <DizzitButton 
              title={language === 'fr' ? 'Se connecter' : 'Log in'} 
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
    marginBottom: theme.spacing.xl,
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
