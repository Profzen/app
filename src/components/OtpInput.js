import React, { useRef, useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { theme } from '../theme/theme';

export const OtpInput = ({ length = 6, value, onChange, isError }) => {
  const [code, setCode] = useState(value || new Array(length).fill(''));
  const inputs = useRef([]);

  const handleChange = (text, index) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);
    if (onChange) onChange(newCode.join(''));

    // Move to next input if there's text
    if (text && index < length - 1) {
      inputs.current[index + 1].focus();
    }
  };

  const handleKeyPress = (e, index) => {
    // Move to previous input on backspace if current is empty
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  return (
    <View style={styles.container}>
      {code.map((digit, index) => (
        <TextInput
          key={index}
          style={[
            styles.input, 
            digit && styles.inputActive,
            isError && styles.inputError
          ]}
          value={digit}
          onChangeText={(text) => handleChange(text, index)}
          onKeyPress={(e) => handleKeyPress(e, index)}
          keyboardType="number-pad"
          maxLength={1}
          ref={(ref) => inputs.current[index] = ref}
          selectionColor={theme.colors.accent}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: theme.spacing.lg,
  },
  input: {
    width: 48,
    height: 56,
    borderRadius: theme.radii.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    textAlign: 'center',
    fontSize: theme.typography.sizes.xl,
    fontFamily: theme.typography.fontFamily.semiBold,
    color: theme.colors.textPrimary,
    outlineStyle: 'none',
  },
  inputActive: {
    borderColor: theme.colors.accent,
  },
  inputError: {
    borderColor: '#E74C3C',
    backgroundColor: '#FDEDEC',
  }
});
