import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, Image, Linking, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import BottomNavBar from '../components/BottomNavBar';
import AppToast from '../components/AppToast';
import { useApp } from '../context/AppContext';

export default function AboutDizzitUpScreen() {
  const navigation = useNavigation();
  const { language, t } = useApp();
  const [toast, setToast] = useState(null);

  const handleBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate('MoreSettingsScreen');
  };

  const openLink = (title, url) => {
    setToast({ title, message: language === 'fr' ? `Redirection vers ${url}` : `Redirecting to ${url}` });
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
              <Text style={styles.pageTitle}>{t('aboutDizzitUp', 'About DizzitUp')}</Text>
              <Text style={styles.pageSubtitle}>{language === 'fr' ? 'À propos de notre mission & entreprise' : 'About our mission & company'}</Text>
            </View>
          </View>

          {/* Logo & Brand Header */}
          <View style={styles.brandCard}>
            <Image source={require('../../assets/brand/dizzitup_logo_cercle.png')} style={styles.logoImage} resizeMode="contain" />
            <Text style={styles.appName}>DizzitUp Mobile App</Text>
            <Text style={styles.versionText}>Version v2.4.0 (Build 2026.07)</Text>
            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Prod-Ready • Web3 & Stablecoins</Text>
            </View>
          </View>

          {/* Mission Statement */}
          <Text style={styles.sectionHeader}>{language === 'fr' ? 'NOTRE MISSION' : 'OUR MISSION'}</Text>
          <View style={styles.card}>
            <Text style={styles.missionText}>
              {language === 'fr' 
                ? "DizzitUp simplifie les paiements transfrontaliers, les envois de fonds, le e-commerce et l'accès aux stablecoins (USDT, USDC, EURC, DZY) en Afrique et dans le monde entier. Notre objectif est d'offrir des transactions instantanées, sécurisées et à frais réduits pour les particuliers et les commerçants." 
                : "DizzitUp simplifies cross-border payments, remittances, e-commerce, and access to stablecoins (USDT, USDC, EURC, DZY) across Africa and worldwide. Our mission is to offer instant, secure, low-fee transactions for individuals and merchants."}
            </Text>
          </View>

          {/* Information Links */}
          <Text style={styles.sectionHeader}>{language === 'fr' ? 'INFORMATIONS LÉGALES & SITES' : 'LEGAL INFORMATION & WEBSITES'}</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.linkRow} onPress={() => openLink('Site Web', 'https://dizzitup.com')}>
              <Ionicons name="globe-outline" size={20} color="#3B82F6" style={styles.linkIcon} />
              <Text style={styles.linkText}>{language === 'fr' ? 'Site Officiel DizzitUp (dizzitup.com)' : 'Official DizzitUp Website (dizzitup.com)'}</Text>
              <Ionicons name="open-outline" size={16} color="#9CA3AF" />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.linkRow} onPress={() => openLink('Conditions d\'utilisation', 'dizzitup.com/terms')}>
              <Ionicons name="document-text-outline" size={20} color="#10B981" style={styles.linkIcon} />
              <Text style={styles.linkText}>{language === 'fr' ? "Conditions Générales d'Utilisation" : 'Terms of Service'}</Text>
              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.linkRow} onPress={() => openLink('Politique de confidentialité', 'dizzitup.com/privacy')}>
              <Ionicons name="shield-checkmark-outline" size={20} color="#8B5CF6" style={styles.linkIcon} />
              <Text style={styles.linkText}>{language === 'fr' ? 'Politique de Confidentialité & Données' : 'Privacy & Data Policy'}</Text>
              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.linkRow} onPress={() => openLink('Licences', 'dizzitup.com/licenses')}>
              <Ionicons name="ribbon-outline" size={20} color="#F59E0B" style={styles.linkIcon} />
              <Text style={styles.linkText}>{language === 'fr' ? 'Licences & Conformité Réglementaire' : 'Licenses & Regulatory Compliance'}</Text>
              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          {/* Social Networks */}
          <Text style={styles.sectionHeader}>{language === 'fr' ? 'REJOIGNEZ LA COMMUNAUTÉ' : 'JOIN THE COMMUNITY'}</Text>
          <View style={styles.socialRow}>
            <TouchableOpacity style={styles.socialBtn} onPress={() => openLink('X / Twitter', 'x.com/dizzitup')}>
              <Ionicons name="logo-twitter" size={22} color="#1DA1F2" />
              <Text style={styles.socialName}>Twitter / X</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn} onPress={() => openLink('LinkedIn', 'linkedin.com/company/dizzitup')}>
              <Ionicons name="logo-linkedin" size={22} color="#0A66C2" />
              <Text style={styles.socialName}>LinkedIn</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn} onPress={() => openLink('Telegram', 't.me/dizzitup')}>
              <Ionicons name="paper-plane" size={22} color="#229ED9" />
              <Text style={styles.socialName}>Telegram</Text>
            </TouchableOpacity>
          </View>

          {/* Contact Support Button */}
          <TouchableOpacity style={styles.contactBtn} onPress={() => navigation.navigate('ContactUsScreen')}>
            <Ionicons name="headset-outline" size={20} color="#1A2840" style={{ marginRight: 8 }} />
            <Text style={styles.contactBtnText}>{language === 'fr' ? 'Contacter le Support Client' : 'Contact Customer Support'}</Text>
          </TouchableOpacity>

          <View style={{ height: 30 }} />
        </ScrollView>

        <BottomNavBar activeTab="More" />
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
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, },
  backButton: { paddingRight: 14, paddingVertical: 4 },
  headerTitleContainer: { flex: 1 },
  pageTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 22, color: '#1A2840' },
  pageSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 13, color: '#6B7280', marginTop: 2 },
  brandCard: { backgroundColor: '#FFFFFF', borderRadius: 18, borderWidth: 1, borderColor: '#F0F2F5', padding: 22, alignItems: 'center', marginBottom: 16 },
  logoImage: { width: 72, height: 72, marginBottom: 12 },
  appName: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 20, color: '#1A2840' },
  versionText: { fontFamily: 'Inter_500Medium', fontSize: 13, color: '#6B7280', marginTop: 2, marginBottom: 10 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECFDF5', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981', marginRight: 6 },
  statusText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#059669' },
  sectionHeader: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 11, color: '#9CA3AF', letterSpacing: 0.8, marginTop: 10, marginBottom: 8, marginLeft: 4 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#F0F2F5', paddingHorizontal: 16, paddingVertical: 14, marginBottom: 14 },
  missionText: { fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 22, color: '#4B5563' },
  linkRow: { flexDirection: 'row', alignItems: 'center', minHeight: 48, paddingVertical: 8 },
  divider: { height: 1, backgroundColor: '#F3F4F6' },
  linkIcon: { marginRight: 12 },
  linkText: { flex: 1, fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#1A2840' },
  socialRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  socialBtn: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#F0F2F5', paddingVertical: 12, alignItems: 'center', marginHorizontal: 4 },
  socialName: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#4B5563', marginTop: 4 },
  contactBtn: { height: 50, borderRadius: 14, backgroundColor: '#FFC759', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', shadowColor: '#FFC759', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 2 },
  contactBtnText: { fontFamily: 'Inter_700Bold', fontSize: 15, color: '#1A2840' },
});
