import React from 'react';
import { TouchableOpacity, Text, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import AppSelect from './AppSelect';

export const getFlagCode = (lang) => {
  switch (lang) {
    case 'fr': return 'fr';
    case 'pt': return 'pt';
    case 'ar': return 'sa';
    case 'am': return 'et';
    default: return 'gb';
  }
};

export const LanguageSelector = ({ variant = 'default' }) => {
  const { language, setLanguage, t } = useApp();

  return (
    <AppSelect 
      value={language}
      options={[
        { value: 'en', label: 'English', flagUrl: 'https://flagcdn.com/w40/gb.png' },
        { value: 'fr', label: 'Français', flagUrl: 'https://flagcdn.com/w40/fr.png' },
        { value: 'pt', label: 'Português', flagUrl: 'https://flagcdn.com/w40/pt.png' },
        { value: 'ar', label: 'العربية', flagUrl: 'https://flagcdn.com/w40/sa.png' },
        { value: 'am', label: 'አማርኛ', flagUrl: 'https://flagcdn.com/w40/et.png' },
      ]}
      onChange={(val) => setLanguage && setLanguage(val)}
      title={t('langSwitchedToastTitle', 'Changer la langue')}
      renderCustomTrigger={({ setOpen }) => (
        <TouchableOpacity 
          style={[styles.languageSelector, variant === 'dark' && styles.languageSelectorDark]} 
          onPress={() => setOpen(true)} 
          accessibilityLabel="Changer la langue / Switch language"
        >
          <Image 
            source={{ uri: `https://flagcdn.com/w40/${getFlagCode(language)}.png` }} 
            style={styles.flagIcon} 
          />
          <Text style={[styles.languageText, variant === 'dark' && styles.languageTextDark]}>
            {language.toUpperCase()}
          </Text>
          <Ionicons 
            name="chevron-down" 
            size={14} 
            color={variant === 'dark' ? '#FFFFFF' : '#20365B'} 
          />
        </TouchableOpacity>
      )}
    />
  );
};

const styles = StyleSheet.create({
  languageSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minHeight: 'auto',
  },
  languageSelectorDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  flagIcon: {
    width: 20, 
    height: 14, 
    borderRadius: 2, 
    marginRight: 6 
  },
  languageText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#20365B',
    marginRight: 4,
  },
  languageTextDark: {
    color: '#FFFFFF',
  }
});
