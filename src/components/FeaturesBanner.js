import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme/theme';
import { useApp } from '../context/AppContext';

export const FeaturesBanner = () => {
  const { t } = useApp();

  return (
    <View style={styles.container}>
      <View style={styles.featureItem}>
        <View style={styles.iconContainer}>
          <Ionicons name="shield-checkmark-outline" size={22} color={theme.colors.accent} />
        </View>
        <Text style={styles.featureText}>
          {t('features.secureMoney', "Soutenez vos familles en Afrique tout en sécurisant l'usage de votre argent")}
        </Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.featureItem}>
        <View style={styles.iconContainer}>
          <Ionicons name="map-outline" size={22} color={theme.colors.accent} />
        </View>
        <Text style={styles.featureText}>
          {t('features.allAfrica', "Sur toute l'Afrique\n(54 pays)")}
        </Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.featureItem}>
        <View style={styles.iconContainer}>
          <Ionicons name="globe-outline" size={22} color={theme.colors.accent} />
        </View>
        <Text style={styles.featureText}>
          {t('features.bestPrice', "Sourcez produits et services en Afrique au meilleur rapport Qualité/Prix")}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 8,
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'flex-start',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  featureItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  iconContainer: {
    marginBottom: 6,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  featureText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 10,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 14,
  },
  divider: {
    width: 1,
    height: '70%',
    backgroundColor: '#F3F4F6',
    marginTop: 8,
  }
});
