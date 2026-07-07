import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme/theme';

export const SecurityBanner = ({ icon, title, description }) => {
  const DefaultShieldIcon = () => (
    <View style={styles.shieldContainer}>
      <Ionicons name="shield-outline" size={20} color="#1A73E8" />
    </View>
  );

  return (
    <View style={styles.securityBanner}>
      <View style={styles.iconContainer}>
        {icon ? icon : <DefaultShieldIcon />}
      </View>
      <View style={styles.texts}>
        <Text style={styles.title}>{title || 'Vos données sont sécurisées'}</Text>
        <Text style={styles.desc}>
          {description || 'Vos données sont protégées avec le plus\nhaut niveau de sécurité.'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  securityBanner: {
    flexDirection: 'row',
    backgroundColor: '#FFF8ED', // Light beige/amber background
    borderRadius: theme.radii.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: '#FBE3BA',
  },
  iconContainer: {
    marginRight: theme.spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  texts: {
    flex: 1,
  },
  title: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.primary,
    marginBottom: 4,
  },
  desc: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11,
    color: theme.colors.textSecondary,
    lineHeight: 16,
  },
  shieldContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E8F0FE', // Light blue background
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#D2E3FC',
  }
});
