import React, { useRef, useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { theme } from '../theme/theme';

export const OtpInput = ({ length = 6, value, onChange, isError }) => {
  const [code, setCode] = useState(value || new Array(length).fill(''));
  const inputs = useRef([]);

  const handleChange = (text, index) => {
    // Handle pasting a full code
    if (text.length > 1) {
      const pastedChars = text.replace(/[^0-9]/g, '').slice(0, length).split('');
      const newCode = [...code];
      
      pastedChars.forEach((char, i) => {
        if (i < length) {
          newCode[i] = char;
        }
      });
      
      setCode(newCode);
      if (onChange) onChange(newCode.join(''));
      
      // Focus the last filled input
      const focusIndex = Math.min(pastedChars.length, length - 1);
      if (inputs.current[focusIndex]) {
        inputs.current[focusIndex].focus();
      }
      return;
    }

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
          textContentType="oneTimeCode"
          maxLength={length} // Allow pasting full code
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
    width: 46,
    height: 52,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    textAlign: 'center',
    fontSize: 20,
    fontFamily: theme.typography.fontFamily.semiBold,
    color: '#1A2840',
    outlineStyle: 'none',
  },
  inputActive: {
    borderColor: '#FFC759',
    backgroundColor: '#FFFDF5',
    borderWidth: 2,
  },
  inputError: {
    borderColor: '#E74C3C',
    backgroundColor: '#FDEDEC',
  }
});
