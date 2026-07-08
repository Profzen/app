import React from 'react';
import { StyleSheet, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme/theme';

export const DizzitButton = ({ 
  title, 
  onPress, 
  type = 'primary', // primary, outline, text
  icon,
  style,
  isLoading = false,
  disabled = false
}) => {
  if (type === 'primary') {
    return (
      <TouchableOpacity 
        style={[styles.shadowContainer, theme.shadows.brandGlow, style]}
        activeOpacity={0.8}
        onPress={onPress}
        disabled={isLoading || disabled}
      >
        <LinearGradient
          colors={isLoading || disabled ? ['#E5E7EB', '#D1D5DB'] : [theme.colors.accent, '#ffdb8a']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.primaryButton}
        >
          {isLoading ? (
            <ActivityIndicator color={theme.colors.primary} />
          ) : (
            <React.Fragment>
              <Text style={[styles.primaryText, (isLoading || disabled) && { color: theme.colors.textSecondary }]}>{title}</Text>
              {icon && <React.Fragment>{icon}</React.Fragment>}
            </React.Fragment>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity 
      style={[
        styles.secondaryButton, 
        type === 'outline' && styles.outlineButton,
        style,
        (isLoading || disabled) && { opacity: 0.6 }
      ]}
      activeOpacity={0.7}
      onPress={onPress}
      disabled={isLoading || disabled}
    >
      {isLoading ? (
        <ActivityIndicator color={theme.colors.primary} />
      ) : (
        <Text style={[
          styles.secondaryText,
          type === 'outline' && styles.outlineText
        ]}>{title}</Text>
      )}
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
