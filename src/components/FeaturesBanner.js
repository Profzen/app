import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme/theme';

export const FeaturesBanner = () => {
  return (
    <View style={styles.container}>
      <View style={styles.featureItem}>
        <View style={styles.iconContainer}>
          <Ionicons name="shield-checkmark-outline" size={28} color={theme.colors.primary} />
          {/* Mocking the lock inside the shield with a small absolute icon */}
          <Ionicons name="lock-closed" size={12} color={theme.colors.accent} style={styles.innerIcon} />
        </View>
        <Text style={styles.featureText}>
          Soutenez vos familles en Afrique tout en sécurisant l'usage de votre argent
        </Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.featureItem}>
        <View style={styles.iconContainer}>
          <Ionicons name="earth-outline" size={28} color={theme.colors.primary} />
        </View>
        <Text style={styles.featureText}>
          Sur toute l'Afrique{'\n'}(54 pays)
        </Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.featureItem}>
        <View style={styles.iconContainer}>
          <Ionicons name="globe-outline" size={28} color={theme.colors.primary} />
        </View>
        <Text style={styles.featureText}>
          Sourcez produits et services en Afrique au meilleur rapport Qualité/Prix
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
