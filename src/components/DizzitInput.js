import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text, Platform } from 'react-native';
import { theme } from '../theme/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export const DizzitInput = ({
  label,
  placeholder,
  value,
  onChangeText,
  iconLeft,
  isPassword,
  secureTextEntry = false,
  rightIcon,
  onRightIconPress,
  keyboardType = 'default',
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <LinearGradient 
        colors={isFocused ? [theme.colors.accent, theme.colors.primary] : ['#E2E8F0', '#E2E8F0']} 
        start={{x: 0, y: 0}} 
        end={{x: 1, y: 1}} 
        style={styles.gradientWrapper}
      >
        <View style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocusedInner
        ]}>
          {iconLeft && (
            <View style={styles.iconLeft}>
              {iconLeft}
            </View>
          )}
          
          <TextInput
            style={styles.input}
            placeholder={placeholder}
            placeholderTextColor={theme.colors.textSecondary}
            value={value}
            onChangeText={onChangeText}
            keyboardType={keyboardType}
            secureTextEntry={isPassword ? !showPassword : secureTextEntry}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            selectionColor={theme.colors.accent}
            {...props}
          />

          {isPassword && (
            <TouchableOpacity 
              style={styles.iconRight} 
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons 
                name={showPassword ? "eye-off-outline" : "eye-outline"} 
                size={20} 
                color={theme.colors.primary} 
              />
            </TouchableOpacity>
          )}

          {rightIcon && (
            <TouchableOpacity onPress={onRightIconPress} style={styles.rightIconContainer}>
              {rightIcon}
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  gradientWrapper: {
    padding: 2, // This creates the 2px gradient border
    borderRadius: theme.radii.md + 2,
    // Add a very subtle, static shadow that doesn't change on focus to avoid Android layout bugs
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: theme.radii.md,
    minHeight: 56,
    paddingHorizontal: theme.spacing.md,
    width: '100%',
  },
  inputContainerFocusedInner: {
    backgroundColor: '#FFFFFF',
  },
  iconLeft: {
    marginRight: theme.spacing.sm,
  },
  iconRight: {
    marginLeft: theme.spacing.sm,
    padding: 4,
  },
  rightIconContainer: {
    marginLeft: theme.spacing.sm,
    padding: 4,
  },
  input: {
    flex: 1,
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textPrimary,
    ...Platform.select({
      web: { outlineStyle: 'none' }
    }),
  }
});
