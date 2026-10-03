import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme/theme';
import { DizzitButton } from '../components/DizzitButton';
import { Stepper } from '../components/Stepper';
import { SecurityBanner } from '../components/SecurityBanner';
import { SocialLogins } from '../components/SocialLogins';
import { FooterTerms } from '../components/FooterTerms';
import { OtpInput } from '../components/OtpInput';
import { useApp } from '../context/AppContext';

export default function VerificationScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { t, user } = useApp();
  const displayedEmail = route.params?.emailOrPhone || route.params?.email || route.params?.phone || user?.email || '';
  const [code, setCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(45);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timerId = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timerId);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleResend = () => {
    setIsResending(true);
    // Simulate API call to resend OTP
    setTimeout(() => {
      setIsResending(false);
      setTimeLeft(45);
      alert(t('verificationStep.newCodeSent', 'New code sent (Simulated)'));
    }, 1000);
  };

  const handleVerify = () => {
    if (code.length < 6) return;
    
    setIsLoading(true);
    // Simulate API call to verify OTP
    const payload = { code };
    console.log("Submitting OTP payload:", payload);
    
    setTimeout(() => {
      setIsLoading(false);
      navigation.navigate('SecureAccountScreen');
    }, 1500);
  };

  // Custom icon for Security Banner (The D coin)
  const DizzitCoinIcon = () => (
    <View style={styles.coinIconContainer}>
      <Image 
        source={require('../../assets/brand/dizzitup_logo_cercle.png')} 
        style={styles.coinImage}
        resizeMode="contain"
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
          <View style={styles.loginLinkContainer}>
            <Text style={styles.loginText}>{t('verificationStep.alreadyAccount', 'Already have an account?')} </Text>
            <TouchableOpacity onPress={() => navigation.navigate('LoginScreen')}>
              <Text style={styles.loginLink}>{t('verificationStep.signIn', 'Sign in')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Title Area */}
        <View style={styles.titleContainer}>
          <Image 
            source={require('../../assets/brand/dizzitup_logo.jpeg')} 
            style={styles.logo} 
            resizeMode="contain"
          />
          <Text style={styles.mainTitle}>{t('verificationStep.verifyAccount', 'Verify your account')}</Text>
          <Text style={styles.subTitle}>
            {t('verificationStep.almostThere', 'One more step to secure your account\nand enjoy DizzitUp.')}
          </Text>
        </View>

        {/* Stepper */}
        <Stepper currentStep={2} />

        {/* Verification Form */}
        <View style={styles.formContainer}>
          <Text style={styles.sectionTitle}>{t('verificationStep.verifyEmailPhone', 'Verify your email or phone')}</Text>
          
          <Text style={styles.verificationText}>
            {t('verificationStep.codeSentTo', 'We sent a verification code to')}{'\n'}
            <Text style={styles.emailText}>{displayedEmail}</Text>{'   '}
            <Text style={styles.modifyText} onPress={() => navigation.goBack()}>{t('common.edit', 'Edit')}</Text>
          </Text>

          <Text style={styles.sectionSubtitle}>{t('verificationStep.enter6Digit', 'Enter the 6-digit code')}</Text>
          
          <OtpInput length={6} value={code} onChange={setCode} />

          {/* Timer */}
          <TouchableOpacity 
            style={styles.timerContainer} 
            onPress={timeLeft === 0 && !isResending ? handleResend : undefined}
            disabled={timeLeft > 0 || isResending}
          >
            <Ionicons name="time-outline" size={20} color={theme.colors.accent} />
            <Text style={[styles.timerText, isResending && {color: theme.colors.textSecondary}]}>
              {isResending ? t('verificationStep.resending', 'Sending...') : (timeLeft > 0 ? t('verificationStep.resendIn', { time: formatTime(timeLeft), defaultValue: `Resend code in ${formatTime(timeLeft)}` }) : t('verificationStep.resendNow', 'Resend code now'))}
            </Text>
          </TouchableOpacity>

          {/* Security Banner */}
          <SecurityBanner icon={<DizzitCoinIcon />} />

          <DizzitButton 
            title={t('verificationStep.continueBtn', 'Continue')} 
            icon={<Ionicons name="arrow-forward" size={20} color={theme.colors.textPrimary} />} 
            onPress={handleVerify}
            isLoading={isLoading}
            disabled={code.length < 6}
          />
        </View>

        {/* Social Logins */}
        <SocialLogins />

        {/* Footer */}
        <FooterTerms />
        
        {/* Spacer */}
        <View style={{height: 40}} />
      </ScrollView>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg, },
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
  formContainer: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.base,
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  verificationText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.primary,
    lineHeight: 22,
    marginBottom: theme.spacing.lg,
  },
  emailText: {
    fontFamily: theme.typography.fontFamily.semiBold,
  },
  modifyText: {
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.accent,
  },
  sectionSubtitle: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  timerText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.primary,
    marginLeft: theme.spacing.xs,
  },
  coinIconContainer: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coinImage: {
    width: 36,
    height: 36,
    transform: [{ scale: 2 }], // Doubler la taille visuelle pour compenser le padding de l'image
  }
});
