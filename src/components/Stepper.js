import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme/theme';

export const Stepper = ({ currentStep = 1 }) => {
  return (
    <View style={styles.stepperContainer}>
      {/* Step 1 */}
      <View style={styles.stepItem}>
        <View style={[styles.stepCircle, currentStep >= 1 && styles.stepActive]}>
          <Text style={[styles.stepText, currentStep >= 1 && styles.stepTextActive]}>1</Text>
        </View>
        <Text style={[styles.stepLabel, currentStep >= 1 && styles.stepLabelActive]}>Informations</Text>
      </View>
      
      <View style={[styles.stepLine, currentStep >= 2 && styles.stepLineActive]} />
      
      {/* Step 2 */}
      <View style={styles.stepItem}>
        <View style={[styles.stepCircle, currentStep >= 2 && styles.stepActive]}>
          <Text style={[styles.stepText, currentStep >= 2 && styles.stepTextActive]}>2</Text>
        </View>
        <Text style={[styles.stepLabel, currentStep >= 2 && styles.stepLabelActive]}>Vérification</Text>
      </View>
      
      <View style={[styles.stepLine, currentStep >= 3 && styles.stepLineActive]} />
      
      {/* Step 3 */}
      <View style={styles.stepItem}>
        <View style={[styles.stepCircle, currentStep >= 3 && styles.stepActive]}>
          <Text style={[styles.stepText, currentStep >= 3 && styles.stepTextActive]}>3</Text>
        </View>
        <Text style={[styles.stepLabel, currentStep >= 3 && styles.stepLabelActive]}>Sécurisation</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.md,
  },
  stepItem: {
    alignItems: 'center',
    width: 70,
  },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepActive: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  stepText: {
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.primary,
  },
  stepTextActive: {
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.surface,
  },
  stepLabel: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 10,
    color: theme.colors.textSecondary,
  },
  stepLabelActive: {
    color: theme.colors.accent,
  },
  stepLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
    marginTop: 18, // half of circle height
    marginHorizontal: 8,
  },
  stepLineActive: {
    backgroundColor: theme.colors.accent,
  }
});
