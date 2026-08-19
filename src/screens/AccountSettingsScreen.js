import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Platform, StatusBar, Switch, Modal, Alert, Linking, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import AppToast from '../components/AppToast';

import { useApp } from '../context/AppContext';
import { supabase } from '../services/supabaseClient';

const getCurrencyFlag = (currencyCode) => {
  const map = {
    'USD': 'us', 'EUR': 'eu', 'XOF': 'sn', 'XAF': 'cm',
    'GHS': 'gh', 'KES': 'ke', 'DZD': 'dz', 'NGN': 'ng',
    'GBP': 'gb', 'ZAR': 'za', 'EGP': 'eg', 'TZS': 'tz',
    'UGX': 'ug', 'RWF': 'rw', 'ETB': 'et', 'MAD': 'ma',
    'INR': 'in', 'IQD': 'iq', 'IRR': 'ir', 'ISK': 'is',
    'JEP': 'je', 'JMD': 'jm', 'JOD': 'jo'
  };
  const country = map[currencyCode?.toUpperCase()];
  return country ? `https://flagcdn.com/w80/${country}.png` : null;
};

const FALLBACK_CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'XOF', symbol: 'CFA', name: 'Franc CFA (UEMOA)' },
  { code: 'GHS', symbol: '₵', name: 'Ghana Cedi' },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling' },
  { code: 'DZD', symbol: 'DA', name: 'Algerian Dinar' },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
];

export default function AccountSettingsScreen() {
  const navigation = useNavigation();
  const { language, t, user, updateUserProfile } = useApp();
  const [toast, setToast] = useState(null);
  
  const [pushEnabled, setPushEnabled] = useState(user?.push_notifications_enabled || false);
  const [currency, setCurrency] = useState(user?.preferred_currency || 'USD');
  const [currencyModalVisible, setCurrencyModalVisible] = useState(false);
  const [availableCurrencies, setAvailableCurrencies] = useState(FALLBACK_CURRENCIES);
  
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  useEffect(() => {
    (async () => {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      setIsBiometricSupported(compatible);
      
      if (compatible) {
        const enabled = await SecureStore.getItemAsync('use_biometrics');
        setIsBiometricEnabled(enabled === 'true');
      }
    })();
    
    // Fetch dynamic currencies from Supabase
    const fetchCurrencies = async () => {
      try {
        const { data, error } = await supabase.from('currencies').select('*');
        if (data && data.length > 0) {
          setAvailableCurrencies(data);
        }
      } catch (err) {
        console.log('Error fetching currencies:', err);
      }
    };
    fetchCurrencies();
  }, []);

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('MoreSettingsScreen');
    }
  };

  const toggleBiometric = async (value) => {
    if (value) {
      // Trying to enable: Verify identity first
      try {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: t('settings.loginWithBiometrics', 'Login with Biometrics'),
          fallbackLabel: t('settings.cancel', 'Cancel'),
        });
        
        if (result.success) {
          setIsBiometricEnabled(true);
          await SecureStore.setItemAsync('use_biometrics', 'true');
          setToast({ title: "Success", message: "Biometric authentication enabled" });
        } else {
          setIsBiometricEnabled(false);
        }
      } catch (error) {
        console.error(error);
        setIsBiometricEnabled(false);
      }
    } else {
      // Disable
      setIsBiometricEnabled(false);
      await SecureStore.setItemAsync('use_biometrics', 'false');
    }
  };

  const togglePushNotifications = async (value) => {
    setPushEnabled(value);
    
    if (value) {
      if (Platform.OS === 'web') {
        setToast({ title: "Warning", message: "Push notifications are not supported on web" });
        await updateUserProfile({ push_notifications_enabled: true });
        return;
      }
      
      if (!Device.isDevice) {
        setToast({ title: "Warning", message: "Must use a physical device for Push Notifications" });
        setPushEnabled(false);
        return;
      }
      
      // Check if running in Expo Go
      if (Constants.appOwnership === 'expo') {
        setToast({ title: "Warning", message: "Push Notifications require a Development Build (not Expo Go)" });
        setPushEnabled(false);
        return;
      }
      
      try {
        const Notifications = require('expo-notifications');
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        
        if (finalStatus !== 'granted') {
          setPushEnabled(false);
          setToast({ title: "Error", message: "Failed to get push token" });
          return;
        }
        
        const tokenData = await Notifications.getExpoPushTokenAsync().catch(e => { console.log(e); return null; });
        const token = tokenData?.data || null;
        
        await updateUserProfile({ push_notifications_enabled: true, expo_push_token: token });
        setToast({ title: "Success", message: "Push notifications enabled" });
      } catch (error) {
        console.error("Error getting push token:", error);
        await updateUserProfile({ push_notifications_enabled: true });
      }
    } else {
      await updateUserProfile({ push_notifications_enabled: false });
    }
  };

  const handleCurrencySelect = async (newCurrency) => {
    setCurrency(newCurrency);
    setCurrencyModalVisible(false);
    await updateUserProfile({ preferred_currency: newCurrency });
    setToast({ title: "Success", message: "Display currency updated" });
  };

  const confirmDeleteAccount = () => {
    setDeleteModalVisible(false);
    Linking.openURL('mailto:support@dizzitup.com?subject=Account%20Deletion%20Request');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack} accessibilityLabel="Back">
              <Ionicons name="arrow-back" size={22} color="#1A2840" />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.pageTitle}>{t('settings.securityCenter', 'Security Center')}</Text>
              <Text style={styles.pageSubtitle}>{t('settings.general', 'Account Settings')}</Text>
            </View>
          </View>

          {/* Settings List */}
          <View style={styles.settingsCard}>
            
            {/* Change Password (placeholder for future implementation) */}
            <TouchableOpacity style={[styles.settingRow, styles.settingDivider]} onPress={() => Alert.alert("Coming Soon", "Change password functionality will be available in the next update.")}>
              <View style={[styles.settingIcon, { backgroundColor: '#EFF6FF' }]}>
                <Ionicons name="key-outline" size={22} color="#3B82F6" />
              </View>
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>{t('settings.changePassword', 'Change Password')}</Text>
                <Text style={styles.settingDescription}>{t('settings.changePasswordDesc', 'Update your login password')}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            {/* Biometric Login Toggle */}
            {isBiometricSupported && (
              <View style={[styles.settingRow, styles.settingDivider]}>
                <View style={[styles.settingIcon, { backgroundColor: '#ECFDF5' }]}>
                  <Ionicons name="finger-print-outline" size={22} color="#10B981" />
                </View>
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>{t('settings.biometricLogin', 'Biometric Login')}</Text>
                  <Text style={styles.settingDescription}>{t('settings.biometricLoginDesc', 'Use FaceID or Fingerprint to sign in')}</Text>
                </View>
                <Switch
                  trackColor={{ false: "#D1D5DB", true: "#10B981" }}
                  thumbColor={"#FFFFFF"}
                  ios_backgroundColor="#D1D5DB"
                  onValueChange={toggleBiometric}
                  value={isBiometricEnabled}
                />
              </View>
            )}

            {/* Delete Account */}
            <TouchableOpacity style={styles.settingRow} onPress={() => setDeleteModalVisible(true)}>
              <View style={[styles.settingIcon, { backgroundColor: '#FEF2F2' }]}>
                <Ionicons name="trash-outline" size={22} color="#EF4444" />
              </View>
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, { color: '#EF4444' }]}>{t('settings.deleteAccount', 'Delete Account')}</Text>
                <Text style={styles.settingDescription}>{t('settings.deleteAccountDesc', 'Permanently delete your account and data')}</Text>
              </View>
            </TouchableOpacity>
            
          </View>

          {/* App Preferences Section */}
          <Text style={styles.sectionHeader}>{t('settings.appPreferences', 'App Preferences')}</Text>
          <View style={styles.settingsCard}>
            
            {/* Currency Selector */}
            <TouchableOpacity style={[styles.settingRow, styles.settingDivider]} onPress={() => setCurrencyModalVisible(true)}>
              <View style={[styles.settingIcon, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="cash-outline" size={22} color="#D97706" />
              </View>
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>{t('settings.displayCurrency', 'Display Currency')}</Text>
                <Text style={styles.settingDescription}>{availableCurrencies.find(c => c.code === currency)?.name || availableCurrencies.find(c => c.code === currency)?.label || currency}</Text>
              </View>
              <View style={styles.currencyBadge}>
                <Text style={styles.currencyBadgeText}>{currency}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            {/* Push Notifications */}
            <View style={styles.settingRow}>
              <View style={[styles.settingIcon, { backgroundColor: '#E0E7FF' }]}>
                <Ionicons name="notifications-outline" size={22} color="#4F46E5" />
              </View>
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>{t('settings.pushNotifications', 'Push Notifications')}</Text>
                <Text style={styles.settingDescription}>{t('settings.pushNotificationsDesc', 'Receive alerts for payments and orders')}</Text>
              </View>
              <Switch
                trackColor={{ false: "#D1D5DB", true: "#4F46E5" }}
                thumbColor={"#FFFFFF"}
                ios_backgroundColor="#D1D5DB"
                onValueChange={togglePushNotifications}
                value={pushEnabled}
              />
            </View>

          </View>
        </ScrollView>
        <AppToast visible={!!toast} title={toast?.title} message={toast?.message} onClose={() => setToast(null)} />
        
        {/* Delete Confirmation Modal */}
        <Modal visible={deleteModalVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalIconBox}>
                <Ionicons name="warning" size={32} color="#EF4444" />
              </View>
              <Text style={styles.modalTitle}>{t('settings.deleteConfirmTitle', 'Are you sure?')}</Text>
              <Text style={styles.modalText}>{t('settings.deleteConfirmMsg', 'Do you really want to delete your account? This action will contact support.')}</Text>
              
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.btnCancel} onPress={() => setDeleteModalVisible(false)}>
                  <Text style={styles.btnCancelText}>{t('settings.cancel', 'Cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnConfirm} onPress={confirmDeleteAccount}>
                  <Text style={styles.btnConfirmText}>{t('settings.confirm', 'Confirm')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Currency Selection Modal */}
        <Modal visible={currencyModalVisible} transparent animationType="slide">
          <View style={styles.bottomSheetOverlay}>
            <TouchableOpacity style={{ flex: 1 }} onPress={() => setCurrencyModalVisible(false)} />
            <View style={styles.bottomSheet}>
              <View style={styles.sheetHandle} />
              <Text style={styles.sheetTitle}>{t('settings.selectCurrency', 'Select Display Currency')}</Text>
              <ScrollView showsVerticalScrollIndicator={false}>
                {availableCurrencies.map((item) => (
                  <TouchableOpacity 
                    key={item.code} 
                    style={styles.currencyOption}
                    onPress={() => handleCurrencySelect(item.code)}
                  >
                    <View style={styles.currencyIcon}>
                      {getCurrencyFlag(item.code) ? (
                        <Image source={{ uri: getCurrencyFlag(item.code) }} style={{ width: 40, height: 40, borderRadius: 20 }} />
                      ) : (
                        <Text style={styles.currencySymbol}>{item.symbol || item.code}</Text>
                      )}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.currencyCode}>{item.code}</Text>
                      <Text style={styles.currencyLabel}>{item.name || item.label}</Text>
                    </View>
                    {currency === item.code && (
                      <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAFAFC', paddingTop: Platform.OS === 'android' ? Math.max(StatusBar.currentHeight || 0, 44) + 6 : 14 },
  container: { flex: 1, backgroundColor: '#FAFAFC' },
  content: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, },
  backButton: { paddingRight: 10, paddingVertical: 4 },
  headerTitleContainer: { flex: 1 },
  pageTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 24, color: '#1A2840', lineHeight: 28 },
  pageSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 14, color: '#6B7280', marginTop: 2 },
  settingsCard: { borderWidth: 1, borderColor: '#F0F2F5', borderRadius: 16, backgroundColor: '#FFFFFF', paddingHorizontal: 14, overflow: 'hidden', boxShadow: '0px 2px 8px #000' },
  settingRow: { minHeight: 74, paddingVertical: 12, flexDirection: 'row', alignItems: 'center' },
  settingDivider: { borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  settingIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  settingText: { flex: 1, paddingRight: 8 },
  settingTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: '#1A2840', marginBottom: 2 },
  settingDescription: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 18, color: '#6B7280' },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', backgroundColor: '#FFF', borderRadius: 24, padding: 24, alignItems: 'center' },
  modalIconBox: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#FEF2F2', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 22, color: '#1A2840', marginBottom: 12, textAlign: 'center' },
  modalText: { fontFamily: 'Inter_400Regular', fontSize: 15, color: '#6B7280', textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  modalActions: { flexDirection: 'row', width: '100%', justifyContent: 'space-between' },
  btnCancel: { flex: 1, height: 50, borderRadius: 12, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  btnCancelText: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: '#4B5563' },
  btnConfirm: { flex: 1, height: 50, borderRadius: 12, backgroundColor: '#EF4444', justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  btnConfirmText: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: '#FFFFFF' },
  
  sectionHeader: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 16, color: '#1A2840', marginTop: 24, marginBottom: 12 },
  currencyBadge: { backgroundColor: '#F3F4F6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginRight: 8 },
  currencyBadgeText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#4B5563' },
  
  bottomSheetOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  bottomSheet: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '70%' },
  sheetHandle: { width: 40, height: 4, backgroundColor: '#E5E7EB', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  sheetTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 18, color: '#1A2840', marginBottom: 16, textAlign: 'center' },
  currencyOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  currencyIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center', marginRight: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  currencySymbol: { fontFamily: 'Inter_600SemiBold', fontSize: 16, color: '#1A2840' },
  currencyCode: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: '#1A2840' },
  currencyLabel: { fontFamily: 'Inter_400Regular', fontSize: 13, color: '#6B7280' },
});
