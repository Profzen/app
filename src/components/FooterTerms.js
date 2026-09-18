import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { theme } from '../theme/theme';
import { useApp } from '../context/AppContext';

export const FooterTerms = () => {
  const { t } = useApp();
  return (
    <Text style={styles.footerText}>
      {t('auth.termsAgreement', 'By signing up, you agree to our')} <Text style={styles.linkText}>{t('auth.termsOfService', 'Terms of Service')}</Text>{'\n'}
      {t('auth.andOur', 'and our')} <Text style={styles.linkText}>{t('auth.privacyPolicy', 'Privacy Policy')}</Text>
    </Text>
  );
};

const styles = StyleSheet.create({
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
