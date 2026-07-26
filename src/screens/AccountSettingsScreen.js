import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, Switch, Alert, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import BottomNavBar from '../components/BottomNavBar';
import AppToast from '../components/AppToast';
import AppSelect from '../components/AppSelect';

import { useApp } from '../context/AppContext';

export default function AccountSettingsScreen() {
  const navigation = useNavigation();
  const { language, setLanguage, t } = useApp();
  const [toast, setToast] = useState(null);

  // State preferences
  const [currency, setCurrency] = useState('USD');

  // Notification Toggles
  const [pushNotifs, setPushNotifs] = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [transactionAlerts, setTransactionAlerts] = useState(true);

  // Appearance
  const [darkMode, setDarkMode] = useState(false);

  const currencyOptions = [
    { value: 'USD', label: 'USD ($)', description: 'Dollar américain' },
    { value: 'EUR', label: 'EUR (€)', description: 'Euro' },
    { value: 'XOF', label: 'XOF (CFA)', description: 'Franc CFA UEMOA' },
    { value: 'GHS', label: 'GHS (₵)', description: 'Cedi ghanéen' },
    { value: 'KES', label: 'KES (KSh)', description: 'Shilling kényan' },
  ];

  const handleBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate('MoreSettingsScreen');
  };

  const handleResetApp = () => {
    setToast({ title: 'Réinitialisation', message: 'Les paramètres locaux ont été réinitialisés avec succès.' });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack} accessibilityLabel="Retour">
              <Ionicons name="arrow-back" size={22} color="#1A2840" />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.pageTitle}>{t('generalSettings', 'Account Settings')}</Text>
              <Text style={styles.pageSubtitle}>{language === 'fr' ? 'Gérer vos préférences et sécurité' : 'Manage your preferences and security'}</Text>
            </View>
          </View>

          {/* Section 1: Langue */}
          <Text style={styles.sectionHeader}>{language === 'fr' ? 'GÉNÉRAL & PRÉFÉRENCES' : 'GENERAL & PREFERENCES'}</Text>
          <View style={styles.card}>
            {/* Langue */}
            <View style={styles.row}>
              <View style={[styles.iconWrap, { backgroundColor: '#EFF6FF' }]}>
                <Ionicons name="globe-outline" size={20} color="#3B82F6" />
              </View>
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>{t('langLabel', 'Langue d\'affichage')}</Text>
                <Text style={styles.rowDesc}>{language === 'fr' ? 'Français' : 'English'}</Text>
              </View>
              <View style={styles.langSelector}>
                <TouchableOpacity
                  style={[styles.langChip, language === 'fr' && styles.langChipActive]}
                  onPress={() => { setLanguage('fr'); setToast({ title: 'Langue', message: 'Application passée en Français' }); }}
                >
                  <Text style={[styles.langText, language === 'fr' && styles.langTextActive]}>FR</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.langChip, language === 'en' && styles.langChipActive]}
                  onPress={() => { setLanguage('en'); setToast({ title: 'Language', message: 'App switched to English' }); }}
                >
                  <Text style={[styles.langText, language === 'en' && styles.langTextActive]}>EN</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Section 2: Sécurité */}
          <Text style={styles.sectionHeader}>{language === 'fr' ? 'SÉCURITÉ & CONFIDENTIALITÉ' : 'SECURITY & PRIVACY'}</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('SecureAccountScreen')}>
              <View style={[styles.iconWrap, { backgroundColor: '#F5F3FF' }]}>
                <Ionicons name="shield-checkmark-outline" size={20} color="#8B5CF6" />
              </View>
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>{language === 'fr' ? 'Code PIN & Biométrie' : 'PIN Code & Biometrics'}</Text>
                <Text style={styles.rowDesc}>{language === 'fr' ? 'Changer le PIN, activer Face ID / Empreinte' : 'Change PIN, enable Face ID / Fingerprint'}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          {/* Section 3: Notifications */}
          <Text style={styles.sectionHeader}>NOTIFICATIONS</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={[styles.iconWrap, { backgroundColor: '#FFFBEB' }]}>
                <Ionicons name="notifications-outline" size={20} color="#F59E0B" />
              </View>
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>{language === 'fr' ? 'Notifications Push' : 'Push Notifications'}</Text>
                <Text style={styles.rowDesc}>{language === 'fr' ? "Alertes d'activités et promos" : "Activity alerts and promos"}</Text>
              </View>
              <Switch value={pushNotifs} onValueChange={setPushNotifs} trackColor={{ false: '#E5E7EB', true: '#FFC759' }} thumbColor="#FFFFFF" />
            </View>

            <View style={styles.divider} />

            <View style={styles.row}>
              <View style={[styles.iconWrap, { backgroundColor: '#EFF6FF' }]}>
                <Ionicons name="mail-outline" size={20} color="#3B82F6" />
              </View>
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>{language === 'fr' ? 'Notifications par email' : 'Email Notifications'}</Text>
                <Text style={styles.rowDesc}>{language === 'fr' ? 'Reçus de paiement et relevés' : 'Payment receipts and statements'}</Text>
              </View>
              <Switch value={emailNotifs} onValueChange={setEmailNotifs} trackColor={{ false: '#E5E7EB', true: '#FFC759' }} thumbColor="#FFFFFF" />
            </View>

            <View style={styles.divider} />

            <View style={styles.row}>
              <View style={[styles.iconWrap, { backgroundColor: '#FEF2F2' }]}>
                <Ionicons name="flash-outline" size={20} color="#EF4444" />
              </View>
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>{language === 'fr' ? 'Alertes de transaction instantanées' : 'Instant Transaction Alerts'}</Text>
                <Text style={styles.rowDesc}>{language === 'fr' ? "Notification lors d'un envoi/réception" : "Notifications on send/receive"}</Text>
              </View>
              <Switch value={transactionAlerts} onValueChange={setTransactionAlerts} trackColor={{ false: '#E5E7EB', true: '#FFC759' }} thumbColor="#FFFFFF" />
            </View>
          </View>

          {/* Section 4: Apparence & Devise */}
          <Text style={styles.sectionHeader}>{language === 'fr' ? 'APPARENCE' : 'APPEARANCE'}</Text>
          <View style={styles.card}>
            {/* Mode Sombre */}
            <View style={styles.row}>
              <View style={[styles.iconWrap, { backgroundColor: '#F3F4F6' }]}>
                <Ionicons name="moon-outline" size={20} color="#1A2840" />
              </View>
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>{language === 'fr' ? 'Mode Sombre (Dark Mode)' : 'Dark Mode'}</Text>
                <Text style={styles.rowDesc}>{language === 'fr' ? 'Interface sombre reposante' : 'Relaxing dark interface'}</Text>
              </View>
              <Switch value={darkMode} onValueChange={(val) => { setDarkMode(val); setToast({ title: 'Mode Sombre', message: val ? 'Mode sombre activé' : 'Mode clair réactivé' }); }} trackColor={{ false: '#E5E7EB', true: '#1A2840' }} thumbColor="#FFFFFF" />
            </View>
          </View>

          {/* Single Currency Selector Dropdown */}
          <View style={{ marginTop: 12 }}>
            <AppSelect
              value={currency}
              options={currencyOptions}
              onChange={(val) => {
                setCurrency(val);
                setToast({ title: 'Devise', message: `Devise modifiée en ${val}` });
              }}
              title={language === 'fr' ? 'Sélectionner la devise principale' : 'Select Primary Currency'}
            />
          </View>

          {/* Section 5: Zone de Danger */}
          <Text style={[styles.sectionHeader, { color: '#EF4444' }]}>{language === 'fr' ? 'ZONE DE DANGER' : 'DANGER ZONE'}</Text>
          <View style={[styles.card, { borderColor: '#FEE2E2' }]}>
            <TouchableOpacity style={styles.row} onPress={handleResetApp}>
              <View style={[styles.iconWrap, { backgroundColor: '#FEF2F2' }]}>
                <Ionicons name="refresh-outline" size={20} color="#EF4444" />
              </View>
              <View style={styles.rowText}>
                <Text style={[styles.rowTitle, { color: '#EF4444' }]}>{language === 'fr' ? 'Réinitialiser les préférences' : 'Reset Preferences'}</Text>
                <Text style={styles.rowDesc}>{language === 'fr' ? 'Remettre les options par défaut' : 'Restore default settings'}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          <View style={{ height: 30 }} />
        </ScrollView>

        <BottomNavBar activeTab="More" language={language} />

        <AppToast visible={!!toast} title={toast?.title} message={toast?.message} onClose={() => setToast(null)} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAFAFC',
    paddingTop: Platform.OS === 'android' ? Math.max(StatusBar.currentHeight || 0, 44) + 6 : 14,
  },
  container: { flex: 1, backgroundColor: '#FAFAFC' },
  content: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, },
  backButton: { paddingRight: 14, paddingVertical: 4 },
  headerTitleContainer: { flex: 1 },
  pageTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 22, color: '#1A2840' },
  pageSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 13, color: '#6B7280', marginTop: 2 },
  sectionHeader: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 11, color: '#9CA3AF', letterSpacing: 0.8, marginTop: 16, marginBottom: 8, marginLeft: 4 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#F0F2F5', paddingHorizontal: 16, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 60, paddingVertical: 10 },
  divider: { height: 1, backgroundColor: '#F3F4F6' },
  iconWrap: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  rowText: { flex: 1, paddingRight: 8 },
  rowTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#1A2840' },
  rowDesc: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#6B7280', marginTop: 2 },
  langSelector: { flexDirection: 'row', backgroundColor: '#F3F4F6', borderRadius: 10, padding: 3 },
  langChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  langChipActive: { backgroundColor: '#1A2840' },
  langText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#6B7280' },
  langTextActive: { color: '#FFC759' },
  currencyDropdownCard: { backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', paddingHorizontal: 16, height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, marginBottom: 12 },
  currencyDropdownText: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: '#1A2840' },
});
