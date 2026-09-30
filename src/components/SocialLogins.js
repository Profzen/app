import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme/theme';
import { useApp } from '../context/AppContext';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { supabase } from '../services/supabaseClient';
import AppToast from './AppToast';

export const SocialLogins = ({ variant = 'row' }) => {
  const { language, t } = useApp();
  const [toastInfo, setToastInfo] = useState({ visible: false, title: '', message: '', type: 'info' });
  const dividerText = t('auth.orContinueWith', 'or continue with');

  const handleSocialLogin = async (providerName) => {
    setToastInfo({
      visible: true,
      title: t('auth.socialLoginDisabledTitle', 'Beta Test Notice'),
      message: t('auth.socialLoginDisabledMsg', 'Social logins are temporarily disabled during beta testing. Please sign in or register with your email or phone number.'),
      type: 'info'
    });
  };

  if (variant === 'square') {
    return (
      <View style={styles.container}>
        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>{dividerText}</Text>
          <View style={styles.divider} />
        </View>

        <View style={styles.squareContainer}>
          <TouchableOpacity style={[styles.squareButton, { opacity: 0.45 }]} onPress={() => handleSocialLogin('Google')}>
            <Ionicons name="logo-google" size={28} color={theme.colors.textSecondary} />
            <Text style={styles.squareText}>Google</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.squareButton, { opacity: 0.45 }]} onPress={() => handleSocialLogin('Apple')}>
            <Ionicons name="logo-apple" size={28} color={theme.colors.textPrimary} />
            <Text style={styles.squareText}>Apple</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.squareButton, { opacity: 0.45 }]} onPress={() => handleSocialLogin('Facebook')}>
            <Ionicons name="logo-facebook" size={28} color="#1877F2" />
            <Text style={styles.squareText}>Facebook</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.squareButton, { opacity: 0.45 }]} onPress={() => handleSocialLogin('X')}>
            <Text style={{fontWeight: 'bold', fontSize: 24, color: theme.colors.textPrimary}}>X</Text>
            <Text style={styles.squareText}>X (Twitter)</Text>
          </TouchableOpacity>
        </View>
        <AppToast visible={toastInfo.visible} title={toastInfo.title} message={toastInfo.message} type={toastInfo.type} onClose={() => setToastInfo({ ...toastInfo, visible: false })} />
      </View>
    );
  }

  return (
    <View>
      <View style={styles.dividerContainer}>
        <View style={styles.divider} />
        <Text style={styles.dividerText}>{dividerText}</Text>
        <View style={styles.divider} />
      </View>

      <View style={styles.socialContainer}>
        <TouchableOpacity style={[styles.socialButton, { opacity: 0.45 }]} onPress={() => handleSocialLogin('Google')}>
          <Ionicons name="logo-google" size={24} color={theme.colors.textSecondary} />
          <Text style={styles.socialText}>Google</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.socialButton, { opacity: 0.45 }]} onPress={() => handleSocialLogin('Apple')}>
          <Ionicons name="logo-apple" size={24} color={theme.colors.textPrimary} />
          <Text style={styles.socialText}>Apple</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.socialButton, { opacity: 0.45 }]} onPress={() => handleSocialLogin('Facebook')}>
          <Ionicons name="logo-facebook" size={24} color="#1877F2" />
          <Text style={styles.socialText}>Facebook</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.socialButton, { opacity: 0.45 }]} onPress={() => handleSocialLogin('X')}>
          <Text style={styles.xIcon}>X</Text>
          <Text style={styles.socialText}>X (Twitter)</Text>
        </TouchableOpacity>
      </View>
      <AppToast visible={toastInfo.visible} title={toastInfo.title} message={toastInfo.message} type={toastInfo.type} onClose={() => setToastInfo({ ...toastInfo, visible: false })} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  dividerText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginHorizontal: theme.spacing.md,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xl,
  },
  socialButton: {
    width: '22%',
    aspectRatio: 1,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 9,
    color: theme.colors.textPrimary,
    marginTop: 6,
  },
  xIcon: {
    fontWeight: 'bold', 
    fontSize: 20, 
    color: theme.colors.textPrimary
  },
  squareContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  squareButton: {
    width: 72,
    height: 72,
    borderRadius: theme.radii.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  squareText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 10,
    color: theme.colors.textPrimary,
    marginTop: 4,
  },
});
