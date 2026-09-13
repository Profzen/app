import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme/theme';
import { useApp } from '../context/AppContext';

export const BiometricsCard = ({ isEnabled, onToggle }) => {
  const { t } = useApp();
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="finger-print-outline" size={32} color={theme.colors.accent} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{t('auth.enableBiometrics', 'Enable biometric login')}</Text>
        <Text style={styles.desc}>
          {t('auth.biometricsDesc', 'Log in faster and securely with fingerprint or Face ID.')}
        </Text>
      </View>
      <Switch
        trackColor={{ false: '#E0E0E0', true: theme.colors.accent }}
        thumbColor={'#FFFFFF'}
        ios_backgroundColor="#E0E0E0"
        onValueChange={onToggle}
        value={isEnabled}
        style={styles.switch}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: theme.radii.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  iconContainer: {
    marginRight: theme.spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  desc: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11,
    color: theme.colors.textSecondary,
    lineHeight: 16,
  },
  switch: {
    marginLeft: theme.spacing.sm,
  }
});
