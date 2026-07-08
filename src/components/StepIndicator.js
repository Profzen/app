import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme/theme';

export default function StepIndicator({ currentStep, steps }) {
  return (
    <View style={styles.container}>
      {/* Background Line */}
      <View style={styles.line} />
      
      {/* Active Progress Line */}
      <View style={[
        styles.activeLine, 
        { width: `${Math.max(0, (currentStep - 1) / (steps.length - 1)) * 100}%` }
      ]} />
      
      {/* Steps */}
      <View style={styles.stepsWrapper}>
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isPast = stepNumber < currentStep;
          
          return (
            <View key={stepNumber} style={styles.stepContainer}>
              <View style={[
                styles.circle,
                isActive && styles.activeCircle,
                isPast && styles.pastCircle,
                !isActive && !isPast && styles.inactiveCircle
              ]}>
                <Text style={[
                  styles.number,
                  isActive && styles.activeNumber,
                  isPast && styles.pastNumber,
                  !isActive && !isPast && styles.inactiveNumber
                ]}>
                  {stepNumber}
                </Text>
              </View>
              <Text style={[
                styles.label,
                isActive && styles.activeLabel,
                !isActive && styles.inactiveLabel
              ]}>
                {step.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 32,
    marginHorizontal: 40,
    position: 'relative',
  },
  line: {
    position: 'absolute',
    top: 16,
    left: 40, // Half of stepContainer width (80/2)
    right: 40,
    height: 1,
    backgroundColor: '#E5E7EB',
    zIndex: 1,
  },
  activeLine: {
    position: 'absolute',
    top: 16,
    left: 40,
    right: 40,
    height: 2, // slightly thicker to stand out
    backgroundColor: theme.colors.accent,
    zIndex: 2,
  },
  stepsWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 2,
  },
  stepContainer: {
    alignItems: 'center',
    width: 80, // Giving some width to ensure labels don't overlap easily
  },
  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  activeCircle: {
    backgroundColor: theme.colors.accent,
  },
  pastCircle: {
    backgroundColor: theme.colors.accent,
    opacity: 0.8,
  },
  inactiveCircle: {
    backgroundColor: '#F3F4F6', // Light gray
  },
  number: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
  activeNumber: {
    color: '#FFFFFF',
  },
  pastNumber: {
    color: '#FFFFFF',
  },
  inactiveNumber: {
    color: '#1A2840',
  },
  label: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    textAlign: 'center',
  },
  activeLabel: {
    color: theme.colors.accent,
  },
  inactiveLabel: {
    color: '#A0AABF',
  }
});
