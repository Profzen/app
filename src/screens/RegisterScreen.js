import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme/theme';
import { DizzitInput } from '../components/DizzitInput';
import { DizzitButton } from '../components/DizzitButton';
import { Stepper } from '../components/Stepper';
import { SecurityBanner } from '../components/SecurityBanner';
import { SocialLogins } from '../components/SocialLogins';
import { FooterTerms } from '../components/FooterTerms';
import AppToast from '../components/AppToast';
import { useApp } from '../context/AppContext';
import { supabase } from '../services/supabaseClient';
import Constants from 'expo-constants';
import * as Application from 'expo-application';
import { isSmallScreen, isShortScreen } from '../utils/responsive';
import AppSelect from '../components/AppSelect';
import { ALL_COUNTRIES, getCountryName, guessCountryByPhone } from '../utils/countriesData';
import { parsePhoneNumberFromString, parsePhoneNumberWithError, AsYouType, isValidPhoneNumber } from 'libphonenumber-js';

export default function RegisterScreen({ route }) {
  const navigation = useNavigation();
  const { language, t } = useApp();
  const initialRef = route?.params?.ref || route?.params?.parrain || route?.params?.referral_code || '';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [parrain, setParrain] = useState(initialRef);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [toastInfo, setToastInfo] = useState({ visible: false, title: '', message: '', type: 'success' });

  const handlePhoneChange = (val) => {
    let currentCountry = country;
    if (val.startsWith('+') && !country) {
      try {
        const phoneNumberObj = parsePhoneNumberFromString(val);
        if (phoneNumberObj && phoneNumberObj.country) {
          const matched = ALL_COUNTRIES.find(c => c.code === phoneNumberObj.country);
          if (matched) {
            currentCountry = matched.name;
            setCountry(matched.name);
            if (errors.country) setErrors(prev => ({ ...prev, country: null }));
          }
        }
      } catch (e) {}

      if (!currentCountry) {
        const guessed = guessCountryByPhone(val);
        if (guessed) {
          currentCountry = guessed.name;
          setCountry(guessed.name);
          if (errors.country) setErrors(prev => ({ ...prev, country: null }));
        }
      }
    }
    const selectedCountryCode = ALL_COUNTRIES.find(c => c.name === currentCountry)?.code || 'FR';
    const formatter = new AsYouType(selectedCountryCode);
    const formatted = formatter.input(val.replace(/[^0-9\s-+]/g, ''));
    setPhone(formatted);
    if (errors.phone) setErrors(prev => ({ ...prev, phone: null }));
  };

  const countryOptions = useMemo(() => {
    return ALL_COUNTRIES.map((c) => ({
      value: c.name,
      label: getCountryName(c.code, language),
      subtitle: c.dial,
      flagUrl: `https://flagcdn.com/w40/${c.code.toLowerCase()}.png`,
    })).sort((a, b) => a.label.localeCompare(b.label));
  }, [language]);

  useEffect(() => {
    const incomingRef = route?.params?.ref || route?.params?.parrain || route?.params?.referral_code;
    if (incomingRef) {
      setParrain(incomingRef);
    }
    
    // Auto-detect country
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => {
        if (data && data.country_name) {
          const matchedCountry = ALL_COUNTRIES.find(c => c.name === data.country_name);
          if (matchedCountry) {
            setCountry(matchedCountry.name);
          }
        }
      })
      .catch(() => {}); // silently fail if blocked
  }, [route?.params]);

  const appVersion = Application.nativeApplicationVersion || Constants?.expoConfig?.version || '1.0.0';
  const appBuildNumber = Application.nativeBuildVersion || '—';

  const getPasswordStrength = (pass) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 6) score = 1;
    if (pass.length >= 8 && /[0-9]/.test(pass) && /[A-Za-z]/.test(pass)) score = 2;
    if (score === 2 && /[^A-Za-z0-9]/.test(pass)) score = 3;
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

  const handleRegister = async () => {
    console.log('[REGISTER] pressed');
    console.log('[REGISTER] check email:', !!email);
    console.log('[REGISTER] check password:', !!password);
    console.log('[REGISTER] check confirmPassword:', !!confirmPassword);
    console.log('[REGISTER] check firstName:', !!firstName);
    console.log('[REGISTER] check lastName:', !!lastName);
    console.log('[REGISTER] check country:', !!country);
    console.log('[REGISTER] check phone:', !!phone);
    console.log('[REGISTER] check strength:', strength >= 2);

    const newErrors = {};
    if (!firstName) newErrors.firstName = t('auth.errorRequired', 'Required');
    if (!lastName) newErrors.lastName = t('auth.errorRequired', 'Required');
    if (!email) newErrors.email = t('auth.errorRequired', 'Required');
    if (!country) newErrors.country = t('auth.errorRequired', 'Required');
    if (!password) newErrors.password = t('auth.errorRequired', 'Required');
    if (!confirmPassword) newErrors.confirmPassword = t('auth.errorRequired', 'Required');
    if (strength < 2) newErrors.password = t('auth.pwdWeak', "Weak");

    const selectedCountryCode = ALL_COUNTRIES.find(c => c.name === country)?.code || 'FR';
    if (!phone) {
       newErrors.phone = t('auth.errorRequired', 'Required');
    } else {
       const isPhoneValid = isValidPhoneNumber(phone, selectedCountryCode);
       if (!isPhoneValid) {
         newErrors.phone = t('auth.errorInvalidPhone', 'Invalid phone number');
       }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      console.log('[REGISTER] validation failed with errors:', Object.keys(newErrors));
      return;
    }
    setErrors({});
    
    console.log('[REGISTER] password match check:', password === confirmPassword);
    if (password !== confirmPassword) {
      setToastInfo({ visible: true, title: t('common.error', 'Error'), message: t('auth.passwordsNotMatch', 'Passwords do not match'), type: 'error' });
      return;
    }
    
    setIsLoading(true);

    try {
      const credentials = { email, password };
      
      let e164Phone = phone;
      try {
        const selectedCountryCode = ALL_COUNTRIES.find(c => c.name === country)?.code || 'FR';
        const pn = parsePhoneNumberWithError(phone, selectedCountryCode);
        e164Phone = pn.number;
      } catch(e) {}

      console.log('[REGISTER] calling signUp');
      const { data, error } = await supabase.auth.signUp({
        ...credentials,
        options: {
          data: {
            role: 'user',
            auth_provider: 'email',
            referral_code: parrain || null,
            first_name: firstName,
            last_name: lastName,
            phone: e164Phone,
            country: country,
            signup_platform: Platform.OS,
            signup_app_version: Constants?.expoConfig?.version || '1.0.0'
          }
        }
      });

      if (error) {
        console.log('[REGISTER] signUp result: error ->', error.message);
        throw error;
      }
      
      console.log('[REGISTER] signUp result: success');

      // If the email already exists, Supabase returns the user but with empty identities (for security)
      if (data?.user && data.user.identities && data.user.identities.length === 0) {
        console.log('[REGISTER] identity check failed (email already exists)');
        // Try to fetch the provider they originally signed up with
        const { data: provider, error: rpcError } = await supabase.rpc('get_auth_provider', { lookup_email: email });
        
        if (!rpcError && provider) {
          if (provider === 'google') {
            throw new Error(t('auth.emailExistsGoogle', 'This email already exists with Google login. Please log in using your Google account.'));
          } else if (provider === 'facebook') {
            throw new Error(t('auth.emailExistsFacebook', 'This email already exists with Facebook login. Please log in using your Facebook account.'));
          } else if (provider === 'apple') {
            throw new Error(t('auth.emailExistsApple', 'This email already exists with Apple login. Please log in using your Apple account.'));
          } else {
            throw new Error(t('auth.emailExistsEmail', 'This email already exists. Please log in with your password.'));
          }
        } else {
           throw new Error(t('auth.emailExistsEmail', 'This email already exists. Please log in with your password.'));
        }
      }

      setToastInfo({ visible: true, title: t('common.success', "Success"), message: t('auth.registrationSuccessMsg', 'Your verification code is ready.'), type: 'success' });
      setTimeout(() => navigation.navigate('VerificationScreen', { emailOrPhone: email }), 900);

    } catch (error) {
       console.log('[REGISTER] caught error:', error.message);
       setToastInfo({ visible: true, title: t('common.error', 'Error'), message: error.message, type: 'error' });
    } finally {
       setIsLoading(false);
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
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={22} color={theme.colors.primary} />
          </TouchableOpacity>
          <View style={styles.loginLinkContainer}>
            <Text style={styles.loginText}>{t('auth.alreadyHaveAccount', "Already have an account?")}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('LoginScreen')}>
              <Text style={styles.loginLink}>{t('auth.login', 'Log in')}</Text>
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
          <Text style={styles.mainTitle}>{t('auth.createAccount', "Create your account")}</Text>
          <Text style={styles.subTitle}>
            {t('auth.signUpSubtitle', "Create your global account to instantly send stablecoins, cover family bills, buy goods, and empower African businesses.")}
          </Text>
        </View>

        {/* Stepper */}
        <Stepper currentStep={1} />

        {/* Form */}
        <View style={styles.formContainer}>
          <DizzitInput
            label={t('personalAccount.firstName', 'First Name')}
            placeholder={t('personalAccount.firstName', 'First Name')}
            value={firstName}
            onChangeText={(val) => { setFirstName(val); if(errors.firstName) setErrors(prev => ({...prev, firstName: null})); }}
            iconLeft={<Ionicons name="person-outline" size={18} color="#64748B" />}
          />
          {errors.firstName && <Text style={{ color: theme.colors.error, fontSize: 12, marginTop: -8, marginBottom: 8, marginLeft: 4 }}>{errors.firstName}</Text>}
          
          <DizzitInput
            label={t('personalAccount.lastName', 'Last Name')}
            placeholder={t('personalAccount.lastName', 'Last Name')}
            value={lastName}
            onChangeText={(val) => { setLastName(val); if(errors.lastName) setErrors(prev => ({...prev, lastName: null})); }}
            iconLeft={<Ionicons name="person-outline" size={18} color="#64748B" />}
          />
          {errors.lastName && <Text style={{ color: theme.colors.error, fontSize: 12, marginTop: -8, marginBottom: 8, marginLeft: 4 }}>{errors.lastName}</Text>}
          
          <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 14, color: theme.colors.primary, marginBottom: 6 }}>
            {t('personalAccount.country', 'Country of Residence')}
          </Text>
          <View style={{ marginBottom: errors.country ? 8 : 16, padding: 1.5, borderRadius: 12, backgroundColor: '#E2E8F0' }}>
            <AppSelect
              value={country}
              options={countryOptions}
              onChange={(val) => {
                const prevDial = ALL_COUNTRIES.find(c => c.name === country)?.dial || '';
                setCountry(val);
                if (errors.country) setErrors(prev => ({ ...prev, country: null }));
                // Only pre-fill the dial code while the phone is still empty (or only holds the previous dial code).
                // Never rewrite a number the user typed: country of residence and phone country can differ (diaspora).
                const dial = ALL_COUNTRIES.find(c => c.name === val)?.dial || '';
                const current = (phone || '').trim();
                if (dial && (current === '' || current === '+' || (prevDial && current === prevDial))) {
                  setPhone(dial);
                  if (errors.phone) setErrors(prev => ({ ...prev, phone: null }));
                }
              }}
              title={t('personalAccount.country', 'Country of Residence')}
              placeholder={t('personalAccount.selectCountry', 'Select your country')}
              searchPlaceholder={t('personalAccount.searchCountry', 'Search country')}
              style={{ backgroundColor: '#F8FAFC', borderRadius: 10.5, minHeight: 44, paddingHorizontal: 12, borderWidth: 0, margin: 0 }}
              textStyle={{ fontFamily: 'Inter_500Medium', fontSize: 14, color: theme.colors.textPrimary, marginLeft: 8 }}
              renderLeading={(sel) => (
                sel?.flagUrl ? (
                  <Image source={{ uri: sel.flagUrl }} style={{ width: 22, height: 14, borderRadius: 2 }} />
                ) : (
                  <Ionicons name="globe-outline" size={18} color="#64748B" />
                )
              )}
            />
          </View>
          {errors.country && <Text style={{ color: theme.colors.error, fontSize: 12, marginTop: -8, marginBottom: 8, marginLeft: 4 }}>{errors.country}</Text>}

          <DizzitInput
            label={t('personalAccount.phone', 'Phone Number')}
            placeholder={t('personalAccount.phone', 'Phone Number')}
            value={phone}
            onChangeText={handlePhoneChange}
            iconLeft={<Ionicons name="call-outline" size={18} color="#64748B" />}
            keyboardType="phone-pad"
          />
          {errors.phone && <Text style={{ color: theme.colors.error, fontSize: 12, marginTop: -8, marginBottom: 8, marginLeft: 4 }}>{errors.phone}</Text>}

          <DizzitInput
            label={t('auth.email', 'Email')}
            placeholder={t('auth.emailPlaceholder', 'Enter your email')}
            value={email}
            onChangeText={(val) => { setEmail(val); if(errors.email) setErrors(prev => ({...prev, email: null})); }}
            iconLeft={<Ionicons name="mail-outline" size={18} color="#64748B" />}
          />
          {errors.email && <Text style={{ color: theme.colors.error, fontSize: 12, marginTop: -8, marginBottom: 8, marginLeft: 4 }}>{errors.email}</Text>}
          
          <DizzitInput
            label={t('auth.password', "Password")}
            placeholder={t('auth.enterPassword', "Enter your password")}
            isPassword
            value={password}
            onChangeText={(val) => { setPassword(val); if(errors.password) setErrors(prev => ({...prev, password: null})); }}
            iconLeft={<Ionicons name="lock-closed-outline" size={18} color="#64748B" />}
          />
          {errors.password && <Text style={{ color: theme.colors.error, fontSize: 12, marginTop: -8, marginBottom: 8, marginLeft: 4 }}>{errors.password}</Text>}
          
          <DizzitInput
            label={t('auth.confirmPassword', 'Confirm Password')}
            placeholder={t('auth.confirmPasswordPlaceholder', 'Confirm your password')}
            isPassword
            value={confirmPassword}
            onChangeText={(val) => { setConfirmPassword(val); if(errors.confirmPassword) setErrors(prev => ({...prev, confirmPassword: null})); }}
            iconLeft={<Ionicons name="shield-checkmark-outline" size={18} color="#64748B" />}
          />
          {errors.confirmPassword && <Text style={{ color: theme.colors.error, fontSize: 12, marginTop: -8, marginBottom: 8, marginLeft: 4 }}>{errors.confirmPassword}</Text>}

          {/* Password Strength */}
          <View style={styles.strengthContainer}>
            <View style={styles.strengthBarContainer}>
              <View style={[styles.strengthBar, {backgroundColor: getBarColor(0)}]} />
              <View style={[styles.strengthBar, {backgroundColor: getBarColor(1)}]} />
              <View style={[styles.strengthBar, {backgroundColor: getBarColor(2)}]} />
            </View>
            <View style={styles.strengthLabels}>
              <Text style={[styles.strengthLabel, strength === 1 && {color: theme.colors.error}]}>{t('auth.pwdWeak', 'Weak')}</Text>
              <Text style={[styles.strengthLabel, strength === 2 && {color: theme.colors.warning}]}>{t('auth.pwdMedium', 'Medium')}</Text>
              <Text style={[styles.strengthLabel, strength === 3 && {color: theme.colors.success}]}>{t('auth.pwdStrong', 'Strong')}</Text>
            </View>
          </View>

          <DizzitInput
            label={t('auth.referralCodeLabel', 'Enter referral code (optional)')}
            placeholder={t('auth.referralCodePlaceholder', 'Enter referral code if you have one')}
            value={parrain}
            onChangeText={setParrain}
            iconLeft={<Ionicons name="people-outline" size={18} color="#64748B" />}
          />

          {/* Security Banner */}
          <SecurityBanner />

          <DizzitButton 
            title={t('btnContinue', 'Continue')}
            icon={<Ionicons name="arrow-forward" size={20} color={theme.colors.textPrimary} />} 
            style={{marginTop: theme.spacing.sm}}
            onPress={handleRegister}
            isLoading={isLoading}
          />
        </View>

        {/* Social Logins */}
        <SocialLogins />

        {/* Merchant Link (temporarily disabled) */}
        {/* <View style={styles.merchantLinkContainer}>
          <View style={styles.merchantPromoBox}>
            <View style={styles.merchantPromoIcon}>
              <Ionicons name="storefront-outline" size={20} color={theme.colors.accent} />
            </View>
            <View style={styles.merchantPromoTextContainer}>
              <Text style={styles.merchantPromoTitle}>{t('auth.areYouBusiness', 'Are you a business or shop owner?')}</Text>
              <Text style={styles.merchantPromoSub}>{t('auth.merchantSub', 'Accept payments easily')}</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('MerchantRegistrationScreen')} style={styles.merchantPromoButton}>
              <Text style={styles.merchantPromoButtonText}>{t('auth.registerMerchant', 'Register')}</Text>
            </TouchableOpacity>
          </View>
        </View> */}

        {/* Footer */}
        <FooterTerms />

        {/* Version & Build info for testers */}
        <View style={styles.versionFooter}>
          <Text style={styles.versionFooterText}>
            {`v${appVersion} • Build ${appBuildNumber}`}
          </Text>
        </View>
        
        <View style={{height: 40}} />
      </ScrollView>
      <AppToast visible={toastInfo.visible} title={toastInfo.title} message={toastInfo.message} type={toastInfo.type} onClose={() => setToastInfo({ ...toastInfo, visible: false })} />
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
    marginBottom: isShortScreen ? 10 : theme.spacing.lg,
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
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radii.full,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
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
    marginBottom: isShortScreen ? 10 : theme.spacing.xl,
  },
  logo: {
    width: isShortScreen ? 140 : 180,
    height: isShortScreen ? 36 : 45,
    marginBottom: isShortScreen ? 4 : theme.spacing.sm,
  },
  mainTitle: {
    fontFamily: theme.typography.fontFamily.heading,
    fontSize: isShortScreen ? 22 : theme.typography.sizes.heading,
    color: theme.colors.primary,
    marginBottom: 4,
  },
  subTitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: isShortScreen ? 12 : theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: isShortScreen ? 16 : 20,
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
    marginBottom: 8,
    marginTop: 4,
    paddingHorizontal: 4,
  },
  strengthBar: {
    height: 5,
    flex: 1,
    borderRadius: 3,
    marginHorizontal: 4,
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
  merchantLinkContainer: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  merchantPromoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: theme.radii.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  merchantPromoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFBEB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  merchantPromoTextContainer: {
    flex: 1,
  },
  merchantPromoTitle: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 12,
    color: theme.colors.primary,
  },
  merchantPromoSub: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 10,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  merchantPromoButton: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radii.full,
    borderWidth: 1,
    borderColor: theme.colors.accent,
  },
  merchantPromoButtonText: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 10,
    color: theme.colors.accent,
  },
  versionFooter: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    marginBottom: 6,
  },
  versionFooterText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 11,
    color: '#94A3B8',
    letterSpacing: 0.4,
  },
});
