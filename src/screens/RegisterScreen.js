import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme/theme';
import { DizzitInput } from '../components/DizzitInput';
import { DizzitButton } from '../components/DizzitButton';
import { Stepper } from '../components/Stepper';
import { SecurityBanner } from '../components/SecurityBanner';
import { SocialLogins } from '../components/SocialLogins';
import { FooterTerms } from '../components/FooterTerms';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [parrain, setParrain] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const getPasswordStrength = (pass) => {
    if (!pass) return 0; // Vide = 0 barres
    let score = 0;
    if (pass.length >= 6) score = 1; // Faible
    if (pass.length >= 8 && /[0-9]/.test(pass) && /[A-Za-z]/.test(pass)) score = 2; // Moyen
    if (score === 2 && /[^A-Za-z0-9]/.test(pass)) score = 3; // Fort
    return score;
  };

  const strength = getPasswordStrength(password);
  
  const getBarColor = (index) => {
    if (strength === 0) return theme.colors.border;
    if (strength === 1 && index === 0) return theme.colors.error;
    if (strength === 2 && index <= 1) return theme.colors.warning;
    if (strength === 3 && index <= 2) return theme.colors.success;
    return theme.colors.border;
  };

  const handleRegister = () => {
    if (!email || !password || strength < 2) return; // Basic validation
    
    setIsLoading(true);
    // Simulate API call to POST /auth/register
    const payload = {
      emailOrPhone: email,
      password: password,
      referralCode: parrain || undefined
    };
    
    console.log("Submitting register payload:", payload);
    
    setTimeout(() => {
      setIsLoading(false);
      // Navigate to OTP Verification screen
      alert("Inscription validée ! Passage à l'étape OTP (Simulé)");
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
          <View style={styles.loginLinkContainer}>
            <Text style={styles.loginText}>Déjà un compte ? </Text>
            <TouchableOpacity>
              <Text style={styles.loginLink}>Se connecter</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Title Area */}
        <View style={styles.titleContainer}>
          <Image 
            source={require('../../dizzitup logo.jpeg')} 
            style={styles.logo} 
            resizeMode="contain"
          />
          <Text style={styles.mainTitle}>Créez un compte</Text>
          <Text style={styles.subTitle}>
            Rejoignez <Text style={{color: theme.colors.accent}}>DizzitUp</Text> et accédez à tout un{'\n'}
            écosystème financier et digital.
          </Text>
        </View>

        {/* Stepper */}
        <Stepper currentStep={1} />

        {/* Form */}
        <View style={styles.formContainer}>
          <DizzitInput
            label="Entrez votre email ou votre numéro"
            placeholder="Entrez votre email ou votre numéro"
            value={email}
            onChangeText={setEmail}
            iconLeft={<Ionicons name="mail-outline" size={20} color={theme.colors.primary} />}
          />
          
          <DizzitInput
            label="Créez votre mot de passe"
            placeholder="Créez votre mot de passe"
            isPassword
            value={password}
            onChangeText={setPassword}
            iconLeft={<Ionicons name="lock-closed-outline" size={20} color={theme.colors.primary} />}
          />
          
          {/* Password Strength */}
          <View style={styles.strengthContainer}>
            <View style={styles.strengthBarContainer}>
              <View style={[styles.strengthBar, {backgroundColor: getBarColor(0)}]} />
              <View style={[styles.strengthBar, {backgroundColor: getBarColor(1)}]} />
              <View style={[styles.strengthBar, {backgroundColor: getBarColor(2)}]} />
            </View>
            <View style={styles.strengthLabels}>
              <Text style={[styles.strengthLabel, strength === 1 && {color: theme.colors.error}]}>Faible</Text>
              <Text style={[styles.strengthLabel, strength === 2 && {color: theme.colors.warning}]}>Moyen</Text>
              <Text style={[styles.strengthLabel, strength === 3 && {color: theme.colors.success}]}>Fort</Text>
            </View>
          </View>

          <DizzitInput
            label="Entrez votre code parrain (optionnel)"
            placeholder="Entrez votre code parrain si vous en avez un"
            value={parrain}
            onChangeText={setParrain}
            iconLeft={<Ionicons name="people-outline" size={20} color={theme.colors.primary} />}
          />

          {/* Security Banner */}
          <SecurityBanner />

          <DizzitButton 
            title="Continuer" 
            icon={<Ionicons name="arrow-forward" size={20} color={theme.colors.textPrimary} />} 
            style={{marginTop: theme.spacing.sm}}
            onPress={handleRegister}
            isLoading={isLoading}
            disabled={!email || !password || strength < 2}
          />
        </View>

        {/* Social Logins */}
        <SocialLogins />

        {/* Footer */}
        <FooterTerms />
        
        {/* Spacer for bottom padding */}
        <View style={{height: 40}} />
      </ScrollView>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  backButton: {
    borderWidth: 1,
    borderColor: theme.colors.accent,
    borderRadius: theme.radii.sm,
    padding: 6,
  },
  loginLinkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loginText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.primary,
  },
  loginLink: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.accent,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  logo: {
    width: 200,
    height: 50,
    marginBottom: theme.spacing.sm,
  },
  mainTitle: {
    fontFamily: theme.typography.fontFamily.heading,
    fontSize: theme.typography.sizes.heading,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  subTitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.md,
  },
  stepItem: {
    alignItems: 'center',
    width: 70,
  },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepActive: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  stepText: {
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.primary,
  },
  stepTextActive: {
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.surface,
  },
  stepLabel: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 10,
    color: theme.colors.textSecondary,
  },
  stepLabelActive: {
    color: theme.colors.accent,
  },
  stepLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
    marginTop: 18, // half of circle height
    marginHorizontal: 8,
  },
  formContainer: {
    marginBottom: theme.spacing.lg,
  },
  strengthContainer: {
    marginTop: -theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  strengthBarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  strengthBar: {
    height: 4,
    flex: 1,
    borderRadius: 2,
    marginHorizontal: 2,
  },
  strengthLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  strengthLabel: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 10,
    color: theme.colors.textSecondary,
    width: '33%',
    textAlign: 'center',
  },
  securityBanner: {
    flexDirection: 'row',
    backgroundColor: '#FFF8ED', // Light beige/amber background
    borderRadius: theme.radii.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: '#FBE3BA',
  },
  shieldIconContainer: {
    marginRight: theme.spacing.md,
    justifyContent: 'center',
  },
  securityTexts: {
    flex: 1,
  },
  securityTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.primary,
    marginBottom: 4,
  },
  securityDesc: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11,
    color: theme.colors.textSecondary,
    lineHeight: 16,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  dividerText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginHorizontal: theme.spacing.md,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xl,
  },
  socialButton: {
    width: '22%',
    aspectRatio: 1,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 9,
    color: theme.colors.textPrimary,
    marginTop: 6,
  },
  footerText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  linkText: {
    color: theme.colors.accent,
    fontFamily: theme.typography.fontFamily.medium,
  }
});
