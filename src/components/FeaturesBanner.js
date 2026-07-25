import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme/theme';
import { useApp } from '../context/AppContext';

export const FeaturesBanner = () => {
  const { language } = useApp();

  return (
    <View style={styles.container}>
      <View style={styles.featureItem}>
        <View style={styles.iconContainer}>
          <Ionicons name="shield-checkmark-outline" size={28} color={theme.colors.primary} />
          <Ionicons name="lock-closed" size={12} color={theme.colors.accent} style={styles.innerIcon} />
        </View>
        <Text style={styles.featureText}>
          {language === 'fr' 
            ? "Soutenez vos familles en Afrique tout en sécurisant l'usage de votre argent" 
            : "Support your families in Africa while securing the use of your money"}
        </Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.featureItem}>
        <View style={styles.iconContainer}>
          <Ionicons name="earth-outline" size={28} color={theme.colors.primary} />
        </View>
        <Text style={styles.featureText}>
          {language === 'fr' 
            ? "Sur toute l'Afrique\n(54 pays)" 
            : "Across all Africa\n(54 countries)"}
        </Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.featureItem}>
        <View style={styles.iconContainer}>
          <Ionicons name="globe-outline" size={28} color={theme.colors.primary} />
        </View>
        <Text style={styles.featureText}>
          {language === 'fr' 
            ? "Sourcez produits et services en Afrique au meilleur rapport Qualité/Prix" 
            : "Source products and services in Africa with the best Quality/Price ratio"}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB', // Light grey
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.sm,
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'flex-start',
  },
  featureItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xs,
  },
  iconContainer: {
    marginBottom: theme.spacing.sm,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    width: 30, // Force bounding box for web SVGs
    height: 30,
  },
  innerIcon: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -6 }, { translateY: -4 }],
  },
  featureText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 9,
    color: theme.colors.primary,
    textAlign: 'center',
    lineHeight: 14,
  },
  divider: {
    width: 1,
    height: '60%',
    backgroundColor: '#E5E7EB',
    marginTop: theme.spacing.lg,
  }
});
