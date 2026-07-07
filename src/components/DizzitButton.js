import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme/theme';

export const DizzitButton = ({ 
  title, 
  onPress, 
  type = 'primary', // primary, outline, text
  icon,
  style 
}) => {
  if (type === 'primary') {
    return (
      <TouchableOpacity 
        style={[styles.shadowContainer, theme.shadows.brandGlow, style]}
        activeOpacity={0.8}
        onPress={onPress}
      >
        <LinearGradient
          colors={[theme.colors.accent, '#ffdb8a']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.primaryButton}
        >
          <Text style={styles.primaryText}>{title}</Text>
          {icon && <React.Fragment>{icon}</React.Fragment>}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity 
      style={[
        styles.secondaryButton, 
        type === 'outline' && styles.outlineButton,
        style
      ]}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <Text style={[
        styles.secondaryText,
        type === 'outline' && styles.outlineText
      ]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  shadowContainer: {
    borderRadius: theme.radii.md,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radii.md,
    gap: theme.spacing.xs,
  },
  primaryText: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: theme.typography.sizes.base,
    color: theme.colors.textPrimary, // In the mockup, text is dark on amber
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.surface,
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  secondaryText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.sizes.base,
    color: theme.colors.primary,
  },
  outlineText: {
    color: theme.colors.textSecondary,
  }
});
