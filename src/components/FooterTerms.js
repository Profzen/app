import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { theme } from '../theme/theme';

export const FooterTerms = () => {
  return (
    <Text style={styles.footerText}>
      En vous inscrivant, vous acceptez nos <Text style={styles.linkText}>Conditions d'utilisation</Text>{'\n'}
      et notre <Text style={styles.linkText}>Politique de confidentialité</Text>
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
