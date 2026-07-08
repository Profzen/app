import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme/theme';
import { DizzitButton } from '../components/DizzitButton';
import { Stepper } from '../components/Stepper';
import { SecurityBanner } from '../components/SecurityBanner';
import { FooterTerms } from '../components/FooterTerms';
import { OtpInput } from '../components/OtpInput';
import { BiometricsCard } from '../components/BiometricsCard';

export default function SecureAccountScreen() {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSetupSecurity = () => {
    if (pin.length < 6 || confirmPin !== pin) return;
    
    setIsLoading(true);
    // Simulate API call to save PIN and security preferences
    const payload = {
      pin: pin,
      biometricsEnabled: biometricsEnabled
    };
    
    console.log("Submitting security payload:", payload);
    
    setTimeout(() => {
      setIsLoading(false);
      // Navigate to Dashboard / Home
      alert("Sécurité configurée avec succès ! Redirection vers l'accueil (Simulé)");
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
          <Text style={styles.mainTitle}>Sécurisez votre compte</Text>
          <Text style={styles.subTitle}>
            Dernière étape ! Créez un code PIN à 6 chiffres{'\n'}
            pour protéger votre compte.
          </Text>
        </View>

        {/* Stepper */}
        <Stepper currentStep={3} />

        {/* Create PIN Form */}
        <View style={styles.formContainer}>
          <Text style={styles.sectionTitle}>Créez votre code PIN</Text>
          
          <View style={styles.instructionContainer}>
            <View style={styles.instructionIcon}>
              <Ionicons name="lock-closed-outline" size={20} color={theme.colors.textPrimary} />
            </View>
            <Text style={styles.instructionText}>
              Choisissez un code PIN à 6 chiffres{'\n'}que vous utiliserez pour vous connecter.
            </Text>
          </View>

          <OtpInput length={6} value={pin} onChange={setPin} />

          <Text style={[styles.sectionTitle, {marginTop: theme.spacing.md}]}>Confirmez votre code PIN</Text>
          
          <View style={styles.instructionContainer}>
            <View style={styles.instructionIcon}>
              <Ionicons name="shield-checkmark-outline" size={20} color={theme.colors.textPrimary} />
            </View>
            <Text style={styles.instructionText}>
              Saisissez à nouveau votre code PIN{'\n'}pour confirmer.
            </Text>
          </View>
          
          <OtpInput 
            length={6} 
            value={confirmPin} 
            onChange={setConfirmPin} 
            isError={confirmPin.length === 6 && confirmPin !== pin}
          />
          
          {confirmPin.length === 6 && confirmPin !== pin && (
            <Text style={styles.errorText}>Les codes PIN ne correspondent pas.</Text>
          )}

          {/* Security Banner with specific text for M3 */}
          <SecurityBanner 
            title="Sécurisé et confidentiel"
            description="Votre code PIN est stocké de manière sécurisée et ne peut pas être récupéré par DizzitUp."
          />

          <DizzitButton 
            title="Terminer et accéder à mon compte" 
            icon={<Ionicons name="arrow-forward" size={20} color={theme.colors.textPrimary} />} 
            onPress={handleSetupSecurity}
            isLoading={isLoading}
            disabled={pin.length < 6 || confirmPin !== pin}
          />
        </View>

        {/* Biometrics Divider */}
        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>ou utiliser la biométrie</Text>
          <View style={styles.divider} />
        </View>

        {/* Biometrics Section */}
        <BiometricsCard 
          isEnabled={biometricsEnabled}
          onToggle={() => setBiometricsEnabled(!biometricsEnabled)}
        />

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
  formContainer: {
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.base,
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  instructionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  instructionIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#FFF8ED',
    borderWidth: 1,
    borderColor: '#FBE3BA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  instructionText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 12,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  errorText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.sizes.sm,
    color: '#E74C3C',
    marginTop: -theme.spacing.sm,
    marginBottom: theme.spacing.md,
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
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    paddingHorizontal: theme.spacing.md,
  }
});
